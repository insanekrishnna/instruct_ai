import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const DEFAULT_MAX_OUTPUT_TOKENS = 384;

let geminiRequestCount = 0;

export type GeminiGenerateOptions = {
  requestId?: string;
  maxOutputTokens?: number;
};

export type GeminiUsageMetadata = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  [key: string]: unknown;
};

export type GeminiGenerateResult = {
  text: string;
  usageMetadata?: GeminiUsageMetadata;
  providerCallNumber: number;
};

function getApiKeyFingerprint(apiKey: string) {
  return apiKey.length >= 6 ? `*${apiKey.slice(-6)}` : '*short-key';
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('Gemini request timed out')), ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (err) => {
        clearTimeout(id);
        reject(err);
      }
    );
  });
}

function logGeminiCallStart(providerCallNumber: number, prompt: string, options: GeminiGenerateOptions) {
  console.log('\n======================');
  console.log('Gemini Call:', providerCallNumber);
  console.log('Request ID:', options.requestId ?? 'unknown');
  console.log('Model:', MODEL);
  console.log('Time:', new Date().toISOString());
  console.log('Payload chars:', JSON.stringify(prompt).length);
  console.log('======================\n');
}

function logGeminiUsage(providerCallNumber: number, usageMetadata: GeminiUsageMetadata | undefined) {
  console.log('[Gemini Usage]', JSON.stringify({
    providerCallNumber,
    usageMetadata: usageMetadata ?? null,
  }, null, 2));
}

async function generateOnce(prompt: string, options: GeminiGenerateOptions = {}): Promise<GeminiGenerateResult> {
  const providerCallNumber = ++geminiRequestCount;
  logGeminiCallStart(providerCallNumber, prompt, options);

  if (process.env.NODE_ENV === 'development' && process.env.MOCK_GEMINI === 'true') {
    await new Promise((r) => setTimeout(r, 1000));
    const text = `Just had the most underrated realization.

The people who talk the least about what they are building are usually the ones shipping the most.

Silence is a strategy. Not everyone needs to see your process.

#buildinpublic #startuplife #creatoreconomy #capmax #viral`;
    const usageMetadata = {
      promptTokenCount: Math.ceil(prompt.length / 4),
      candidatesTokenCount: Math.ceil(text.length / 4),
      totalTokenCount: Math.ceil((prompt.length + text.length) / 4),
      mock: true,
    };
    logGeminiUsage(providerCallNumber, usageMetadata);
    return { text, usageMetadata, providerCallNumber };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No GEMINI_API_KEY configured');
  console.log('API key fingerprint:', getApiKeyFingerprint(apiKey));

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 32,
      maxOutputTokens: options.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
    },
  });

  const res = await model.generateContent(prompt);
  const usageMetadata = res.response.usageMetadata as GeminiUsageMetadata | undefined;
  logGeminiUsage(providerCallNumber, usageMetadata);
  return {
    text: res.response.text(),
    usageMetadata,
    providerCallNumber,
  };
}

export async function generatePost(prompt: string, options: GeminiGenerateOptions = {}): Promise<GeminiGenerateResult> {
  return await withTimeout(generateOnce(prompt, options), 30_000);
}
