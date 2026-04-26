import type { CaptionStyle, Feature, GenerateApiRequest, Niche, OutputFormat, Platform, ThreadType } from './types';

const STYLE_DESCRIPTIONS: Record<CaptionStyle, string> = {
  Aggressive: 'Bold, confrontational, designed to provoke engagement through strong opinions',
  Ragebait: 'Inflammatory, controversy-baiting, designed to trigger emotional reactions',
  Emotional: 'Heartfelt, vulnerable, connecting through genuine emotions and personal experiences',
  Funny: 'Humorous, witty, using comedy and clever wordplay for engagement',
  Normal: 'Conversational, straightforward, professional yet friendly tone',
};

const FORMAT_DESCRIPTIONS: Record<OutputFormat, string> = {
  'Instagram caption': 'Short, engaging, emoji-rich caption with relevant hashtags',
  'Twitter thread': 'Numbered tweets (1/, 2/, etc), punchy lines, fits character limit',
  'LinkedIn post': 'Professional yet engaging, longer form, thought-leadership focused',
  'Carousel script': 'Slide-by-slide breakdown for Instagram carousel posts',
};

export function buildCaptionPrompt(req: GenerateApiRequest): string {
  const styleDesc = req.style ? STYLE_DESCRIPTIONS[req.style] : STYLE_DESCRIPTIONS.Normal;
  const hinglishNote = req.hinglish ? '\n- Mix English with Hindi/Hinglish (e.g., "Ye wala cheez", "Dikkat hain", etc.)' : '';
  const wordLimitNote = req.wordLimit ? `\n- Keep it under ${req.wordLimit} words` : '\n- Keep it under 100 words';
  const niches = req.userProfile?.niche ? `\nUser's niche: ${req.userProfile.niche}` : '';

  return `You are a viral content creator expert. Generate a highly engaging Instagram/social media caption.

${niches}
User input: "${req.prompt}"

Requirements:
- Style: ${req.style || 'Normal'} - ${styleDesc}${wordLimitNote}${hinglishNote}
- Include 3-5 relevant hashtags that match the content
- Make it scroll-stopping and engagement-driving
${req.abVariant ? '\n\nGenerate TWO different versions (version A and version B) with slightly different angles.' : ''}

${req.imageBase64 ? '\nNote: User has also uploaded an image - reference it if relevant to make the caption more contextual.' : ''}

Output format:
${req.abVariant ? 'VERSION A:\n[caption]\n\nVERSION B:\n[caption]' : '[caption]'}`;
}

export function buildHookPrompt(req: GenerateApiRequest): string {
  const platformNote = req.platform ? `for ${req.platform}` : 'for social media';
  const niches = req.userProfile?.niche ? `\nUser's niche: ${req.userProfile.niche}` : '';

  return `You are a hook-writing expert. Generate 8 different attention-grabbing hooks ${platformNote}.

${niches}
Topic/Niche: "${req.topic || req.prompt}"

Create hooks in these proven formats:
1. "Hot take:" format
2. "Nobody tells you:" format
3. "POV:" format
4. "Unpopular opinion:" format
5. "This changed my life:" format
6. "[Number] mistakes:" format
7. "You're probably doing this wrong:" format
8. "Most people don't know:" format

Each hook should be 1-2 lines, punchy, and designed to make people stop scrolling.
Number them 1-8 and separate with newlines.

Make them specific to the ${req.userProfile?.niche || 'general'} niche.`;
}

export function buildRepurposePrompt(req: GenerateApiRequest): string {
  const formatDesc = req.outputFormat ? FORMAT_DESCRIPTIONS[req.outputFormat] : 'a caption';
  const niches = req.userProfile?.niche ? `\nCreator's niche: ${req.userProfile.niche}` : '';

  return `You are a content repurposing expert. Transform the following content into ${formatDesc}.

${niches}

Original content:
"""
${req.prompt}
"""

Requirements:
- Maintain the core message and value
- Optimize for the target platform
- Include relevant hashtags
- Keep tone consistent with original
- Make it platform-native (different length/style for Instagram vs Twitter vs LinkedIn)

Output only the repurposed content, ready to post.`;
}

export function buildThreadPrompt(req: GenerateApiRequest): string {
  const threadType = req.threadType || 'Twitter thread';
  const niches = req.userProfile?.niche ? `\nCreator's niche: ${req.userProfile.niche}` : '';

  return `You are an expert thread writer. Create an engaging ${threadType}.

${niches}
Topic: "${req.prompt}"

${threadType === 'Twitter thread' ? `Requirements:
- Start with a strong hook tweet
- Each subsequent tweet expands on previous thought
- Use 1/, 2/, 3/ numbering
- Keep each tweet punchy (under 280 chars guideline)
- End with a call-to-action or thought-provoking closing
- 5-8 tweets total
- Add a "Source/Inspiration" or "Next read" link hint at the end` : `Requirements:
- Create a carousel script for Instagram
- 5-8 slides (one per line, numbered)
- Each slide should have a headline and 1-2 sentences of copy
- Use hooks and transitions between slides
- Include emoji suggestions for visual breaks
- Last slide includes CTA (link in bio, DM, follow, etc.)`}

Format:
${threadType === 'Twitter thread' ? '1/ [First tweet]\n2/ [Second tweet]\n...' : '📌 SLIDE 1\nHeadline\nCopy here\n\n📌 SLIDE 2\n...'}`;
}

export async function callGeminiAPI(
  apiKey: string,
  prompt: string,
  imageBase64?: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  if (imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
    const mimeType = imageBase64.includes('png') ? 'image/png' : 'image/jpeg';

    const response = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
      prompt,
    ]);

    return response.response.text();
  } else {
    const response = await model.generateContent(prompt);
    return response.response.text();
  }
}

export function calculateEngagementScore(content: string): number {
  // Simple heuristic-based scoring
  let score = 50; // Base score

  // Emojis add points
  const emojiCount = (content.match(/[\p{Emoji}]/gu) || []).length;
  score += Math.min(emojiCount * 3, 15);

  // Hashtags add points
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  score += Math.min(hashtagCount * 2, 10);

  // Questions add points (engagement driver)
  const questionCount = (content.match(/\?/g) || []).length;
  score += Math.min(questionCount * 5, 15);

  // Exclamation marks add points
  const exclamationCount = (content.match(/!/g) || []).length;
  score += Math.min(exclamationCount * 2, 10);

  // All caps words (used sparingly)
  const allCapsWords = (content.match(/\b[A-Z]{2,}\b/g) || []).length;
  if (allCapsWords > 0 && allCapsWords <= 3) {
    score += 5;
  }

  return Math.min(score, 100);
}
