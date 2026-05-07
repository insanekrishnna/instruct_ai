const TOKEN_ESTIMATE_DIVISOR = 4;

export type LlmDebugPayload = {
  requestId: string;
  feature: string;
  promptPreview: string;
  promptLength: number;
  promptBytes: number;
  estimatedInputTokens: number;
  maxOutputTokens: number;
  estimatedTotalTokens: number;
  userId?: string;
  metadata?: Record<string, unknown>;
};

export function isLlmDebugEnabled() {
  return process.env.LLM_DEBUG === 'true';
}

export function estimateTokens(value: string) {
  if (!value) return 0;
  return Math.ceil(value.length / TOKEN_ESTIMATE_DIVISOR);
}

export function estimateBytes(value: string) {
  return Buffer.byteLength(value, 'utf8');
}

export function toKilobytes(bytes: number) {
  return Number((bytes / 1024).toFixed(2));
}

export function clipForLog(value: string, max = 1_500) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}... [truncated ${value.length - max} chars]`;
}

export function buildLlmDebugPayload(input: Omit<LlmDebugPayload, 'promptBytes' | 'estimatedInputTokens' | 'estimatedTotalTokens'>): LlmDebugPayload {
  const promptBytes = estimateBytes(input.promptPreview);
  const estimatedInputTokens = estimateTokens(input.promptPreview);

  return {
    ...input,
    promptBytes,
    estimatedInputTokens,
    estimatedTotalTokens: estimatedInputTokens + input.maxOutputTokens,
  };
}
