'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  RotateCcw,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export interface ToolRunnerProps {
  toolName: string;
  endpoint: string;
  placeholder?: string;
  samplePrompt?: string;
  defaultPrompt?: string;
}

export function ToolRunner({
  toolName,
  endpoint,
  placeholder = 'Describe what you want to generate or paste your input here...',
  samplePrompt,
  defaultPrompt = '',
}: ToolRunnerProps) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError('Please enter a prompt or input before running the tool.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput('');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          userId: user?.uid || 'default_user',
        }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let errorMsg = `Request failed (${response.status})`;
        try {
          if (contentType.includes('application/json')) {
            const errJson = await response.json();
            errorMsg = errJson?.error || errJson?.message || errorMsg;
          } else {
            const errText = await response.text();
            if (errText) errorMsg = errText;
          }
        } catch {
          // Keep HTTP fallback message
        }
        throw new Error(errorMsg);
      }

      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data?.error) {
          throw new Error(String(data.error));
        }
        const resolved =
          data?.result || data?.output || data?.text || JSON.stringify(data, null, 2);
        setOutput(String(resolved));
      } else if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            accumulated += decoder.decode(value, { stream: true });
            setOutput(accumulated);
          }
        }
        const flushText = decoder.decode();
        if (flushText) {
          accumulated += flushText;
          setOutput(accumulated);
        }
      } else {
        const fallbackText = await response.text();
        setOutput(fallbackText);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unexpected error while running this AI tool.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures in restricted frames
    }
  };

  return (
    <section
      aria-label={`${toolName} Interactive Runner`}
      className="rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-[#0D1322] p-6 sm:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Terminal className="w-4 h-4 text-cyan-700 dark:text-[#00D9FF]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              {toolName} Runner
            </h2>
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
              Endpoint: {endpoint} · Streaming Enabled
            </p>
          </div>
        </div>

        {samplePrompt && (
          <button
            type="button"
            onClick={() => {
              setPrompt(samplePrompt);
              setError(null);
            }}
            className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-indigo-500/30 bg-slate-50 dark:bg-[#070B14] hover:border-cyan-500/50 text-xs font-semibold text-indigo-700 dark:text-[#00D9FF] transition whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Load Sample Prompt
          </button>
        )}
      </div>

      <form onSubmit={handleRun} className="space-y-4">
        <div>
          <label
            htmlFor="tool-runner-prompt"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2"
          >
            Input Prompt
          </label>
          <textarea
            id="tool-runner-prompt"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-[#070B14] px-4 py-3 text-sm text-slate-950 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D9FF] leading-relaxed"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D9FF] via-[#6366F1] to-[#8B5CF6] hover:opacity-95 disabled:opacity-50 text-slate-950 font-bold text-sm transition inline-flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Streaming Gemini Response...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run {toolName}</span>
              </>
            )}
          </button>

          {(prompt || output) && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setPrompt('');
                setOutput('');
                setError(null);
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-[#070B14] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </form>

      {(output || isLoading) && (
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-indigo-700 dark:text-[#00D9FF]">
              {isLoading ? 'Streaming Output...' : 'Generated Output'}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-indigo-500/30 bg-slate-100 dark:bg-[#070B14] text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-cyan-500/60 transition inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Output</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] p-4 sm:p-5 text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-sans min-h-[140px] max-h-[540px] overflow-y-auto custom-scrollbar">
            {output || 'Waiting for Gemini stream...'}
          </div>
        </div>
      )}
    </section>
  );
}
