import type { WordLimit } from '@/lib/prompts';

const WORD_RANGES: Record<WordLimit, { min: number; max: number }> = {
  Short: { min: 50, max: 80 },
  Medium: { min: 100, max: 150 },
  Long: { min: 200, max: 300 },
};

const STOPWORDS = new Set([
  'the',
  'and',
  'that',
  'this',
  'with',
  'from',
  'your',
  'you',
  'for',
  'are',
  'was',
  'were',
  'have',
  'has',
  'had',
  'but',
  'not',
  'they',
  'them',
  'their',
  'what',
  'when',
  'where',
  'why',
  'how',
  'into',
  'about',
  'just',
  'like',
  'really',
  'very',
  'more',
  'most',
  'some',
  'over',
  'under',
  'than',
  'then',
  'there',
  'here',
  'because',
  'also',
  'too',
  'i',
  'im',
  'we',
  'our',
  'us',
  'its',
  "it's",
]);

function stripWrappingQuotes(text: string): string {
  const trimmed = text.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('“') && trimmed.endsWith('”'))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function collapseBlankLines(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n');
  return normalized
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function removeMetaCommentary(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const cleaned: string[] = [];

  for (const line of lines) {
    const lower = line.trim().toLowerCase();
    if (!lower) {
      cleaned.push(line);
      continue;
    }

    const metaStarts = [
      'sure',
      "here's",
      'here is',
      'of course',
      'certainly',
      'as an ai',
      'as a language model',
      'output:',
      'post:',
      'caption:',
    ];
    if (metaStarts.some((m) => lower.startsWith(m))) {
      continue;
    }

    cleaned.push(line);
  }

  return cleaned.join('\n').trim();
}

function sanitizeDashes(text: string): string {
  // Remove em dashes and double hyphen patterns that read like em dashes.
  return text.replace(/—/g, '-').replace(/--+/g, '-');
}

function extractAllHashtags(text: string): string[] {
  const matches = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  const uniq: string[] = [];
  for (const tag of matches) {
    const normalized = tag.toLowerCase();
    if (!uniq.some((t) => t.toLowerCase() === normalized)) uniq.push(tag);
    if (uniq.length >= 20) break;
  }
  return uniq;
}

function keywordHashtags(body: string, needed: number): string[] {
  const words = (body.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? [])
    .filter((w) => !STOPWORDS.has(w))
    .slice(0, 400);

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

  const candidates = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => `#${w.replace(/[^a-z0-9_]/gi, '')}`)
    .filter((t) => t.length > 2);

  const out: string[] = [];
  for (const t of candidates) {
    if (!out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length >= needed) break;
  }

  while (out.length < needed) {
    const fallbacks = ['#socialmedia', '#contentcreator', '#marketing', '#writing', '#growth'];
    for (const t of fallbacks) {
      if (!out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
      if (out.length >= needed) break;
    }
  }

  return out.slice(0, needed);
}

export function cleanOutput(text: string): string {
  let out = text ?? '';
  out = out.replace(/```/g, '').trim();
  out = removeMetaCommentary(out);
  out = stripWrappingQuotes(out);
  out = sanitizeDashes(out);
  out = collapseBlankLines(out);

  const { body, hashtags } = extractHashtags(out);
  const fixedTags =
    hashtags.length >= 5 ? hashtags.slice(0, 5) : [...hashtags, ...keywordHashtags(body, 5 - hashtags.length)];

  const final = `${body.trim()}\n\n${fixedTags.slice(0, 5).join(' ')}`.trim();
  return sanitizeDashes(collapseBlankLines(final));
}

export function extractHashtags(text: string): { body: string; hashtags: string[] } {
  const cleaned = text.replace(/\r\n/g, '\n').trim();
  const lines = cleaned.split('\n');

  // Prefer the last non-empty line if it contains hashtags.
  let hashtagLineIdx = -1;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (!lines[i].trim()) continue;
    if (/#/u.test(lines[i])) {
      hashtagLineIdx = i;
    }
    break;
  }

  if (hashtagLineIdx >= 0) {
    const line = lines[hashtagLineIdx];
    const tags = (line.match(/#[\p{L}\p{N}_]+/gu) ?? []).slice(0, 10);
    const body = [...lines.slice(0, hashtagLineIdx), ...lines.slice(hashtagLineIdx + 1)].join('\n').trim();
    return { body: body || cleaned, hashtags: tags };
  }

  const tags = extractAllHashtags(cleaned).slice(0, 10);
  if (tags.length === 0) return { body: cleaned, hashtags: [] };

  // Remove trailing hashtag-only chunks.
  let body = cleaned;
  const trailing = tags.slice(-5).join(' ');
  if (body.endsWith(trailing)) {
    body = body.slice(0, -trailing.length).trim();
  }
  return { body, hashtags: tags };
}

function countWords(text: string): number {
  return (text.match(/[\p{L}\p{N}]+/gu) ?? []).length;
}

function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ').trim();
}

export function validateOutput(
  text: string,
  wordLimit: WordLimit
): { valid: boolean; wordCount: number; text: string } {
  const { min, max } = WORD_RANGES[wordLimit];
  const wordCount = countWords(text);

  if (wordCount < Math.floor(min * 0.8)) {
    return { valid: false, wordCount, text };
  }

  if (wordCount > Math.ceil(max * 1.2)) {
    const truncated = truncateToWords(text, max);
    return { valid: true, wordCount: countWords(truncated), text: truncated };
  }

  return { valid: true, wordCount, text };
}

export function processOutput(
  rawText: string,
  wordLimit: WordLimit
): { body: string; hashtags: string[]; wordCount: number; valid: boolean } {
  const cleaned = cleanOutput(rawText);
  const { body, hashtags } = extractHashtags(cleaned);
  const validation = validateOutput(body, wordLimit);

  const finalHashtags =
    hashtags.length >= 5 ? hashtags.slice(0, 5) : [...hashtags, ...keywordHashtags(validation.text, 5 - hashtags.length)];

  return {
    body: validation.text.trim(),
    hashtags: finalHashtags.slice(0, 5),
    wordCount: validation.wordCount,
    valid: validation.valid,
  };
}

