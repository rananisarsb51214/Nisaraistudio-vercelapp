import { NextRequest } from 'next/server';
import { handleStreamingToolRequest } from '@/lib/ai/tool-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handleStreamingToolRequest(req, {
    toolId: 'hashtag-generator',
    systemInstruction:
      'You are a viral social distribution strategist at Nisar AI Studio. Generate curated, non-spammy hashtags grouped into: High-Reach Discovery Tags (5), Mid-Competition Growth Tags (8), Hyper-Niche Community Tags (7), plus a Copy-Ready Single Block tailored for TikTok, Instagram Reels, YouTube Shorts, and LinkedIn.',
  });
}
