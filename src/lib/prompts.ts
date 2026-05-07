export type Platform = 'Instagram' | 'Twitter/X' | 'LinkedIn';
export type Tone = 'Minimal' | 'Aggressive' | 'Storytelling' | 'Curious' | 'Funny';
export type WordLimit = 'Short' | 'Medium' | 'Long';

const PLATFORM_CONTEXT: Record<Platform, string> = {
  Instagram:
    'Casual, visual storytelling. Emoji friendly. Hook in first line. Short sentences. Relatable and personal.',
  'Twitter/X':
    'Sharp, punchy, opinionated. No fluff. Hot takes work well. Threads style if long. Controversy drives engagement.',
  LinkedIn:
    'Professional but human. Storytelling with insight. First line must stop scroll. Data or personal experience. Thought leadership tone.',
};

const WORD_LIMIT_RANGE: Record<WordLimit, string> = {
  Short: '50-80',
  Medium: '100-150',
  Long: '200-300',
};

export function buildPrompt(platform: Platform, tone: Tone, wordLimit: WordLimit, userPrompt: string): string {
  return `Write a ${platform} post about: ${userPrompt}

Tone: ${tone}. Length: ${WORD_LIMIT_RANGE[wordLimit]} words.
Platform style: ${PLATFORM_CONTEXT[platform]}

Rules: No em dashes, no corporate words, no AI-sounding phrases. Write like a real human. Add 5 hashtags at end.

Return ONLY the post and hashtags.`;
}

export function buildHookPrompt(topic: string, platform?: string): string {
  return `Generate 8 proven hook formats for: ${topic}
${platform ? `\nPlatform: ${platform}` : ''}
Format: "1. [Hook]" on separate lines. Return ONLY the 8 hooks.`;
}

export function buildRepurposePrompt(content: string, outputFormat: string): string {
  return `Repurpose as ${outputFormat}: ${content.slice(0, 300)}
Return ONLY the ${outputFormat}.`;
}

export function buildThreadPrompt(topic: string): string {
  return `Create a 5-tweet thread on: ${topic}
Format: "1. [tweet]" on separate lines. Real, human tone.
Return ONLY the 5 tweets.`;
}
