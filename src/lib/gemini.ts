import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = "gemini-2.0-flash";

const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

let keyIndex = 0;

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

async function generateOnce(prompt: string): Promise<string> {
  if (process.env.NODE_ENV === 'development' && process.env.MOCK_GEMINI === 'true') {
    await new Promise((r) => setTimeout(r, 1000));
    return `Just had the most underrated realization.

The people who talk the least about what they are building are usually the ones shipping the most.

Silence is a strategy. Not everyone needs to see your process.

#buildinpublic #startuplife #creatoreconomy #capmax #viral`;
  }

  if (API_KEYS.length === 0) throw new Error('No GEMINI_API_KEY configured');

  const apiKey = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex += 1;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
    },
  });

  const res = await model.generateContent(prompt);
  return res.response.text();
}

export async function generatePost(prompt: string): Promise<string> {
  try {
    return await withTimeout(generateOnce(prompt), 30_000);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes('429') ||
      message.includes('quota') ||
      message.includes('RESOURCE_EXHAUSTED')
    ) {
      throw err;
    }
    return await withTimeout(generateOnce(prompt), 30_000);
  }
}