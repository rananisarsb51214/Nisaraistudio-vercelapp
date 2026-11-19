import { NextRequest, NextResponse } from 'next/server';
import {
  createGeminiClient,
  parseGeminiError,
  resolveGeminiModel,
} from '@/lib/ai/gemini-error';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_PROMPT_CHARS = 10000;

type AgentMode =
  | 'niche_saas'
  | 'chrome_extension'
  | 'programmatic_seo'
  | 'self_optimizer';

type ProviderChoice = 'auto' | 'gemini' | 'claude';

const MODE_INSTRUCTIONS: Record<AgentMode, string> = {
  niche_saas: `You are the NISAR AI STUDIO Niche SaaS Architect.
Produce a production-ready technical & monetization blueprint including:
1. Niche positioning, ICP, and unfair advantage
2. Next.js App Router + Firestore data model & API endpoints
3. Dual Pakistan (JazzCash/Easypaisa PKR) and International (Stripe USD) pricing tiers
4. MVP 14-day shipping checklist with real code snippets`,
  chrome_extension: `You are the NISAR AI STUDIO Chrome Extension Scaffold Architect.
Produce a complete Manifest V3 Chrome Extension implementation including:
1. manifest.json (strict minimal permissions)
2. background service worker (background.js)
3. content script & popup UI integration
4. Secure API sync pattern to NISAR AI STUDIO`,
  programmatic_seo: `You are the NISAR AI STUDIO Programmatic SEO & Funnel Architect.
Produce an actionable pSEO growth architecture including:
1. URL slug taxonomy & Next.js generateStaticParams pattern
2. JSON-LD structured data templates (SoftwareApplication, FAQPage, BreadcrumbList)
3. High-converting lead magnet & WhatsApp/Stripe conversion funnel
4. Internal linking & keyword clustering strategy`,
  self_optimizer: `You are the NISAR AI STUDIO Agent Evolver Self-Optimizer.
Audit the user's prompt, workflow, or agent architecture and output:
1. Bottlenecks, token waste, and failure-mode diagnostics
2. Upgraded v2 System Instruction (copy-paste ready)
3. Strict JSON output schema & validation guardrails
4. Latency & credit-efficiency optimizations`,
};

async function runClaude(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured on the server.');
  }
  const model = process.env.ANTHROPIC_MODEL?.trim() || 'claude-3-5-sonnet-latest';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2800,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errText.slice(0, 260)}`);
  }

  const data = await res.json();
  const output = Array.isArray(data?.content)
    ? data.content
        .filter((block: { type?: string }) => block?.type === 'text')
        .map((block: { text?: string }) => block?.text || '')
        .join('\n')
    : '';

  return {
    providerUsed: 'claude' as const,
    modelUsed: model,
    output: output.trim(),
  };
}

async function runGemini(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  const ai = createGeminiClient(apiKey);
  const model = resolveGeminiModel('gemini-4-hydrogen');
  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
    },
  });
  return {
    providerUsed: 'gemini' as const,
    modelUsed: model,
    output: (response.text || '').trim(),
  };
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await req.json();
    const rawMode = String(body?.toolMode || 'niche_saas') as AgentMode;
    const toolMode: AgentMode = rawMode in MODE_INSTRUCTIONS ? rawMode : 'niche_saas';
    const rawProvider = String(body?.provider || 'auto') as ProviderChoice;
    const provider: ProviderChoice =
      rawProvider === 'claude' || rawProvider === 'gemini' ? rawProvider : 'auto';
    const allowFallback = body?.allowFallback !== false;
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt specification is required.' },
        { status: 400 }
      );
    }

    if (prompt.length > MAX_PROMPT_CHARS) {
      return NextResponse.json(
        {
          success: false,
          error: `Prompt exceeds the ${MAX_PROMPT_CHARS.toLocaleString()}-character limit (${prompt.length.toLocaleString()} chars provided).`,
        },
        { status: 400 }
      );
    }

    const systemPrompt = MODE_INSTRUCTIONS[toolMode];
    const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());

    if (!hasClaude && !hasGemini) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No AI provider key is configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY in server environment secrets.',
        },
        { status: 500 }
      );
    }

    let result: { providerUsed: 'gemini' | 'claude'; modelUsed: string; output: string };
    let fallbackUsed = false;
    let fallbackReason: string | null = null;

    if (provider === 'claude') {
      try {
        result = await runClaude(systemPrompt, prompt);
      } catch (claudeErr: unknown) {
        if (!allowFallback || !hasGemini) {
          throw claudeErr;
        }
        fallbackUsed = true;
        fallbackReason =
          claudeErr instanceof Error
            ? `Claude AI unavailable (${claudeErr.message}); routed seamlessly to Gemini.`
            : 'Claude AI unavailable; routed seamlessly to Gemini.';
        result = await runGemini(systemPrompt, prompt);
      }
    } else if (provider === 'gemini') {
      try {
        result = await runGemini(systemPrompt, prompt);
      } catch (geminiErr: unknown) {
        if (!allowFallback || !hasClaude) {
          throw geminiErr;
        }
        fallbackUsed = true;
        fallbackReason = 'Gemini unavailable; routed seamlessly to Claude AI.';
        result = await runClaude(systemPrompt, prompt);
      }
    } else {
      // Auto Router: prefer Gemini when available (fast default), fallback to Claude if configured
      if (hasGemini) {
        try {
          result = await runGemini(systemPrompt, prompt);
        } catch (geminiErr: unknown) {
          if (!allowFallback || !hasClaude) throw geminiErr;
          fallbackUsed = true;
          fallbackReason = 'Auto Router switched from Gemini to Claude AI.';
          result = await runClaude(systemPrompt, prompt);
        }
      } else {
        result = await runClaude(systemPrompt, prompt);
      }
    }

    return NextResponse.json({
      success: true,
      toolMode,
      providerUsed: result.providerUsed,
      modelUsed: result.modelUsed,
      fallbackUsed,
      fallbackReason,
      output: result.output,
      executionTimeMs: Date.now() - startedAt,
    });
  } catch (error: unknown) {
    const parsed = parseGeminiError(error);
    return NextResponse.json(
      { success: false, error: parsed.message, code: parsed.code },
      { status: parsed.status }
    );
  }
}
