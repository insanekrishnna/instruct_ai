import { CHAT_LIMITS, CHAT_SYSTEM_PROMPT } from './config';
import { enforcePromptBudget, trimText } from './tokens';
import type { ChatMessage, PreparedChatPayload } from './types';

function normalizeRole(role: unknown): ChatMessage['role'] | null {
  return role === 'system' || role === 'user' || role === 'assistant' ? role : null;
}

export function normalizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((message) => {
    if (!message || typeof message !== 'object') return [];
    const candidate = message as Record<string, unknown>;
    const role = normalizeRole(candidate.role);
    const content = typeof candidate.content === 'string' ? candidate.content : '';
    if (!role || !content.trim()) return [];

    const trimmed = trimText(content, CHAT_LIMITS.maxMessageChars);
    return [{
      role,
      content: trimmed.text,
      id: typeof candidate.id === 'string' ? candidate.id : undefined,
      createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : undefined,
    }];
  });
}

export function buildMessagesFromBody(messages: unknown, message: unknown) {
  const normalized = normalizeMessages(messages);
  if (normalized.length > 0) return normalized;

  if (typeof message === 'string' && message.trim()) {
    const trimmed = trimText(message, CHAT_LIMITS.maxUserMessageChars);
    return [{ role: 'user' as const, content: trimmed.text }];
  }

  return [];
}

function dedupeMessages(messages: ChatMessage[]) {
  let removedDuplicates = 0;
  const deduped: ChatMessage[] = [];
  let previousKey = '';

  for (const message of messages) {
    const key = `${message.role}:${message.content.trim().toLowerCase()}`;
    if (key === previousKey) {
      removedDuplicates += 1;
      continue;
    }

    deduped.push(message);
    previousKey = key;
  }

  return { messages: deduped, removedDuplicates };
}

function summarizeOldMessages(messages: ChatMessage[]) {
  const recent = messages.slice(-CHAT_LIMITS.recentMessageWindow);
  const old = messages.slice(0, Math.max(0, messages.length - CHAT_LIMITS.recentMessageWindow));

  if (old.length === 0) {
    return { messages: recent, summarizedMessages: 0 };
  }

  const compactSummary = old
    .map((message) => `${message.role}: ${message.content}`)
    .join(' ')
    .replace(/\s+/g, ' ')
    .slice(0, CHAT_LIMITS.summaryMaxChars)
    .trim();

  return {
    messages: [
      {
        role: 'system' as const,
        content: `Earlier conversation summary: ${compactSummary}`,
      },
      ...recent,
    ],
    summarizedMessages: old.length,
  };
}

function renderPrompt(messages: ChatMessage[]) {
  return [
    `System: ${CHAT_SYSTEM_PROMPT}`,
    ...messages.map((message) => `${message.role[0].toUpperCase()}${message.role.slice(1)}: ${message.content}`),
    'Assistant:',
  ].join('\n');
}

export function prepareChatPayload(requestId: string, rawMessages: ChatMessage[]): PreparedChatPayload {
  const originalMessages = rawMessages.length;
  const deduped = dedupeMessages(rawMessages);
  const summarized = summarizeOldMessages(deduped.messages);
  const rendered = renderPrompt(summarized.messages);
  const budgeted = enforcePromptBudget(rendered);

  return {
    requestId,
    messages: summarized.messages,
    prompt: budgeted.prompt,
    estimatedInputTokens: budgeted.estimatedInputTokens,
    payloadBytes: Buffer.byteLength(budgeted.prompt, 'utf8'),
    memory: {
      originalMessages,
      sentMessages: summarized.messages.length,
      removedDuplicates: deduped.removedDuplicates,
      summarizedMessages: summarized.summarizedMessages,
      trimmedChars: budgeted.trimmedChars,
    },
  };
}
