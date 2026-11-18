export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { executeTool } from '@/lib/ai/router';
import { AI_TOOLS_REGISTRY } from '@/lib/ai/schemas';
import { checkAndDeductCredits, refundQuotaOrCredit } from '@/lib/credits/credits-service';
import { saveGenerationHistory } from '@/lib/firestore/history-service';
import { ToolExecutionRequest, ToolExecutionResponse } from '@/types/ai';
import { parseGeminiError } from '@/lib/ai/gemini-error';

export async function POST(req: NextRequest) {
  let deductedFrom: 'daily_free' | 'paid_credits' | 'none' = 'none';
  let deductedCost = 0;
  let resolvedUserId = 'default_user';
  let resolvedToolId = '';

  try {
    const body = (await req.json()) as ToolExecutionRequest;
    const { toolId, userId = 'default_user', parameters, model, tone, language } = body;

    resolvedUserId = typeof userId === 'string' && userId.trim() ? userId.trim() : 'default_user';
    resolvedToolId = toolId;

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

    const tool = AI_TOOLS_REGISTRY[toolId];
    if (!tool) {
      return NextResponse.json(
        { success: false, error: `Invalid tool ID: "${toolId}".` },
        { status: 400 }
      );
    }

    for (const field of tool.fields) {
      if (field.required && !parameters[field.name]) {
        return NextResponse.json(
          { success: false, error: `Field "${field.label}" is required.` },
          { status: 400 }
        );
      }
    }

    // 1. Atomically check and deduct daily free quota (10/day) or paid credits BEFORE calling AI
    const deductRes = await checkAndDeductCredits(resolvedUserId, tool.creditCost, toolId);

    if (!deductRes.success) {
      return NextResponse.json(
        {
          success: false,
          code: deductRes.code || 'LIMIT_REACHED',
          error: deductRes.error || 'Daily limit reached and insufficient paid credits.',
          quota: deductRes.quota,
        },
        { status: deductRes.code === 'LIMIT_REACHED' ? 429 : 500 }
      );
    }

    deductedFrom = deductRes.deductedFrom;
    deductedCost = deductRes.deductedCost;

    // 2. Execute tool through the central router
    const result = await executeTool({
      toolId,
      userId: resolvedUserId,
      parameters,
      model,
      tone,
      language,
    });

    // 3. Create generation ID and save history in Firestore
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const promptSummary =
      Object.values(parameters)
        .filter((v) => typeof v === 'string')
        .join(' • ')
        .slice(0, 150) || toolId;

    await saveGenerationHistory({
      id: generationId,
      userId: resolvedUserId,
      toolId,
      toolName: result.toolName,
      category: result.category,
      promptSummary,
      parameters,
      output: result.output,
      modelUsed: result.modelUsed,
      creditsCost: deductRes.deductedFrom === 'daily_free' ? 0 : deductRes.deductedCost,
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
      creditsUsed: deductRes.deductedFrom === 'daily_free' ? 0 : deductRes.deductedCost,
      remainingCredits: deductRes.remainingCredits,
      quota: deductRes.quota,
      executionTimeMs: result.executionTimeMs,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    if (deductedFrom !== 'none' && deductedCost > 0 && resolvedToolId) {
      await refundQuotaOrCredit(resolvedUserId, deductedFrom, deductedCost, resolvedToolId);
    }
    const parsed = parseGeminiError(error);
    console.warn('[API /api/ai/generate Error]:', parsed.code, parsed.message);
    return NextResponse.json(
      {
        success: false,
        code: parsed.code,
        error: parsed.message,
      },
      { status: parsed.status }
    );
  }
}
