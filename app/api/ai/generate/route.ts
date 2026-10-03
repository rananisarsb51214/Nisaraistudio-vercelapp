export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { executeTool } from '@/lib/ai/router';
import { checkAndDeductCredits, getUserCredits } from '@/lib/credits/credits-service';
import { saveGenerationHistory } from '@/lib/firestore/history-service';
import { ToolExecutionRequest, ToolExecutionResponse } from '@/types/ai';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ToolExecutionRequest;
    const { toolId, userId = 'default_user', parameters, model, tone, language } = body;

    if (!toolId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: toolId' },
        { status: 400 }
      );
    }

    if (!parameters || typeof parameters !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid parameters object' },
        { status: 400 }
      );
    }

    // 1. Check user credit balance before calling AI
    const userCredits = await getUserCredits(userId);
    
    // 2. Execute tool through the central router
    const result = await executeTool({
      toolId,
      userId,
      parameters,
      model,
      tone,
      language,
    });

    // 3. Deduct credits
    const deductRes = await checkAndDeductCredits(userId, result.creditCost, toolId);

    if (!deductRes.success) {
      return NextResponse.json(
        { success: false, error: deductRes.error || 'Insufficient credits' },
        { status: 403 }
      );
    }

    // 4. Create generation ID and save history in Firestore
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const promptSummary = Object.values(parameters).filter((v) => typeof v === 'string').join(' • ').slice(0, 150) || toolId;

    await saveGenerationHistory({
      id: generationId,
      userId,
      toolId,
      toolName: result.toolName,
      category: result.category,
      promptSummary,
      parameters,
      output: result.output,
      modelUsed: result.modelUsed,
      creditsCost: result.creditCost,
      executionTimeMs: result.executionTimeMs,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    });

    const responseData: ToolExecutionResponse = {
      success: true,
      generationId,
      toolId,
      category: result.category,
      output: result.output,
      creditsUsed: result.creditCost,
      remainingCredits: deductRes.remainingCredits,
      executionTimeMs: result.executionTimeMs,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('[API /api/ai/generate Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during AI generation.',
      },
      { status: 500 }
    );
  }
}
