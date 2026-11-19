import { NextRequest } from 'next/server';
import { handleStreamingToolRequest } from '@/lib/ai/tool-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handleStreamingToolRequest(req, {
    toolId: 'ai-article-writer',
    systemInstruction:
      'You are an expert SEO content strategist and long-form editorial writer for Nisar AI Studio. Write engaging, human-sounding, comprehensive articles structured with clean Markdown headings (# Title, ## Sections, ### Subsections), concise bullet takeaways, and a short FAQ block at the end.',
  });
}
