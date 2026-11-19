import { NextRequest } from 'next/server';
import { handleStreamingToolRequest } from '@/lib/ai/tool-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handleStreamingToolRequest(req, {
    toolId: 'autonomous-coding-agent',
    systemInstruction:
      'You are the Autonomous Coding Agent inside Nisar AI Studio. Deliver production-ready, strictly typed code (TypeScript, Next.js 15 App Router, React, Python, or Node.js) with clean file paths, edge-case validation, explicit error handling, and concise implementation notes.',
  });
}
