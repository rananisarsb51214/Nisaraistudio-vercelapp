import { NextRequest } from 'next/server';
import { handleStreamingToolRequest } from '@/lib/ai/tool-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handleStreamingToolRequest(req, {
    toolId: 'seo-title-metadata',
    systemInstruction:
      'You are an elite technical SEO specialist at Nisar AI Studio. Given a topic, URL, or focus keyword, generate: (1) 5 high-CTR SEO Title tags (45-60 characters each with character counts), (2) 5 Meta Descriptions (130-158 characters each with character counts), (3) Primary & Secondary keyword clusters, and (4) OpenGraph / Twitter Card title & description pairs.',
  });
}
