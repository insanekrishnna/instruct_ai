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
  platform: Platform;
  tone: Tone;
  wordLimit: WordLimit;
  prompt: string;
};

function error(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, code, ...(extra ?? {}) }, { status });
}

function isPlatform(v: unknown): v is Platform {
  return v === 'Instagram' || v === 'Twitter/X' || v === 'LinkedIn';
}
function isTone(v: unknown): v is Tone {
  return v === 'Minimal' || v === 'Aggressive' || v === 'Storytelling' || v === 'Curious' || v === 'Funny';
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

  const { platform, tone, wordLimit, prompt } = (body ?? {}) as Partial<GenerateBody>;
  if (!isPlatform(platform) || !isTone(tone) || !isWordLimit(wordLimit) || typeof prompt !== 'string') {
    return error(400, 'INVALID_INPUT', 'Invalid request body');
  }
  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length < 3 || trimmedPrompt.length > 2000) {
    return error(400, 'INVALID_INPUT', 'Prompt length must be between 3 and 2000 characters');
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

  const fullPrompt = buildPrompt(platform, tone, wordLimit, trimmedPrompt);

  let raw: string;
  try {
    raw = await generatePost(fullPrompt);
  } catch (e) {
    return error(500, 'GENERATION_FAILED', e instanceof Error ? e.message : 'Gemini generation failed');
  }

  const processed = processOutput(raw, wordLimit);

  const creditUse = await spendCredit(session.user.id);
  if (!creditUse.success) {
    return error(429, 'NO_CREDITS', 'No credits remaining', { remaining: creditUse.remaining });
  }

  await consumeRateLimit(session.user.id, session.user.plan);

  // Persist generation; keep only last 3 per user.
  await prisma.$transaction(async (tx) => {
    await tx.generation.create({
      data: {
        userId: session.user.id,
        platform,
        tone,
        wordLimit,
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

  return NextResponse.json({
    body: processed.body,
    hashtags: processed.hashtags,
    wordCount: processed.wordCount,
    remaining: creditUse.remaining,
    platform,
  });
}
