import { NextRequest, NextResponse } from 'next/server';
import { checkAndDeductCredits, refundQuotaOrCredit } from '@/lib/credits/credits-service';
import { createGeminiClient, parseGeminiError, resolveGeminiModel } from '@/lib/ai/gemini-error';

interface StreamToolOptions {
  toolId: string;
  systemInstruction: string;
  model?: string;
  promptTransformer?: (prompt: string) => Promise<string> | string;
}

export async function handleStreamingToolRequest(
  req: NextRequest,
  options: StreamToolOptions
): Promise<Response> {
  let deductedFrom: 'daily_free' | 'paid_credits' | 'none' = 'none';
  let deductedCost = 0;
  let resolvedUserId = 'default_user';

  try {
    const body = await req.json().catch(() => ({}));
    const rawPrompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    resolvedUserId =
      typeof body?.userId === 'string' && body.userId.trim()
        ? body.userId.trim()
        : 'default_user';

    if (!rawPrompt) {
      return NextResponse.json(
        { success: false, error: 'Please enter a prompt before running the tool.' },
        { status: 400 }
      );
    }

    if (rawPrompt.length > 15000) {
      return NextResponse.json(
        { success: false, error: 'Prompt exceeds 15,000 character limit.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          code: 'API_KEY_MISSING',
          error:
            'GEMINI_API_KEY is missing on the server. Add your Gemini API key in Settings > Secrets.',
        },
        { status: 500 }
      );
    }

    const deductRes = await checkAndDeductCredits(resolvedUserId, 1, options.toolId);
    if (!deductRes.success) {
      return NextResponse.json(
        {
          success: false,
          code: deductRes.code || 'LIMIT_REACHED',
          error: deductRes.error || 'Daily free credit limit reached and insufficient paid credits.',
          quota: deductRes.quota,
        },
        { status: deductRes.code === 'LIMIT_REACHED' ? 429 : 500 }
      );
    }

    deductedFrom = deductRes.deductedFrom;
    deductedCost = deductRes.deductedCost;

    const finalPrompt = options.promptTransformer
      ? await options.promptTransformer(rawPrompt)
      : rawPrompt;

    const ai = createGeminiClient(apiKey);
    const modelToUse = resolveGeminiModel(options.model || 'gemini-4-hydrogen');

    const streamIterator = await ai.models.generateContentStream({
      model: modelToUse,
      contents: finalPrompt,
      config: {
        systemInstruction: options.systemInstruction,
      },
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let emittedAny = false;
        try {
          for await (const chunk of streamIterator) {
            const text = chunk.text;
            if (text) {
              emittedAny = true;
              controller.enqueue(encoder.encode(text));
            }
          }
          if (!emittedAny) {
            controller.enqueue(encoder.encode('No response text returned from Gemini.'));
          }
          controller.close();
        } catch (streamError) {
          if (deductedFrom !== 'none' && deductedCost > 0) {
            await refundQuotaOrCredit(resolvedUserId, deductedFrom, deductedCost, options.toolId);
          }
          const parsed = parseGeminiError(streamError);
          controller.error(new Error(parsed.message));
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Tool-Id': options.toolId,
        'X-Model-Used': modelToUse,
      },
    });
  } catch (error: unknown) {
    if (deductedFrom !== 'none' && deductedCost > 0) {
      await refundQuotaOrCredit(resolvedUserId, deductedFrom, deductedCost, options.toolId);
    }
    const parsed = parseGeminiError(error);
    return NextResponse.json(
      { success: false, code: parsed.code, error: parsed.message },
      { status: parsed.status }
    );
  }
}
