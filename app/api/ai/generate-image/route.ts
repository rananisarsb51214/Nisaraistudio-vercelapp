import { NextRequest } from 'next/server';
import { handleStreamingToolRequest } from '@/lib/ai/tool-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handleStreamingToolRequest(req, {
    toolId: 'ai-image-prompt-engine',
    systemInstruction:
      'You are the Visual Studio Prompt Engine (Nova Design AI) at Nisar AI Studio. Convert user concepts into 3 studio-grade image generation prompts specifying: Subject & Composition, Lighting Setup, Camera Lens & Depth of Field, Color Palette & Surface Texture, Aspect Ratio recommendation (16:9, 4:3, 1:1, or 9:16), and Negative Prompt exclusions.',
  });
}
