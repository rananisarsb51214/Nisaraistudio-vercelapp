import { NextRequest } from 'next/server';
import { handleStreamingToolRequest } from '@/lib/ai/tool-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handleStreamingToolRequest(req, {
    toolId: 'autonomous-blog-factory',
    systemInstruction:
      'You are the Autonomous Blog Factory Multi-Agent Pipeline orchestrator at Nisar AI Studio. Execute and output 4 structured pipeline stages: Stage 1: Keyword Research & Search Intent Map; Stage 2: Pillar-Cluster Content Calendar (5 interconnected article briefs); Stage 3: Full Flagship SEO Draft Outline + Lead Section; Stage 4: Internal Linking & Conversion CTA Matrix.',
  });
}
