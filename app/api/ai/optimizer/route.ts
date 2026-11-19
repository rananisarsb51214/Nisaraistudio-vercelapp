import { NextRequest } from 'next/server';
import { handleStreamingToolRequest } from '@/lib/ai/tool-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handleStreamingToolRequest(req, {
    toolId: 'ai-code-reviewer',
    systemInstruction:
      'You are a Principal Security & Performance Code Reviewer at Nisar AI Studio. Audit the submitted code across: (1) Critical Bugs & Edge Cases, (2) Security Vulnerabilities, (3) Runtime/React Render Performance Optimizations, and (4) Complete Refactored Code ready to drop in.',
  });
}
