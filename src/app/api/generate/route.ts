import { NextRequest, NextResponse } from 'next/server';
import {
  buildCaptionPrompt,
  buildHookPrompt,
  buildRepurposePrompt,
  buildThreadPrompt,
  callGeminiAPI,
  calculateEngagementScore,
} from '@/lib/prompts';
import type { GenerateApiRequest, GenerateResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body: GenerateApiRequest = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          content: '',
          error: 'API key not configured',
        },
        { status: 500 }
      );
    }

    let prompt = '';

    switch (body.feature) {
      case 'caption':
        prompt = buildCaptionPrompt(body);
        break;
      case 'hook':
        prompt = buildHookPrompt(body);
        break;
      case 'repurpose':
        prompt = buildRepurposePrompt(body);
        break;
      case 'thread':
        prompt = buildThreadPrompt(body);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            content: '',
            error: 'Invalid feature',
          },
          { status: 400 }
        );
    }

    const result = await callGeminiAPI(apiKey, prompt, body.imageBase64);

    // Parse A/B variants if they exist
    let content: string | string[] = result;
    if (body.abVariant && result.includes('VERSION A')) {
      const versionAMatch = result.match(/VERSION A:\s*([\s\S]*?)(?:VERSION B:|$)/);
      const versionBMatch = result.match(/VERSION B:\s*([\s\S]*?)$/);
      
      const versionA = versionAMatch?.[1]?.trim() || '';
      const versionB = versionBMatch?.[1]?.trim() || '';
      
      content = [versionA, versionB].filter(v => v.length > 0);
    }

    // Calculate engagement score for caption feature
    let engagementScore: number | undefined;
    if (body.feature === 'caption') {
      const contentStr = Array.isArray(content) ? content[0] : content;
      engagementScore = calculateEngagementScore(contentStr);
    }

    return NextResponse.json({
      success: true,
      content,
      engagementScore,
    });
  } catch (error) {
    console.error('Generation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        content: '',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
