import { NextResponse } from 'next/server';

export function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ code, error: message, ...(extra ?? {}) }, { status });
}

export function classifyGeminiError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      code: 'GEMINI_QUOTA_EXCEEDED',
      message: 'Gemini quota is exhausted for the active GEMINI_API_KEY.',
    };
  }

  if (message.includes('404') || message.includes('NotFound')) {
    return {
      status: 502,
      code: 'GEMINI_MODEL_NOT_FOUND',
      message: 'Configured Gemini model was not found. Check GEMINI_MODEL.',
    };
  }

  if (message.includes('400') || message.includes('BadRequest')) {
    return {
      status: 400,
      code: 'GEMINI_BAD_REQUEST',
      message: 'Gemini rejected the request payload.',
    };
  }

  return {
    status: 502,
    code: 'GEMINI_FAILED',
    message: 'Gemini generation failed.',
  };
}
