import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkCredits, useCredit as spendCredit } from '@/lib/credits';
import { checkRateLimit, consumeRateLimit } from '@/lib/ratelimit';
import { classifyGeminiError, jsonError } from '@/lib/chat/errors';
import { streamGeminiChat } from '@/lib/chat/geminiChatService';
import { errorToLog, chatLogger } from '@/lib/chat/logger';
import { buildMessagesFromBody, prepareChatPayload } from '@/lib/chat/memory';
import {
  buildRequestFingerprint,
  clearInFlight,
  getDuplicatePromise,
  setInFlight,
  trackRequestCount,
} from '@/lib/chat/requestGuard';
import { createSseStream, sseResponse } from '@/lib/chat/sse';
import type { ChatRequestBody, ChatUsage } from '@/lib/chat/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

async function parseBody(req: Request): Promise<ChatRequestBody | null> {
  try {
    const parsed = await req.json();
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function validateRequest(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: jsonError(401, 'UNAUTHORIZED', 'Not logged in') };
  }

  const body = await parseBody(req);
  if (!body) {
    return { error: jsonError(400, 'INVALID_INPUT', 'Invalid JSON body') };
  }

  const messages = buildMessagesFromBody(body.messages, body.message);
  if (messages.length === 0) {
    return { error: jsonError(400, 'INVALID_INPUT', 'Send at least one user message') };
  }

  const creditCheck = await checkCredits(session.user.id);
  if (!creditCheck.allowed) {
    return { error: jsonError(429, 'NO_CREDITS', 'No credits remaining', { remaining: creditCheck.remaining }) };
  }

  const rateLimit = await checkRateLimit(session.user.id, session.user.plan);
  if (!rateLimit.allowed) {
    return { error: jsonError(429, 'RATE_LIMITED', 'Too many requests', { remaining: rateLimit.remaining }) };
  }

  return { session, body, messages };
}

export async function POST(req: Request) {
  const validated = await validateRequest(req);
  if ('error' in validated) return validated.error;

  const { session, body, messages } = validated;
  const requestId = body.requestId || req.headers.get('x-request-id') || crypto.randomUUID();
  const userActionId = req.headers.get('x-user-action-id') || requestId;
  const requestCount = trackRequestCount(session.user.id, userActionId);
  const fingerprint = buildRequestFingerprint(session.user.id, messages);
  const duplicate = getDuplicatePromise(fingerprint);

  if (requestCount > 1) {
    chatLogger.warn('request.action_replay_blocked', {
      requestId,
      userActionId,
      requestCount,
      userId: session.user.id,
    });
    return jsonError(409, 'USER_ACTION_REPLAY', 'This user action was already submitted.', {
      requestId,
      requestCount,
    });
  }

  if (duplicate) {
    chatLogger.warn('request.duplicate_blocked', {
      requestId,
      userActionId,
      requestCount,
      userId: session.user.id,
    });
    return jsonError(409, 'DUPLICATE_IN_FLIGHT', 'A matching chat request is already running.', {
      requestId,
      requestCount,
    });
  }

  const payload = prepareChatPayload(requestId, messages);
  const startedAt = Date.now();
  let completionResolve: (() => void) | undefined;
  const completion = new Promise<void>((resolve) => {
    completionResolve = resolve;
  });
  setInFlight(fingerprint, completion);

  chatLogger.info('request.start', {
    requestId,
    userActionId,
    requestCount,
    userId: session.user.id,
    payloadBytes: payload.payloadBytes,
    estimatedInputTokens: payload.estimatedInputTokens,
    memory: payload.memory,
  });

  const runGeneration = async (onToken: (token: string) => void) => {
    let responseText = '';
    let finalUsage: ChatUsage | undefined;

    try {
      for await (const chunk of streamGeminiChat(payload)) {
        if (req.signal.aborted) {
          chatLogger.warn('request.aborted', { requestId, durationMs: Date.now() - startedAt });
          break;
        }

        if (chunk.text) {
          responseText += chunk.text;
          onToken(chunk.text);
        }

        if (chunk.usage) {
          finalUsage = chunk.usage;
        }
      }

      await spendCredit(session.user.id);
      await consumeRateLimit(session.user.id, session.user.plan);

      chatLogger.info('request.complete', {
        requestId,
        userActionId,
        durationMs: Date.now() - startedAt,
        responseChars: responseText.length,
        usage: finalUsage,
      });

      return { responseText, finalUsage };
    } catch (error) {
      const classified = classifyGeminiError(error);
      chatLogger.error('request.failed', {
        requestId,
        userActionId,
        durationMs: Date.now() - startedAt,
        error: errorToLog(error),
      });
      throw Object.assign(new Error(classified.message), classified);
    } finally {
      completionResolve?.();
      clearInFlight(fingerprint);
    }
  };

  if (body.stream === false) {
    try {
      const result = await runGeneration(() => undefined);
      return NextResponse.json({
        requestId,
        message: { role: 'assistant', content: result.responseText },
        usage: result.finalUsage,
        memory: payload.memory,
      });
    } catch (error) {
      const status = typeof (error as { status?: unknown }).status === 'number' ? (error as { status: number }).status : 502;
      const code = typeof (error as { code?: unknown }).code === 'string' ? (error as { code: string }).code : 'CHAT_FAILED';
      return jsonError(status, code, error instanceof Error ? error.message : 'Chat failed', { requestId });
    }
  }

  const stream = createSseStream(async (writer) => {
    writer.write('meta', {
      requestId,
      requestCount,
      estimatedInputTokens: payload.estimatedInputTokens,
      payloadBytes: payload.payloadBytes,
      memory: payload.memory,
    });

    try {
      const result = await runGeneration((token) => writer.write('token', { token }));
      writer.write('usage', result.finalUsage ?? null);
      writer.close();
    } catch (error) {
      const status = typeof (error as { status?: unknown }).status === 'number' ? (error as { status: number }).status : 502;
      const code = typeof (error as { code?: unknown }).code === 'string' ? (error as { code: string }).code : 'CHAT_FAILED';
      writer.error({
        requestId,
        status,
        code,
        error: error instanceof Error ? error.message : 'Chat failed',
      });
    }
  });

  return sseResponse(stream);
}
