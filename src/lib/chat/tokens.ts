import { CHAT_LIMITS } from './config';

const APPROX_CHARS_PER_TOKEN = 4;

export function estimateTokens(text: string) {
  return Math.ceil(text.length / APPROX_CHARS_PER_TOKEN);
}

export function byteSize(text: string) {
  return Buffer.byteLength(text, 'utf8');
}

export function trimText(text: string, maxChars: number) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxChars) {
    return { text: clean, trimmedChars: 0 };
  }

  return {
    text: clean.slice(0, maxChars).trim(),
    trimmedChars: clean.length - maxChars,
  };
}

export function enforcePromptBudget(prompt: string) {
  const estimated = estimateTokens(prompt);
  if (prompt.length <= CHAT_LIMITS.maxPromptChars && estimated <= CHAT_LIMITS.maxInputTokens) {
    return {
      prompt,
      estimatedInputTokens: estimated,
      trimmedChars: 0,
    };
  }

  const maxByToken = CHAT_LIMITS.maxInputTokens * APPROX_CHARS_PER_TOKEN;
  const maxChars = Math.min(CHAT_LIMITS.maxPromptChars, maxByToken);
  const trimmed = trimText(prompt, maxChars);

  return {
    prompt: trimmed.text,
    estimatedInputTokens: estimateTokens(trimmed.text),
    trimmedChars: trimmed.trimmedChars,
  };
}
