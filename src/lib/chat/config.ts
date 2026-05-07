export const CHAT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';

export const CHAT_GENERATION_CONFIG = {
  temperature: 0.6,
  topP: 0.85,
  topK: 24,
  maxOutputTokens: 384,
} as const;

export const CHAT_LIMITS = {
  maxUserMessageChars: 2_000,
  maxMessageChars: 2_500,
  maxPromptChars: 8_000,
  maxInputTokens: 2_000,
  recentMessageWindow: 8,
  summaryMaxChars: 900,
  duplicateWindowMs: 10_000,
  requestGuardTtlMs: 60_000,
  streamTimeoutMs: 45_000,
} as const;

export const CHAT_SYSTEM_PROMPT = [
  'You are Capmax AI, a concise social content assistant.',
  'Write useful, specific, human-sounding responses.',
  'Avoid filler, hidden reasoning, and repeated context.',
  'If the user asks for a caption, return only the caption and relevant hashtags.',
].join(' ');

export function isChatDebugEnabled() {
  return process.env.LLM_DEBUG === 'true' || process.env.CHAT_DEBUG === 'true';
}
