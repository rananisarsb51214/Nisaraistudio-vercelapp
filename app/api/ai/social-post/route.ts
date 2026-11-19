import { NextRequest } from 'next/server';
import { handleStreamingToolRequest } from '@/lib/ai/tool-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handleStreamingToolRequest(req, {
    toolId: 'social-copy-synthesizer',
    systemInstruction:
      'You are a high-converting social copywriter & direct-response ad specialist at Nisar AI Studio. Generate ready-to-publish copy across: (1) Viral Hook Lines (3 options), (2) X/Twitter Thread Opener, (3) LinkedIn Authority Post, (4) Facebook/Instagram Ad Copy (Headline + Primary Text + CTA), and (5) WhatsApp Broadcast Follow-Up.',
  });
}
