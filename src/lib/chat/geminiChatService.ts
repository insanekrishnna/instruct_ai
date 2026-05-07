import { GoogleGenerativeAI } from '@google/generative-ai';
import { CHAT_GENERATION_CONFIG, CHAT_LIMITS, CHAT_MODEL } from './config';
import { chatLogger } from './logger';
import { estimateTokens } from './tokens';
import type { ChatUsage, PreparedChatPayload } from './types';

let geminiCallCount = 0;

function apiKeyFingerprint(apiKey: string) {
  return apiKey.length >= 6 ? `*${apiKey.slice(-6)}` : '*short-key';
}

export type StreamChunk = {
  text: string;
  usage?: ChatUsage;
};

async function nextWithTimeout<T>(iterator: AsyncIterator<T>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      iterator.next(),
      new Promise<IteratorResult<T>>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Gemini stream timed out')), CHAT_LIMITS.streamTimeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function* streamGeminiChat(payload: PreparedChatPayload): AsyncGenerator<StreamChunk> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No GEMINI_API_KEY configured');
  }

  const providerCallNumber = ++geminiCallCount;
  const startedAt = Date.now();
  let output = '';

  chatLogger.info('gemini.call.start', {
    requestId: payload.requestId,
    providerCallNumber,
    model: CHAT_MODEL,
    payloadBytes: payload.payloadBytes,
    estimatedInputTokens: payload.estimatedInputTokens,
    apiKeyFingerprint: apiKeyFingerprint(apiKey),
  });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL,
    generationConfig: CHAT_GENERATION_CONFIG,
  });

  const result = await model.generateContentStream(payload.prompt);
  const iterator = result.stream[Symbol.asyncIterator]();

  while (true) {
    const next = await nextWithTimeout(iterator);
    if (next.done) break;
    const chunk = next.value;
    const text = chunk.text();
    if (!text) continue;
    output += text;
    yield { text };
  }

  const response = await result.response;
  const usageMetadata = response.usageMetadata;
  const estimatedOutputTokens = estimateTokens(output);

  const usage: ChatUsage = {
    promptTokenCount: usageMetadata?.promptTokenCount,
    candidatesTokenCount: usageMetadata?.candidatesTokenCount,
    totalTokenCount: usageMetadata?.totalTokenCount,
    estimatedInputTokens: payload.estimatedInputTokens,
    estimatedOutputTokens,
  };

  chatLogger.info('gemini.call.complete', {
    requestId: payload.requestId,
    providerCallNumber,
    durationMs: Date.now() - startedAt,
    outputChars: output.length,
    usage,
  });

  yield { text: '', usage };
}
