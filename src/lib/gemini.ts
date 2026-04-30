import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = 'gemini-1.5-flash';

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

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
  } catch {
    // Retry once for transient failures.
    return await withTimeout(generateOnce(prompt), 30_000);
  }
}

