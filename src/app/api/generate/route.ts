import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkCredits, useCredit as spendCredit } from '@/lib/credits';
import { generatePost } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { buildPrompt, type Platform, type Tone, type WordLimit } from '@/lib/prompts';
import { processOutput } from '@/lib/postProcessor';
import { checkRateLimit, consumeRateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const maxDuration = 60;

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
  if (trimmedPrompt.length < 3 || trimmedPrompt.length > 2000) {
    return error(400, 'INVALID_INPUT', 'Prompt length must be between 3 and 2000 characters');
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

  let fullPrompt: string;
  if (feature === 'caption' || !feature) {
    // Caption generation with buildPrompt
    fullPrompt = buildPrompt(platform as Platform, tone as Tone, wordLimit as WordLimit, trimmedPrompt);
  } else {
    // For other features, use prompt as-is with minimal processing
    fullPrompt = trimmedPrompt;
  }

  let raw: string;
  try {
    raw = await generatePost(fullPrompt);
  } catch (e) {
    return error(500, 'GENERATION_FAILED', e instanceof Error ? e.message : 'Gemini generation failed');
  }

  const processed = feature === 'caption' || !feature 
    ? processOutput(raw, wordLimit as WordLimit)
    : { body: raw, hashtags: [], wordCount: raw.split(/\s+/).length };

  const creditUse = await spendCredit(session.user.id);
  if (!creditUse.success) {
    return error(429, 'NO_CREDITS', 'No credits remaining', { remaining: creditUse.remaining });
  }

  await consumeRateLimit(session.user.id, session.user.plan);

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
