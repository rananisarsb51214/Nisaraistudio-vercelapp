'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  GitBranch,
  Leaf,
  RotateCcw,
} from 'lucide-react';

export type PlaybookArea =
  | 'AI usage'
  | 'Compute'
  | 'Data and storage'
  | 'Frontend'
  | 'Media'
  | 'Measure';

export type ImpactLevel = 'high' | 'mid' | 'low';

export type FilterMode = 'all' | 'high' | 'quick' | 'not_done';

export interface PlaybookAction {
  id: string;
  area: PlaybookArea;
  title: string;
  description: string;
  impact: ImpactLevel;
  quickWin: boolean;
}

const STORAGE_KEY = 'nisar-green-playbook-progress-v1';

export const PLAYBOOK_AREAS: readonly ('All areas' | PlaybookArea)[] = [
  'All areas',
  'AI usage',
  'Compute',
  'Data and storage',
  'Frontend',
  'Media',
  'Measure',
] as const;

export const PLAYBOOK_FILTERS: readonly { id: FilterMode; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High impact' },
  { id: 'quick', label: 'Quick wins' },
  { id: 'not_done', label: 'Not done' },
] as const;

export const GREEN_PLAYBOOK_ITEMS: readonly PlaybookAction[] = [
  // AI usage
  {
    id: 'ai-cache-repeated-outputs',
    area: 'AI usage',
    title: 'Cache repeated AI outputs',
    description:
      'Store results for identical prompts (hashtags, SEO templates, captions) so they are not regenerated.',
    impact: 'high',
    quickWin: true,
  },
  {
    id: 'ai-route-by-task-size',
    area: 'AI usage',
    title: 'Route by task size',
    description:
      'Small models for captions, tags and classification; large models only for planning, code and long reasoning.',
    impact: 'high',
    quickWin: true,
  },
  {
    id: 'ai-cap-output-context',
    area: 'AI usage',
    title: 'Cap output length and context',
    description:
      'Set max tokens per task and send only the context a task needs.',
    impact: 'mid',
    quickWin: true,
  },
  {
    id: 'ai-batch-prompt-caching',
    area: 'AI usage',
    title: 'Use batch and prompt caching',
    description:
      'Run non-urgent jobs (daily content) through batch endpoints and cache long shared system prompts.',
    impact: 'high',
    quickWin: false,
  },
  {
    id: 'ai-fewer-better-drafts',
    area: 'AI usage',
    title: 'Generate fewer, better drafts',
    description: 'One strong draft plus one variation, not ten.',
    impact: 'mid',
    quickWin: true,
  },

  // Compute
  {
    id: 'compute-scale-to-zero',
    area: 'Compute',
    title: 'Scale Cloud Run to zero',
    description: 'Keep minimum instances at 0 for non-critical services.',
    impact: 'high',
    quickWin: true,
  },
  {
    id: 'compute-right-size',
    area: 'Compute',
    title: 'Right-size CPU and memory',
    description: 'Start small, raise limits only when metrics demand it.',
    impact: 'mid',
    quickWin: true,
  },
  {
    id: 'compute-low-carbon-region',
    area: 'Compute',
    title: 'Pick a low-carbon region',
    description:
      'Compare Google Cloud regions by carbon-free energy share, balanced against latency.',
    impact: 'high',
    quickWin: false,
  },
  {
    id: 'compute-batch-off-peak',
    area: 'Compute',
    title: 'Run batch jobs off-peak',
    description:
      'Schedule heavy jobs with Cloud Scheduler at cleaner-grid times where data exists.',
    impact: 'mid',
    quickWin: false,
  },
  {
    id: 'compute-stop-wasteful-retries',
    area: 'Compute',
    title: 'Stop wasteful retries',
    description:
      'Retry limits, backoff and idempotency keys prevent repeat work and duplicate AI calls.',
    impact: 'mid',
    quickWin: true,
  },

  // Data and storage
  {
    id: 'data-index-limit-firestore',
    area: 'Data and storage',
    title: 'Index and limit Firestore queries',
    description:
      'Indexed queries with limits and pagination instead of reading whole collections.',
    impact: 'mid',
    quickWin: true,
  },
  {
    id: 'data-retention-rules',
    area: 'Data and storage',
    title: 'Set retention rules',
    description:
      'Expire old drafts and temp media; keep audit logs as security policy requires.',
    impact: 'mid',
    quickWin: false,
  },
  {
    id: 'data-deduplicate-media',
    area: 'Data and storage',
    title: 'Deduplicate media assets',
    description:
      'Hash uploads so the same file is stored and processed once.',
    impact: 'low',
    quickWin: false,
  },

  // Frontend
  {
    id: 'frontend-static-isr',
    area: 'Frontend',
    title: 'Prefer static pages and ISR',
    description: 'Avoid re-rendering pages on every visit.',
    impact: 'high',
    quickWin: true,
  },
  {
    id: 'frontend-slim-bundle',
    area: 'Frontend',
    title: 'Slim the bundle',
    description: 'Lazy-load dashboard modules and optimize images.',
    impact: 'mid',
    quickWin: true,
  },
  {
    id: 'frontend-poll-less-push-more',
    area: 'Frontend',
    title: 'Poll less, push more',
    description:
      'Use Firestore listeners or Pub/Sub events instead of frequent polling.',
    impact: 'mid',
    quickWin: false,
  },

  // Media
  {
    id: 'media-compress-images',
    area: 'Media',
    title: 'Compress thumbnails and images',
    description: 'Export WebP or AVIF at the size each platform needs.',
    impact: 'mid',
    quickWin: true,
  },
  {
    id: 'media-render-approved-only',
    area: 'Media',
    title: 'Render only approved content',
    description:
      'Run video and image generation after approval, not before.',
    impact: 'high',
    quickWin: false,
  },

  // Measure
  {
    id: 'measure-track-tokens',
    area: 'Measure',
    title: 'Track tokens and requests per task',
    description: 'Log AI usage per module so waste is visible.',
    impact: 'high',
    quickWin: true,
  },
  {
    id: 'measure-cloud-carbon-reporting',
    area: 'Measure',
    title: 'Enable cloud carbon reporting',
    description: "Review your provider's carbon footprint tool monthly.",
    impact: 'high',
    quickWin: true,
  },
  {
    id: 'measure-baseline-target',
    area: 'Measure',
    title: 'Set a baseline, then a target',
    description:
      "Record this month's numbers and pick one or two measurable reductions.",
    impact: 'high',
    quickWin: true,
  },
] as const;

const ROUTER_STEPS: readonly string[] = [
  'Request',
  'Cache hit? return it',
  'Simple task? small model',
  'Not urgent? batch / off-peak',
  'Hard reasoning? large model',
  'Validate',
  'Cache + log tokens',
] as const;

function getImpactLabel(impact: ImpactLevel): string {
  if (impact === 'high') return 'High impact';
  if (impact === 'mid') return 'Medium impact';
  return 'Low impact';
}

function getImpactTextClass(impact: ImpactLevel): string {
  if (impact === 'high') {
    return 'text-emerald-700 dark:text-emerald-400 font-semibold';
  }
  if (impact === 'mid') {
    return 'text-teal-700 dark:text-teal-300 font-medium';
  }
  return 'text-slate-600 dark:text-slate-400 black:text-neutral-400 font-medium';
}

export function GreenPlaybook() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [selectedArea, setSelectedArea] = useState<'All areas' | PlaybookArea>('All areas');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [confirmingReset, setConfirmingReset] = useState(false);

  // Load saved progress safely from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const validIds = new Set(GREEN_PLAYBOOK_ITEMS.map((item) => item.id));
          const cleaned = parsed.filter(
            (val): val is string => typeof val === 'string' && validIds.has(val)
          );
          setCompletedIds(cleaned);
        }
      }
    } catch {
      // Ignore storage access or parse errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist changes safely to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
    } catch {
      // Ignore storage quota or restricted-context errors
    }
  }, [completedIds, hydrated]);

  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);

  const totalCount = GREEN_PLAYBOOK_ITEMS.length;
  const doneCount = completedIds.length;
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const highImpactDone = useMemo(
    () =>
      GREEN_PLAYBOOK_ITEMS.filter(
        (item) => item.impact === 'high' && completedSet.has(item.id)
      ).length,
    [completedSet]
  );

  const highImpactTotal = useMemo(
    () => GREEN_PLAYBOOK_ITEMS.filter((item) => item.impact === 'high').length,
    []
  );

  const areaCounts = useMemo(() => {
    const counts: Record<string, { total: number; done: number }> = {
      'All areas': { total: totalCount, done: doneCount },
    };
    for (const item of GREEN_PLAYBOOK_ITEMS) {
      if (!counts[item.area]) {
        counts[item.area] = { total: 0, done: 0 };
      }
      counts[item.area].total += 1;
      if (completedSet.has(item.id)) {
        counts[item.area].done += 1;
      }
    }
    return counts;
  }, [completedSet, doneCount, totalCount]);

  const filteredItems = useMemo(() => {
    return GREEN_PLAYBOOK_ITEMS.filter((item) => {
      if (selectedArea !== 'All areas' && item.area !== selectedArea) {
        return false;
      }
      if (filter === 'high' && item.impact !== 'high') return false;
      if (filter === 'quick' && !item.quickWin) return false;
      if (filter === 'not_done' && completedSet.has(item.id)) return false;
      return true;
    });
  }, [selectedArea, filter, completedSet]);

  const toggleItem = (id: string) => {
    setConfirmingReset(false);
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetProgress = () => {
    setCompletedIds([]);
    setConfirmingReset(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
          NISAR AI STUDIO · Build Smarter. Create Faster. Grow Better.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white flex items-center gap-2.5 text-balance">
              <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </span>
              <span>Green Playbook</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 black:text-neutral-400">
              Make NISAR AI Studio more energy-efficient and lower-carbon.
            </p>
          </div>

          {/* Reset progress control */}
          <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
            {confirmingReset ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 dark:text-slate-400 black:text-neutral-400">
                  Clear all {doneCount} checked?
                </span>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold whitespace-nowrap cursor-pointer transition-colors"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 black:border-neutral-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (doneCount > 0) setConfirmingReset(true);
                }}
                disabled={doneCount === 0}
                className="min-h-[36px] inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 black:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 underline underline-offset-4 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed cursor-pointer whitespace-nowrap transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Reset progress</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Card */}
      <section
        aria-label="Playbook completion progress"
        className="rounded-2xl border border-emerald-200/90 dark:border-emerald-900/60 black:border-neutral-800 bg-white dark:bg-[#0B0F19] black:bg-[#0a0a0a] p-5 sm:p-6 space-y-4 transition-colors duration-150"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div className="space-y-1">
            <p className="text-base sm:text-lg font-bold text-slate-950 dark:text-white font-mono tabular-nums">
              {doneCount} of {totalCount} actions done
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 black:text-neutral-400 font-mono tabular-nums">
              {highImpactDone} / {highImpactTotal} high-impact completed · Saved locally in this browser
            </p>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
            {percent}%
          </div>
        </div>

        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${doneCount} of ${totalCount} green playbook actions completed`}
          className="w-full h-2.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 black:bg-neutral-900 overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-200 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>

      {/* Area Tabs + Filter Bar */}
      <section
        aria-label="Checklist navigation and filters"
        className="space-y-3"
      >
        {/* Area Tabs */}
        <div
          role="tablist"
          aria-label="Sustainability areas"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 black:border-neutral-800"
        >
          {PLAYBOOK_AREAS.map((area) => {
            const isSelected = selectedArea === area;
            const stats = areaCounts[area] || { total: 0, done: 0 };
            return (
              <button
                key={area}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => setSelectedArea(area)}
                className={`min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold border-b-2 -mb-[5px] whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-t-lg ${
                  isSelected
                    ? 'border-emerald-600 dark:border-emerald-400 text-emerald-800 dark:text-emerald-300'
                    : 'border-transparent text-slate-600 dark:text-slate-400 black:text-neutral-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <span>{area}</span>
                <span className="text-[11px] font-mono tabular-nums opacity-75">
                  {stats.done}/{stats.total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Segmented Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Filter checklist items"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0B0F19] black:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 black:border-neutral-800"
          >
            {PLAYBOOK_FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f.id)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 black:text-neutral-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 black:text-neutral-400">
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'action' : 'actions'}
          </p>
        </div>
      </section>

      {/* Checklist Items */}
      <section aria-label="Green playbook actions" className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 black:border-neutral-800 bg-white dark:bg-[#0B0F19] black:bg-[#0a0a0a] p-8 sm:p-10 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {filter === 'not_done'
                ? `All actions in ${selectedArea} are complete.`
                : 'No checklist actions match the current area and filter.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedArea('All areas');
                setFilter('all');
              }}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Show all actions
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredItems.map((item) => {
              const checked = completedSet.has(item.id);
              return (
                <li key={item.id}>
                  <label
                    htmlFor={`green-action-${item.id}`}
                    className={`group flex items-start gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-150 cursor-pointer ${
                      checked
                        ? 'opacity-55 border-emerald-200/60 dark:border-emerald-950/60 black:border-neutral-900 bg-emerald-50/40 dark:bg-[#090d14] black:bg-[#060606]'
                        : 'border-slate-200 dark:border-slate-800 black:border-neutral-800 bg-white dark:bg-[#0B0F19] black:bg-[#0a0a0a] hover:border-emerald-500/60 black:hover:border-emerald-500/50'
                    }`}
                  >
                    {/* Accessible Checkbox */}
                    <span className="relative flex items-center justify-center pt-0.5 shrink-0">
                      <input
                        id={`green-action-${item.id}`}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(item.id)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-[#0B0F19] black:peer-focus-visible:ring-offset-black ${
                          checked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-slate-50 dark:bg-[#050811] black:bg-black border-slate-300 dark:border-slate-700 black:border-neutral-700 group-hover:border-emerald-500'
                        }`}
                      >
                        {checked && <Check className="w-4 h-4 stroke-[2.75]" />}
                      </span>
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h2
                          className={`text-sm sm:text-base font-bold leading-snug ${
                            checked
                              ? 'line-through text-slate-500 dark:text-slate-400 black:text-neutral-500'
                              : 'text-slate-950 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </h2>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 black:text-neutral-300 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Clean unboxed metadata row with typographic separators */}
                      <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className={getImpactTextClass(item.impact)}>
                          {getImpactLabel(item.impact)}
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-slate-400 dark:text-slate-600"
                        >
                          ·
                        </span>
                        <span
                          className={
                            item.quickWin
                              ? 'text-emerald-700 dark:text-emerald-300 font-medium'
                              : 'text-amber-700 dark:text-amber-300 font-medium'
                          }
                        >
                          {item.quickWin ? 'Quick win' : 'Needs planning'}
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-slate-400 dark:text-slate-600"
                        >
                          ·
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 black:text-neutral-400">
                          {item.area}
                        </span>
                      </div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Bottom Box: Smallest Sufficient Model Router */}
      <aside
        aria-label="Idea: smallest sufficient model router"
        className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 black:border-neutral-800 bg-emerald-50/60 dark:bg-[#0B0F19] black:bg-[#0a0a0a] p-5 sm:p-6 space-y-4 transition-colors duration-150"
      >
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
            Idea: smallest sufficient model router
          </h2>
        </div>

        <ol className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          {ROUTER_STEPS.map((step, index) => (
            <li key={step} className="inline-flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/70 black:border-neutral-800 bg-white dark:bg-[#050811] black:bg-black text-slate-800 dark:text-slate-200 font-mono text-xs font-medium">
                {step}
              </span>
              {index < ROUTER_STEPS.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                />
              )}
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
