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

const TONE_DEFINITION: Record<Tone, string> = {
  Minimal: 'Clean, no fluff, every word earns its place, white space friendly',
  Aggressive: 'Bold claims, confrontational, no apologies, strong opinions',
  Storytelling: 'Narrative arc, personal experience, beginning-middle-end, emotional',
  Curious: 'Questions that make people think, open loops, wonder-driven',
  Funny: 'Wit, timing, unexpected twist, relatable absurdity, self aware',
};

const WORD_LIMIT_RANGE: Record<WordLimit, string> = {
  Short: '50-80',
  Medium: '100-150',
  Long: '200-300',
};

export function buildPrompt(platform: Platform, tone: Tone, wordLimit: WordLimit, userPrompt: string): string {
  const platformContext = PLATFORM_CONTEXT[platform];
  const toneDefinition = TONE_DEFINITION[tone];
  const wordLimitRange = WORD_LIMIT_RANGE[wordLimit];

  return `You are a world-class social media copywriter who has gone viral multiple times.
You write for real humans, not algorithms.

Task: Write a ${platform} post

Platform rules: ${platformContext}
Tone: ${tone} -- ${toneDefinition}
Length: ${wordLimit} (${wordLimitRange} words)
Topic: ${userPrompt}

CRITICAL RULES -- FOLLOW STRICTLY:
1. NEVER start with "In today's world" or "In the age of AI"
2. NEVER use em dashes (--)
3. NEVER write in bullet points unless platform demands it
4. NEVER sound like ChatGPT wrote it
5. NEVER use corporate buzzwords: leverage, synergy, utilize, pivot, disrupt
6. NEVER be generic -- every line must feel specific and intentional
7. DO write like a real person with opinions
8. DO use micro-storytelling -- even in short posts
9. DO vary sentence length -- mix short punchy lines with longer ones
10. DO include one unexpected angle or perspective
11. DO make the first line impossible to scroll past
12. DO sound like the user wrote it themselves after thinking hard

Anti-AI patterns to actively avoid:
- Perfect grammar throughout (add natural flow)
- Over-structured writing
- Hedging language ("it's important to note that")
- Fake enthusiasm ("I'm excited to share")
- Lists disguised as paragraphs

After the post, on a new line add exactly 5 relevant hashtags.
Format: #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5

Return ONLY the post and hashtags. Nothing else. No explanations.`;
}
