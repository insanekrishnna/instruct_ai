import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkCredits, useCredit as spendCredit } from '@/lib/credits';
import { generatePost } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { buildPrompt, buildHookPrompt, buildRepurposePrompt, buildThreadPrompt, type Platform, type Tone, type WordLimit } from '@/lib/prompts';
import { processOutput } from '@/lib/postProcessor';
import { checkRateLimit, consumeRateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Request deduplication cache: promptHash -> { result, timestamp }
const requestCache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds

function hashPrompt(feature: string, prompt: string): string {
  return `${feature}:${prompt}`;
}

type GenerateBody = {
  feature?: string;
  platform?: Platform;
  tone?: Tone;
  wordLimit?: WordLimit;
  prompt: string;
  [key: string]: unknown;
};

function error(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, code, ...(extra ?? {}) }, { status });
}

function isPlatform(v: unknown): v is Platform {
  return v === 'Instagram' || v === 'Twitter/X' || v === 'LinkedIn';
}
function isTone(v: unknown): v is Tone {
  return v === 'Minimal' || v === 'Aggressive' || v === 'Storytelling' || v === 'Curious' || v === 'Funny' || v === 'Ragebait' || v === 'Emotional';
}
function isWordLimit(v: unknown): v is WordLimit {
  return v === 'Short' || v === 'Medium' || v === 'Long';
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return error(401, 'UNAUTHORIZED', 'Not logged in');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error(400, 'INVALID_INPUT', 'Invalid JSON body');
  }

  const { feature, platform, tone, wordLimit, prompt, ...rest } = (body ?? {}) as Partial<GenerateBody>;
  
  if (typeof prompt !== 'string') {
    return error(400, 'INVALID_INPUT', 'Missing prompt');
  }
  
  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length < 3 || trimmedPrompt.length > 500) {
    return error(400, 'INVALID_INPUT', 'Prompt too long, max 500 characters');
  }

  // For caption feature, validate required fields
  if (feature === 'caption' || !feature) {
    if (!isPlatform(platform) || !isTone(tone) || !isWordLimit(wordLimit)) {
      return error(400, 'INVALID_INPUT', 'Caption requires platform, tone, and wordLimit');
    }
  }

  const creditCheck = await checkCredits(session.user.id);
  if (!creditCheck.allowed) {
    const status = creditCheck.reason === 'PLAN_EXPIRED' ? 402 : 429;
    const code = creditCheck.reason === 'PLAN_EXPIRED' ? 'PLAN_EXPIRED' : 'NO_CREDITS';
    return error(status, code, 'No credits remaining', { remaining: creditCheck.remaining });
  }

  // Speed-layer rate limit (DB is source of truth).
  const rl = await checkRateLimit(session.user.id, session.user.plan);
  if (!rl.allowed) {
    return error(429, 'RATE_LIMITED', 'Too many requests', { remaining: rl.remaining });
  }

  // Check for mock mode OR if quota is exhausted
  const isMock = process.env.NODE_ENV === 'development' && process.env.MOCK_GEMINI === 'true';

  // Request deduplication: check if we have a cached result for this exact request (works in all environments)
  const requestHash = hashPrompt(feature || 'caption', trimmedPrompt);
  const cached = requestCache.get(requestHash);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      body: cached.result,
      hashtags: [],
      wordCount: cached.result.split(/\s+/).length,
      remaining: -1,
      cached: true,
    });
  }

  let fullPrompt: string;
  if (feature === 'caption' || !feature) {
    // Caption generation with buildPrompt
    fullPrompt = buildPrompt(platform as Platform, tone as Tone, wordLimit as WordLimit, trimmedPrompt);
  } else if (feature === 'hook') {
    // Hook generation with optimized prompt
    fullPrompt = buildHookPrompt(trimmedPrompt, platform as string);
  } else if (feature === 'repurpose') {
    // Repurpose with optimized prompt
    const outputFormat = (body as any)?.outputFormat || 'Instagram caption';
    fullPrompt = buildRepurposePrompt(trimmedPrompt, outputFormat);
  } else if (feature === 'thread') {
    // Thread generation with optimized prompt
    fullPrompt = buildThreadPrompt(trimmedPrompt);
  } else {
    // Default: use prompt as-is
    fullPrompt = trimmedPrompt;
  }

  let raw: string;
  try {
    raw = await generatePost(fullPrompt);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Gemini generation failed';
    
    // Check if this is a quota error and provide helpful message
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return error(429, 'QUOTA_EXCEEDED', 'Gemini API quota exhausted. Please try again tomorrow or set MOCK_GEMINI=true in .env.local for development.', {
        retryAfter: 86400, // 24 hours
      });
    }
    
    return error(500, 'GENERATION_FAILED', errorMessage);
  }

  const processed = feature === 'caption' || !feature 
    ? processOutput(raw, wordLimit as WordLimit)
    : { body: raw, hashtags: [], wordCount: raw.split(/\s+/).length };

  const creditUse = await spendCredit(session.user.id);
  if (!creditUse.success) {
    return error(429, 'NO_CREDITS', 'No credits remaining', { remaining: creditUse.remaining });
  }

  await consumeRateLimit(session.user.id, session.user.plan);

  // Cache the raw output for deduplication (works in all environments to prevent duplicate calls)
  requestCache.set(requestHash, { result: processed.body, timestamp: Date.now() });

  // Persist generation for captions only; keep only last 3 per user.
  if (feature === 'caption' || !feature) {
    await prisma.$transaction(async (tx) => {
      await tx.generation.create({
        data: {
          userId: session.user.id,
          platform: platform as Platform,
          tone: tone as Tone,
          wordLimit: wordLimit as WordLimit,
          prompt: trimmedPrompt,
          output: processed.body,
          hashtags: processed.hashtags.join(' '),
        },
      });

      const all = await tx.generation.findMany({
        where: { userId: session.user.id },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });
      const toDelete = all.slice(3).map((g) => g.id);
      if (toDelete.length > 0) {
        await tx.generation.deleteMany({ where: { id: { in: toDelete } } });
      }
    });
  }

  return NextResponse.json({
    body: processed.body,
    hashtags: processed.hashtags,
    wordCount: processed.wordCount,
    remaining: creditUse.remaining,
    ...(platform && { platform }),
  });
}
