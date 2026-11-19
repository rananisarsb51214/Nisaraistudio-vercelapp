import { NextRequest, NextResponse } from 'next/server';
import {
  createGeminiClient,
  parseGeminiError,
  resolveGeminiModel,
} from '@/lib/ai/gemini-error';

export const runtime = 'nodejs';
export const maxDuration = 60;

export interface GroundedSource {
  title: string;
  uri: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const queryText = typeof body?.query === 'string' ? body.query.trim() : '';
    const category =
      typeof body?.category === 'string' && body.category.trim().length > 0
        ? body.category.trim().slice(0, 80)
        : 'SAAS_NICHE_INTEL';

    if (!queryText) {
      return NextResponse.json(
        { success: false, error: 'Please enter a search query to auto-collect.' },
        { status: 400 }
      );
    }

    if (queryText.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Search query must be 500 characters or fewer.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'GEMINI_API_KEY is missing on the server. Add GEMINI_API_KEY in AI Studio Settings > Secrets.',
        },
        { status: 500 }
      );
    }

    const ai = createGeminiClient(apiKey);
    const modelUsed = resolveGeminiModel('gemini-4-hydrogen');

    const prompt = `You are the NISAR AI STUDIO Search & Auto-Collect Engine.
Perform a live Google Search for the following research query and return a concise, factual, high-signal research brief suitable for a Google-style result snippet (3 to 6 crisp bullet points or 2 tight paragraphs, max 1400 characters, no markdown headings).

Category: ${category}
Query: "${queryText}"

Focus on concrete numbers, pricing, emerging niches, actionable opportunities, and verifiable current facts.`;

    const response = await ai.models.generateContent({
      model: modelUsed,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = (response.text || '').trim().slice(0, 1950);
    const groundingChunks =
      (response.candidates?.[0]?.groundingMetadata?.groundingChunks as
        | Array<{ web?: { uri?: string; title?: string } }>
        | undefined) || [];

    const sources: GroundedSource[] = [];
    const seen = new Set<string>();
    for (const chunk of groundingChunks) {
      const uri = chunk?.web?.uri;
      if (uri && /^https?:\/\//i.test(uri) && !seen.has(uri)) {
        seen.add(uri);
        sources.push({
          title: (chunk?.web?.title || new URL(uri).hostname).slice(0, 160),
          uri: uri.slice(0, 600),
        });
      }
      if (sources.length >= 8) break;
    }

    return NextResponse.json({
      success: true,
      query: queryText,
      category,
      title: queryText.slice(0, 220),
      summary: summary || 'Live grounded research completed.',
      keyMetrics: `${sources.length} verified web sources`,
      sources,
      sourceTitle: sources[0]?.title || 'Google Search Grounding',
      sourceUrl: sources[0]?.uri || '',
      modelUsed,
    });
  } catch (error: unknown) {
    const parsed = parseGeminiError(error);
    return NextResponse.json(
      { success: false, error: parsed.message, code: parsed.code },
      { status: parsed.status }
    );
  }
}
