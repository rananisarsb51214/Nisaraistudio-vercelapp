'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  Cpu,
  Download,
  Layers,
  Loader2,
  Play,
  Puzzle,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import { deductUserCreditAtomic } from '@/lib/services/userQuotaService';
import { trackStudioEvent } from '@/lib/analytics';

type AgentMode =
  | 'niche_saas'
  | 'chrome_extension'
  | 'programmatic_seo'
  | 'self_optimizer';

type ProviderChoice = 'auto' | 'gemini' | 'claude';

interface StoredToolboxRun {
  id: string;
  userId: string;
  toolMode: string;
  toolLabel: string;
  providerUsed: 'gemini' | 'claude';
  modelUsed: string;
  fallbackUsed?: boolean;
  promptPreview: string;
  outputPreview: string;
  promptLength: number;
  executionTimeMs: number;
  createdAt?: any;
}

const MAX_CHARS = 10000;

const AGENT_MODES: {
  id: AgentMode;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  samplePrompt: string;
}[] = [
  {
    id: 'niche_saas',
    label: 'AI Niche SaaS Generator',
    subtitle: 'Full SaaS blueprint, PKR/USD pricing & Firestore schema',
    icon: Layers,
    samplePrompt:
      'Design a niche micro-SaaS for Pakistan e-commerce brands that automates WhatsApp order confirmations, courier tracking, and COD fraud scoring using Next.js, Firestore, and Gemini.',
  },
  {
    id: 'chrome_extension',
    label: 'Chrome Extension Scaffold',
    subtitle: 'Manifest V3 code, service worker & content script',
    icon: Puzzle,
    samplePrompt:
      'Generate a Manifest V3 Chrome Extension scaffold that extracts product pricing and affiliate links from any shopping page and sends them to NISAR AI STUDIO via a popup toolbar.',
  },
  {
    id: 'programmatic_seo',
    label: 'Programmatic SEO & Funnel',
    subtitle: 'Slug taxonomy, JSON-LD templates & conversion funnel',
    icon: TrendingUp,
    samplePrompt:
      'Build a programmatic SEO plan for 200+ AI tool landing pages targeting freelancers and agencies in Pakistan, UAE, and UK with JSON-LD schema and lead magnet funnels.',
  },
  {
    id: 'self_optimizer',
    label: 'Agent Evolver Self-Optimizer',
    subtitle: 'Audit prompts, cut latency & upgrade v2 agent specs',
    icon: Zap,
    samplePrompt:
      'Audit our multi-step blog & lead-qualification Gemini agent pipeline. Identify failure points, token waste, and output a stricter v2 system instruction with schema verification.',
  },
];

export function AgentEvolverControl() {
  const { user } = useAuth();
  const [toolMode, setToolMode] = useState<AgentMode>('niche_saas');
  const [provider, setProvider] = useState<ProviderChoice>('auto');
  const [allowFallback, setAllowFallback] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultOutput, setResultOutput] = useState('');
  const [runMeta, setRunMeta] = useState<{
    providerUsed: string;
    modelUsed: string;
    executionTimeMs: number;
    fallbackReason?: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentRuns, setRecentRuns] = useState<StoredToolboxRun[]>([]);

  useEffect(() => {
    if (!db || !user?.uid) {
      setRecentRuns([]);
      return;
    }

    const q = query(
      collection(db, 'super_ai_toolbox_runs'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: StoredToolboxRun[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StoredToolboxRun, 'id'>),
        }));
        items.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });
        setRecentRuns(items.slice(0, 20));
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'super_ai_toolbox_runs');
        } catch {
          // Handled safely
        }
      }
    );
    return () => unsub();
  }, [user?.uid]);

  const activeModeConfig =
    AGENT_MODES.find((m) => m.id === toolMode) || AGENT_MODES[0];

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || isRunning) return;

    if (trimmed.length > MAX_CHARS) {
      setErrorMsg(`Prompt exceeds the ${MAX_CHARS.toLocaleString()}-character limit.`);
      return;
    }

    setIsRunning(true);
    setErrorMsg(null);
    setResultOutput('');
    setRunMeta(null);

    try {
      if (user?.uid) {
        const quota = await deductUserCreditAtomic(user.uid, 1);
        if (!quota.ok) {
          setErrorMsg(quota.reason || 'Insufficient credits.');
          setIsRunning(false);
          return;
        }
      }

      const res = await fetch('/api/ai/agent-evolver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolMode,
          provider,
          allowFallback,
          prompt: trimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || `Agent execution failed (HTTP ${res.status}).`);
      }

      setResultOutput(data.output || '');
      setRunMeta({
        providerUsed: data.providerUsed,
        modelUsed: data.modelUsed,
        executionTimeMs: data.executionTimeMs,
        fallbackReason: data.fallbackReason || null,
      });

      trackStudioEvent('agent_evolver_run', {
        tool_mode: toolMode,
        provider_used: data.providerUsed,
        prompt_length: trimmed.length,
      });

      if (provider === 'claude' || data.providerUsed === 'claude') {
        trackStudioEvent('claude_router_run', {
          tool_mode: toolMode,
          fallback_used: Boolean(data.fallbackUsed),
        });
      }

      if (user?.uid && db) {
        await addDoc(collection(db, 'super_ai_toolbox_runs'), {
          userId: user.uid,
          toolMode,
          toolLabel: activeModeConfig.label.slice(0, 120),
          providerUsed: data.providerUsed === 'claude' ? 'claude' : 'gemini',
          modelUsed: String(data.modelUsed || 'gemini-4-hydrogen').slice(0, 100),
          fallbackUsed: Boolean(data.fallbackUsed),
          promptPreview: trimmed.slice(0, 580),
          outputPreview: String(data.output || '').slice(0, 3900),
          promptLength: trimmed.length,
          executionTimeMs: Number(data.executionTimeMs || 0),
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Agent Evolver request failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    if (!resultOutput) return;
    await navigator.clipboard.writeText(resultOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadMarkdown = () => {
    if (!resultOutput) return;
    const blob = new Blob([resultOutput], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nisar-agent-evolver-${toolMode}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 dark:border-[#6366F1]/30 bg-white dark:bg-[#0B0F19]/90 backdrop-blur-md p-6 sm:p-7 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 dark:text-[#00D9FF]">
              <span>Multi-Model Router (Gemini + Claude AI)</span>
              <span aria-hidden="true">·</span>
              <span>10,000-Char Context</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
              Agent Evolver Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Execute specialized SaaS, Chrome Extension, Programmatic SEO, and Self-Optimizer agents with automatic Gemini/Claude routing and Firestore run telemetry.
            </p>
          </div>

          {/* Model Router Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#050811]">
              {(
                [
                  { id: 'auto', label: 'Auto Router' },
                  { id: 'gemini', label: 'Gemini' },
                  { id: 'claude', label: 'Claude AI' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProvider(opt.id)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    provider === opt.id
                      ? 'bg-gradient-to-r from-[#00D9FF] to-[#6366F1] text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Specialized Tool Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {AGENT_MODES.map((mode) => {
            const Icon = mode.icon;
            const active = toolMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setToolMode(mode.id)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer space-y-2 ${
                  active
                    ? 'border-[#00D9FF] bg-cyan-50/70 dark:bg-[#00D9FF]/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className={`w-4 h-4 ${
                      active ? 'text-indigo-700 dark:text-[#00D9FF]' : 'text-slate-500'
                    }`}
                  />
                  {active && (
                    <span className="text-[11px] font-mono text-indigo-700 dark:text-[#00D9FF] font-semibold">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-950 dark:text-white">
                  {mode.label}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                  {mode.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Prompt Input (10,000 chars) */}
        <form onSubmit={handleRunAgent} className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="agent-evolver-prompt"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {activeModeConfig.label} Specification Prompt
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPrompt(activeModeConfig.samplePrompt)}
                  className="text-xs font-semibold text-indigo-700 dark:text-[#22D3EE] hover:underline cursor-pointer"
                >
                  Load Sample Spec
                </button>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    prompt.length > MAX_CHARS * 0.9
                      ? 'text-amber-500 font-semibold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {prompt.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
                </span>
              </div>
            </div>

            <textarea
              id="agent-evolver-prompt"
              rows={6}
              maxLength={MAX_CHARS}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isRunning}
              placeholder={`Describe your ${activeModeConfig.label.toLowerCase()} requirements (up to 10,000 characters)...`}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] p-4 text-sm text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D9FF] font-sans"
              required
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={allowFallback}
                onChange={(e) => setAllowFallback(e.target.checked)}
                className="rounded border-slate-400 accent-[#00D9FF]"
              />
              <span>Auto-fallback between Claude AI &amp; Gemini if one provider is unavailable</span>
            </label>

            <button
              type="submit"
              disabled={isRunning || !prompt.trim()}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D9FF] via-[#6366F1] to-[#8B5CF6] text-slate-950 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50 whitespace-nowrap cursor-pointer transition"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running Agent...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute Agent (1 Credit)</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {resultOutput && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                <Cpu className="w-4 h-4 text-[#00D9FF]" />
                <span>Provider: {runMeta?.providerUsed?.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span>Model: {runMeta?.modelUsed}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{runMeta?.executionTimeMs}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="min-h-[34px] px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#00D9FF] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="min-h-[34px] px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#8B5CF6] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export MD</span>
                </button>
              </div>
            </div>
            {runMeta?.fallbackReason && (
              <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-500/30 text-xs text-amber-800 dark:text-amber-300">
                Router Notice: {runMeta.fallbackReason}
              </div>
            )}
            <pre className="p-5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words font-sans leading-relaxed max-h-[540px] overflow-y-auto custom-scrollbar">
              {resultOutput}
            </pre>
          </div>
        )}
      </section>

      {/* Live Firestore Synced Execution Logs */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19]/90 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              Agent Execution Logs (`super_ai_toolbox_runs`)
            </h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {recentRuns.length} synced runs
          </span>
        </div>

        {recentRuns.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs text-slate-500">
            Execute any Agent Evolver mode above while signed in to view live synced run logs.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentRuns.map((run) => (
              <div
                key={run.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-slate-950 dark:text-white">
                      {run.toolLabel || run.toolMode}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-700 dark:text-[#00D9FF]">
                      {run.providerUsed.toUpperCase()} ({run.modelUsed})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500 tabular-nums">
                      {run.promptLength} chars · {run.executionTimeMs}ms
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {run.promptPreview}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setResultOutput(run.outputPreview || '')}
                  className="min-h-[34px] px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#00D9FF] whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Load Output</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
