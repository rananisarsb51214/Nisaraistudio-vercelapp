import { NextRequest, NextResponse } from 'next/server';
import {
  createGeminiClient,
  parseGeminiError,
  resolveGeminiModel,
} from '@/lib/ai/gemini-error';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface GroundedFinding {
  title: string;
  category: string;
  summary: string;
  keyMetrics: string;
  sourceTitle: string;
  sourceUrl: string;
}

function extractJsonBlock(raw: string): {
  executiveSummary?: string;
  items?: Partial<GroundedFinding>[];
} | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  try {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const queryText = typeof body?.query === 'string' ? body.query.trim() : '';
    const category =
      typeof body?.category === 'string' && body.category.trim().length > 0
        ? body.category.trim().slice(0, 80)
        : 'Market & SEO Intelligence';

    if (!queryText) {
      return NextResponse.json(
        { success: false, error: 'A search query is required.' },
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

    const prompt = `You are the NISAR AI STUDIO Search & Auto-Collect Research Agent.
Use live Google Search grounding to collect verifiable, current findings for:
Query: "${queryText}"
Category: "${category}"

Return ONLY a valid JSON object (no extra commentary) with this exact structure:
{
  "executiveSummary": "2-4 sentence factual overview based on live search results",
  "items": [
    {
      "title": "Concise finding headline (max 120 chars)",
      "category": "${category}",
      "summary": "Actionable 2-3 sentence breakdown with real facts, dates, or pricing",
      "keyMetrics": "Key figures, pricing, traffic, or metrics (max 120 chars)",
      "sourceTitle": "Publisher or site name",
      "sourceUrl": "https://..."
    }
  ]
}
Produce 4 to 6 high-signal items grounded in the search results.`;

    const response = await ai.models.generateContent({
      model: modelUsed,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text || '';
    const groundingChunks =
      (response.candidates?.[0]?.groundingMetadata?.groundingChunks as
        | Array<{ web?: { uri?: string; title?: string } }>
        | undefined) || [];

    const verifiedSources: { title: string; url: string }[] = [];
    const seenUrls = new Set<string>();
    for (const chunk of groundingChunks) {
      const uri = chunk?.web?.uri;
      if (uri && /^https?:\/\//i.test(uri) && !seenUrls.has(uri)) {
        seenUrls.add(uri);
        verifiedSources.push({
          title: (chunk?.web?.title || uri).slice(0, 160),
          url: uri.slice(0, 600),
        });
      }
    }

    const parsed = extractJsonBlock(rawText);
    let items: GroundedFinding[] = [];

    if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
      items = parsed.items.slice(0, 8).map((item, idx) => {
        const fallbackSource = verifiedSources[idx % Math.max(1, verifiedSources.length)];
        const rawUrl = typeof item?.sourceUrl === 'string' ? item.sourceUrl.trim() : '';
        const safeUrl = /^https?:\/\//i.test(rawUrl)
          ? rawUrl
          : fallbackSource?.url || '';
        return {
          title: String(item?.title || `${queryText} — Finding ${idx + 1}`).slice(0, 220),
          category: String(item?.category || category).slice(0, 80),
          summary: String(item?.summary || '').slice(0, 2000),
          keyMetrics: String(item?.keyMetrics || 'Live Search Grounded').slice(0, 320),
          sourceTitle: String(
            item?.sourceTitle || fallbackSource?.title || 'Google Search Grounding'
          ).slice(0, 220),
          sourceUrl: safeUrl.slice(0, 600),
        };
      });
    } else if (rawText.trim().length > 0) {
      const primarySource = verifiedSources[0];
      items = [
        {
          title: `Live Grounded Report: ${queryText}`.slice(0, 220),
          category,
          summary: rawText.trim().slice(0, 1800),
          keyMetrics: `${verifiedSources.length} verified web sources`,
          sourceTitle: primarySource?.title || 'Google Search Grounding',
          sourceUrl: primarySource?.url || '',
        },
      ];
    }

    return NextResponse.json({
      success: true,
      modelUsed,
      executiveSummary:
        (parsed?.executiveSummary && String(parsed.executiveSummary).trim()) ||
        rawText.trim().slice(0, 900),
      items,
      sources: verifiedSources,
    });
  } catch (error: unknown) {
    const parsedErr = parseGeminiError(error);
    return NextResponse.json(
      { success: false, error: parsedErr.message, code: parsedErr.code },
      { status: parsedErr.status }
    );
  }
}
