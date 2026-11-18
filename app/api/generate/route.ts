export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAndDeductCredits, refundQuotaOrCredit } from '@/lib/credits/credits-service';
import { createGeminiClient, parseGeminiError, resolveGeminiModel } from '@/lib/ai/gemini-error';

export async function POST(req: NextRequest) {
  let deductedFrom: 'daily_free' | 'paid_credits' | 'none' = 'none';
  let deductedCost = 0;
  let resolvedUserId = 'default_user';

  try {
    const body = await req.json();
    const { prompt, userId = 'default_user', model = 'gemini-2.5-flash' } = body || {};
    resolvedUserId = typeof userId === 'string' && userId.trim() ? userId.trim() : 'default_user';

    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 10000) {
      return NextResponse.json(
        { error: 'Invalid prompt or exceeds 10,000 characters.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is missing.' },
        { status: 500 }
      );
    }

    // 1. Atomically verify and deduct daily free quota or paid credits BEFORE calling Gemini
    const deductRes = await checkAndDeductCredits(resolvedUserId, 1, 'direct-prompt');
    if (!deductRes.success) {
      return NextResponse.json(
        {
          error: deductRes.error || 'Daily limit reached and insufficient paid credits.',
          code: deductRes.code || 'LIMIT_REACHED',
          quota: deductRes.quota,
        },
        { status: deductRes.code === 'LIMIT_REACHED' ? 429 : 500 }
      );
    }

    deductedFrom = deductRes.deductedFrom;
    deductedCost = deductRes.deductedCost;

    // 2. Call Google Gemini API securely server-side
    const ai = createGeminiClient(apiKey);
    const resolvedModel = resolveGeminiModel(model);
    const response = await ai.models.generateContent({
      model: resolvedModel,
      contents: prompt,
    });

    return NextResponse.json({
      text: response.text || '',
      quota: deductRes.quota,
    });
  } catch (error: unknown) {
    if (deductedFrom !== 'none' && deductedCost > 0) {
      await refundQuotaOrCredit(resolvedUserId, deductedFrom, deductedCost, 'direct-prompt');
    }
    const parsed = parseGeminiError(error);
    return NextResponse.json({ error: parsed.message, code: parsed.code }, { status: parsed.status });
  }
}
