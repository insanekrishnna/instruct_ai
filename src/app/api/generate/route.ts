import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkCredits, useCredit as spendCredit } from '@/lib/credits';
import { generatePost, type GeminiUsageMetadata } from '@/lib/gemini';
import { buildLlmDebugPayload, clipForLog, isLlmDebugEnabled, toKilobytes } from '@/lib/llmDebug';
import { prisma } from '@/lib/prisma';
import { buildPrompt, buildHookPrompt, buildRepurposePrompt, buildThreadPrompt, type Platform, type Tone, type WordLimit } from '@/lib/prompts';
import { processOutput } from '@/lib/postProcessor';
import { checkRateLimit, consumeRateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const maxDuration = 60;

type GeneratedResponse = {
  body: string;
  hashtags: string[];
  wordCount: number;
  remaining: number;
  platform?: string;
  cached?: boolean;
  debug?: Record<string, unknown>;
};

function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

// Request deduplication cache: requestHash -> { result, timestamp }
const requestCache = new Map<string, { result: GeneratedResponse; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<GeneratedResponse>>();
const userActionCounts = new Map<string, { count: number; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds
const ACTION_TTL = 60_000;

function cleanupExpiredActionCounts(now: number) {
  for (const [key, value] of userActionCounts.entries()) {
    if (now - value.timestamp > ACTION_TTL) {
      userActionCounts.delete(key);
    }
  }
}

function getUserActionRequestCount(userId: string, actionId: string) {
  const now = Date.now();
  cleanupExpiredActionCounts(now);
  const key = `${userId}:${actionId}`;
  const existing = userActionCounts.get(key);
  const nextCount = (existing?.count ?? 0) + 1;
  userActionCounts.set(key, { count: nextCount, timestamp: now });
  return nextCount;
}

function hashPrompt(userId: string, feature: string, prompt: string, options: Record<string, unknown>): string {
  return JSON.stringify({
    userId,
    feature,
    prompt,
    options,
  });
}

function extractSafeOptions(rest: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(rest).filter(([, value]) => {
      if (value == null) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number' || typeof value === 'boolean') return true;
      return false;
    })
  );
}

function logDebug(label: string, payload: Record<string, unknown>) {
  if (!isLlmDebugEnabled()) return;
  console.log(`[LLM_DEBUG] ${label}`, payload);
}

function getErrorDetails(value: unknown) {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: isLlmDebugEnabled() ? value.stack : undefined,
    };
  }

  return {
    message: String(value),
  };
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
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const userActionId = req.headers.get('x-user-action-id') || requestId;

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

  const safeOptions = extractSafeOptions({
    platform,
    tone,
    wordLimit,
    ...rest,
  });
  const requestHash = hashPrompt(session.user.id, feature || 'caption', trimmedPrompt, safeOptions);
  const requestCountForAction = getUserActionRequestCount(session.user.id, userActionId);

  logDebug('request.received', {
    requestId,
    userActionId,
    requestCountForAction,
    feature: feature || 'caption',
    userId: session.user.id,
    rawBodyKeys: Object.keys((body ?? {}) as Record<string, unknown>),
    ignoredKeys: Object.keys(rest).filter((key) => !(key in safeOptions)),
  });

  const cached = requestCache.get(requestHash);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      ...cached.result,
      remaining: -1,
      cached: true,
      debug: isLlmDebugEnabled()
        ? {
            requestId,
            userActionId,
            requestCountForAction,
            cacheHit: true,
          }
        : undefined,
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

  const debugPayload = buildLlmDebugPayload({
    requestId,
    feature: feature || 'caption',
    promptPreview: clipForLog(fullPrompt),
    promptLength: fullPrompt.length,
    maxOutputTokens: 384,
    userId: session.user.id,
    metadata: {
      userActionId,
      requestCountForAction,
      safeOptions,
    },
  });

  logDebug('request.payload', {
    ...debugPayload,
    payloadKb: toKilobytes(debugPayload.promptBytes),
    messagesBeingSent: 1,
    payloadPreview: JSON.stringify([{ role: 'user', parts: [{ text: fullPrompt }] }]).slice(0, 2_000),
    exactPrompt: fullPrompt,
  });

  const existingFlight = inFlightRequests.get(requestHash);
  const generationPromise = existingFlight ?? (async () => {
    let raw: string;
    let usageMetadata: GeminiUsageMetadata | undefined;
    let providerCallNumber: number | undefined;
    try {
      const geminiResult = await generatePost(fullPrompt, { requestId, maxOutputTokens: 384 });
      raw = geminiResult.text;
      usageMetadata = geminiResult.usageMetadata;
      providerCallNumber = geminiResult.providerCallNumber;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Gemini generation failed';
      const errorDetails = getErrorDetails(e);
      logDebug('provider.error', {
        requestId,
        userActionId,
        providerCallNumber,
        error: errorDetails,
      });

      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        throw error(429, 'QUOTA_EXCEEDED', 'Gemini quota is exhausted for the active GEMINI_API_KEY. Confirm the new key is assigned to GEMINI_API_KEY, restart the dev server, and check that the key project has billing/quota enabled.', {
          retryAfter: 86400,
          requestId,
          details: isLlmDebugEnabled() ? errorDetails : undefined,
        });
      }

      throw error(500, 'GENERATION_FAILED', errorMessage, {
        requestId,
        details: isLlmDebugEnabled() ? errorDetails : undefined,
      });
    }

    const processed = feature === 'caption' || !feature
      ? processOutput(raw, wordLimit as WordLimit)
      : { body: raw, hashtags: [], wordCount: raw.split(/\s+/).length };

    const creditUse = await spendCredit(session.user.id);
    if (!creditUse.success) {
      throw error(429, 'NO_CREDITS', 'No credits remaining', { remaining: creditUse.remaining });
    }

    await consumeRateLimit(session.user.id, session.user.plan);

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

    return {
      body: processed.body,
      hashtags: processed.hashtags,
      wordCount: processed.wordCount,
      remaining: creditUse.remaining,
      ...(platform && { platform }),
      debug: isLlmDebugEnabled()
        ? {
            requestId,
            userActionId,
            requestCountForAction,
            providerCallNumber,
            estimatedInputTokens: debugPayload.estimatedInputTokens,
            estimatedTotalTokens: debugPayload.estimatedTotalTokens,
            actualPromptTokens: usageMetadata?.promptTokenCount,
            actualOutputTokens: usageMetadata?.candidatesTokenCount,
            actualTotalTokens: usageMetadata?.totalTokenCount,
            payloadKb: toKilobytes(debugPayload.promptBytes),
          }
        : undefined,
    } satisfies GeneratedResponse;
  })();

  if (!existingFlight) {
    inFlightRequests.set(requestHash, generationPromise);
  }

  try {
    const response = await generationPromise;
    requestCache.set(requestHash, { result: response, timestamp: Date.now() });
    logDebug('request.completed', {
      requestId,
      userActionId,
      requestCountForAction,
      responseWordCount: response.wordCount,
    });
    return NextResponse.json(response);
  } catch (responseError) {
    if (isNextResponse(responseError)) {
      return responseError;
    }
    const message = responseError instanceof Error ? responseError.message : 'Unexpected generation failure';
    return error(500, 'GENERATION_FAILED', message);
  } finally {
    if (!existingFlight) {
      inFlightRequests.delete(requestHash);
    }
  }
}
