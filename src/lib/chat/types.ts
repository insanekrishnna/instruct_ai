export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  id?: string;
  createdAt?: string;
};

export type ChatRequestBody = {
  messages?: ChatMessage[];
  message?: string;
  requestId?: string;
  stream?: boolean;
};

export type PreparedChatPayload = {
  requestId: string;
  messages: ChatMessage[];
  prompt: string;
  estimatedInputTokens: number;
  payloadBytes: number;
  memory: {
    originalMessages: number;
    sentMessages: number;
    removedDuplicates: number;
    summarizedMessages: number;
    trimmedChars: number;
  };
};

export type ChatUsage = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
};
