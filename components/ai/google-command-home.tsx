'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  Layers,
  Loader2,
  Puzzle,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { loginWithGoogle, useAuth } from '@/components/auth-provider';
import { deductUserCreditAtomic } from '@/lib/services/userQuotaService';
import { trackStudioEvent } from '@/lib/analytics';
import { BRAND_NAME, TOOLBOX_NAME } from '@/lib/seo/site-config';

interface SourceItem {
  title: string;
  uri: string;
}

interface CollectedItem {
  id: string;
  userId: string;
  query: string;
  title?: string;
  category: string;
  summary: string;
  keyMetrics?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  sources?: SourceItem[];
  modelUsed?: string;
  createdAt?: any;
}

const GOOGLE_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'SAAS_NICHE_INTEL', label: 'SaaS Ideas' },
  { id: 'CHROME_EXTENSION_IDEAS', label: 'Extensions' },
  { id: 'MARKET_LEADS_SEO', label: 'Leads & SEO' },
  { id: 'AGENT_EVOLVER_RESEARCH', label: 'Agent Evolver' },
] as const;

const QUICK_SHORTCUTS = [
  {
    title: 'AI SaaS Builder',
    subtitle: 'Generate micro-SaaS',
    prompt: 'Top profitable AI micro-SaaS ideas with low competition in 2026',
    category: 'SAAS_NICHE_INTEL',
    icon: Layers,
    ringClass:
      'text-cyan-700 dark:text-[#00D9FF] bg-cyan-50 dark:bg-[#00D9FF]/12 border-cyan-300 dark:border-[#00D9FF]/35',
  },
  {
    title: 'Chrome Extension',
    subtitle: 'Scaffold & ideas',
    prompt: 'High demand Chrome extension ideas for productivity and SEO in 2026',
    category: 'CHROME_EXTENSION_IDEAS',
    icon: Puzzle,
    ringClass:
      'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-[#6366F1]/15 border-indigo-300 dark:border-[#6366F1]/35',
  },
  {
    title: 'SEO & Leads',
    subtitle: 'Auto-collect data',
    prompt: 'B2B automation agency lead generation niches and pricing benchmarks',
    category: 'MARKET_LEADS_SEO',
    icon: TrendingUp,
    ringClass:
      'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-[#8B5CF6]/15 border-violet-300 dark:border-[#8B5CF6]/35',
  },
  {
    title: 'Agent Evolver',
    subtitle: 'Optimize workflows',
    prompt: 'Best autonomous multi-agent workflow architectures using Gemini and Claude',
    category: 'AGENT_EVOLVER_RESEARCH',
    icon: Zap,
    ringClass:
      'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/35',
  },
] as const;

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '').replace(/\r?\n/g, ' ');
  const safe = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadBlob(content: string, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatCreatedAt(val: any): string {
  if (!val) return new Date().toISOString();
  if (typeof val?.toDate === 'function') return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export function NisarGoogleCommandHome() {
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searching, setSearching] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'info' | 'success' | 'error';
    text: string;
  } | null>(null);
  const [items, setItems] = useState<CollectedItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    if (!db || !user?.uid) {
      setLoadingItems(false);
      return;
    }

    setLoadingItems(true);
    const q = query(
      collection(db, 'collected_research_data'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs: CollectedItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CollectedItem, 'id'>),
        }));
        docs.sort((a, b) => {
          const tA = a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : new Date(a.createdAt || 0).getTime();
          const tB = b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });
        setItems(docs.slice(0, 40));
        setLoadingItems(false);
      },
      (err) => {
        setLoadingItems(false);
        try {
          handleFirestoreError(err, OperationType.LIST, 'collected_research_data');
        } catch {
          // Handled safely
        }
      }
    );

    return () => unsub();
  }, [user?.uid]);

  async function runGoogleStyleSearch(customQuery?: string, customCat?: string) {
    const finalQuery = (customQuery ?? searchInput).trim();
    if (!finalQuery || searching) return;

    const chosenCat =
      customCat || (activeFilter === 'ALL' ? 'SAAS_NICHE_INTEL' : activeFilter);

    setSearching(true);
    setStatusBanner({
      type: 'info',
      text: `Searching live web sources & auto-storing "${finalQuery}" into Firestore...`,
    });

    try {
      let remainingCreditsAfter: number | null = null;
      if (user?.uid) {
        const quota = await deductUserCreditAtomic(user.uid, 1);
        if (!quota.ok) {
          setStatusBanner({
            type: 'error',
            text: quota.reason || 'Insufficient credits. Open Billing Hub to top up.',
          });
          setSearching(false);
          return;
        }
        remainingCreditsAfter = quota.remainingCredits;
      }

      const res = await fetch('/api/search-collector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: finalQuery,
          category: chosenCat,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || `Search error (HTTP ${res.status}).`);
      }

      const normalizedSources: SourceItem[] = Array.isArray(data.sources)
        ? data.sources
            .filter((s: any) => s && typeof s.uri === 'string')
            .slice(0, 8)
            .map((s: any) => ({
              title: String(s.title || s.uri).slice(0, 160),
              uri: String(s.uri).slice(0, 600),
            }))
        : [];

      let savedId = `local_${Date.now()}`;

      if (user?.uid && db) {
        const docRef = await addDoc(collection(db, 'collected_research_data'), {
          userId: user.uid,
          query: finalQuery.slice(0, 500),
          title: String(data.title || finalQuery).slice(0, 220),
          category: chosenCat.slice(0, 80),
          summary: String(data.summary || '').slice(0, 2000),
          keyMetrics: String(data.keyMetrics || `${normalizedSources.length} verified web sources`).slice(0, 320),
          sourceTitle: String(data.sourceTitle || normalizedSources[0]?.title || 'Google Search Grounding').slice(0, 220),
          sourceUrl: String(data.sourceUrl || normalizedSources[0]?.uri || '').slice(0, 600),
          sources: normalizedSources,
          modelUsed: String(data.modelUsed || 'gemini-4-hydrogen').slice(0, 80),
          createdAt: serverTimestamp(),
        });
        savedId = docRef.id;
      } else {
        const localRecord: CollectedItem = {
          id: savedId,
          userId: 'guest',
          query: finalQuery,
          title: String(data.title || finalQuery),
          category: chosenCat,
          summary: String(data.summary || ''),
          keyMetrics: String(data.keyMetrics || ''),
          sourceTitle: String(data.sourceTitle || ''),
          sourceUrl: String(data.sourceUrl || ''),
          sources: normalizedSources,
          modelUsed: String(data.modelUsed || 'gemini-4-hydrogen'),
          createdAt: new Date().toISOString(),
        };
        setItems((prev) => [localRecord, ...prev]);
      }

      trackStudioEvent('search_auto_collect', {
        category: chosenCat,
        sources_count: normalizedSources.length,
        surface: 'google_command_home',
      });

      setStatusBanner({
        type: 'success',
        text: user?.uid
          ? `Saved directly to Firestore (ID: ${savedId.slice(0, 10)}) · Remaining Credits: ${remainingCreditsAfter ?? 'Synced'}`
          : `Collected live grounded result in preview session. Sign in with Google to persist into Firestore.`,
      });

      if (!customQuery) setSearchInput('');
    } catch (err: unknown) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Network error while searching.',
      });
    } finally {
      setSearching(false);
    }
  }

  async function handleDeleteItem(id: string) {
    if (id.startsWith('local_')) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    if (!db || !user?.uid) return;
    try {
      await deleteDoc(doc(db, 'collected_research_data', id));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `collected_research_data/${id}`);
      } catch {
        setStatusBanner({ type: 'error', text: 'Unable to delete record.' });
      }
    }
  }

  function handleExportCsv() {
    if (!items.length) return;
    const date = new Date().toISOString().slice(0, 10);
    const headers = ['id', 'category', 'query', 'summary', 'sources', 'createdAt'];
    const rows = [
      headers.map(escapeCsvCell).join(','),
      ...items.map((item) => {
        const sourcesList =
          item.sources && item.sources.length > 0
            ? item.sources.map((s) => `${s.title} (${s.uri})`).join(' | ')
            : item.sourceUrl
            ? `${item.sourceTitle || 'Source'} (${item.sourceUrl})`
            : '';
        return [
          item.id,
          item.category,
          item.query,
          item.summary,
          sourcesList,
          formatCreatedAt(item.createdAt),
        ]
          .map(escapeCsvCell)
          .join(',');
      }),
    ];
    downloadBlob(
      `\uFEFF${rows.join('\r\n')}`,
      'text/csv;charset=utf-8',
      `nisar-ai-studio-${date}.csv`
    );
    trackStudioEvent('export_collected_data', {
      format: 'csv',
      total_records: items.length,
    });
  }

  function handleExportJson() {
    if (!items.length) return;
    const date = new Date().toISOString().slice(0, 10);
    const payload = {
      studio: BRAND_NAME,
      toolbox: TOOLBOX_NAME,
      userId: user?.uid || 'guest',
      exportedAt: new Date().toISOString(),
      totalRecords: items.length,
      records: items.map((item) => ({
        id: item.id,
        category: item.category,
        query: item.query,
        title: item.title || item.query,
        summary: item.summary,
        sources:
          item.sources && item.sources.length > 0
            ? item.sources
            : item.sourceUrl
            ? [{ title: item.sourceTitle || 'Source', uri: item.sourceUrl }]
            : [],
        createdAt: formatCreatedAt(item.createdAt),
      })),
    };
    downloadBlob(
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8',
      `nisar-ai-studio-${date}.json`
    );
    trackStudioEvent('export_collected_data', {
      format: 'json',
      total_records: items.length,
    });
  }

  const visibleItems = useMemo(() => {
    if (activeFilter === 'ALL') return items;
    return items.filter((item) => item.category === activeFilter);
  }, [items, activeFilter]);

  return (
    <div className="space-y-8">
      {/* Center Google-Style Hero Search Area */}
      <section className="rounded-3xl border border-slate-200 dark:border-[#00D9FF]/20 black:border-neutral-800 bg-white dark:bg-[#0B0F19]/90 black:bg-[#0a0a0a] backdrop-blur-xl px-4 sm:px-8 pt-10 pb-8 shadow-xl shadow-slate-950/5 dark:shadow-[#00D9FF]/5 black:shadow-none transition-colors duration-150">
        <div className="mx-auto w-full max-w-3xl text-center space-y-6">
          {/* Multi-Accent Brand Wordmark */}
          <div className="select-none space-y-1.5">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              <span className="text-cyan-600 dark:text-[#00D9FF]">N</span>
              <span className="text-indigo-600 dark:text-[#6366F1]">I</span>
              <span className="text-violet-600 dark:text-[#8B5CF6]">S</span>
              <span className="text-sky-600 dark:text-[#22D3EE]">A</span>
              <span className="text-emerald-600 dark:text-emerald-400">R</span>{' '}
              <span className="text-slate-950 dark:text-white font-bold">AI</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 black:text-neutral-400">
              Search &amp; Auto-Collect Engine · Direct Firestore Sync
            </p>
          </div>

          {/* Wide Rounded Pill Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void runGoogleStyleSearch();
            }}
            className="mx-auto w-full space-y-4"
          >
            <div className="flex items-center rounded-full border border-slate-300 dark:border-slate-700/90 black:border-neutral-700 bg-slate-50 dark:bg-[#050811] black:bg-black px-4 sm:px-5 py-2.5 shadow-lg shadow-slate-900/5 dark:shadow-[#00D9FF]/10 black:shadow-none focus-within:border-[#00D9FF] focus-within:ring-2 focus-within:ring-[#00D9FF]/30 transition">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search NISAR AI or type a research query to auto-collect..."
                disabled={searching}
                className="w-full bg-transparent px-3 sm:px-4 py-1 text-sm sm:text-base text-slate-950 dark:text-white placeholder:text-slate-500 focus:outline-none"
              />

              {searchInput && !searching && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                disabled={searching || !searchInput.trim()}
                className="ml-2 shrink-0 min-h-[40px] rounded-full bg-gradient-to-r from-[#00D9FF] via-[#6366F1] to-[#8B5CF6] px-5 py-2 text-xs sm:text-sm font-bold text-slate-950 hover:opacity-95 disabled:opacity-50 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>

            {/* Google-Style Action Buttons Under Search Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="submit"
                disabled={searching || !searchInput.trim()}
                className="min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 black:border-neutral-800 bg-slate-50 dark:bg-[#070B14] black:bg-black px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-[#00D9FF] disabled:opacity-50 whitespace-nowrap cursor-pointer transition"
              >
                NISAR Search &amp; Auto-Store
              </button>
              <button
                type="button"
                disabled={searching}
                onClick={() =>
                  void runGoogleStyleSearch(
                    'Trending profitable AI SaaS and automation opportunities today',
                    'SAAS_NICHE_INTEL'
                  )
                }
                className="min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 black:border-neutral-800 bg-slate-50 dark:bg-[#070B14] black:bg-black px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-[#6366F1] disabled:opacity-50 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
                <span>I&apos;m Feeling Lucky (Auto-Discover)</span>
              </button>
            </div>
          </form>

          {/* 4 Google New-Tab Style Circular Shortcut Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {QUICK_SHORTCUTS.map((tile) => {
              const TileIcon = tile.icon;
              return (
                <button
                  key={tile.title}
                  type="button"
                  disabled={searching}
                  onClick={() => {
                    setSearchInput(tile.prompt);
                    void runGoogleStyleSearch(tile.prompt, tile.category);
                  }}
                  className="group flex flex-col items-center rounded-2xl border border-slate-200 dark:border-slate-800/90 black:border-neutral-800 bg-slate-50/70 dark:bg-[#070B14]/80 black:bg-black p-4 hover:border-[#00D9FF]/50 hover:bg-slate-100/80 dark:hover:bg-[#0F1626] black:hover:bg-[#111111] disabled:opacity-50 cursor-pointer transition"
                >
                  <div
                    className={`h-11 w-11 rounded-full border flex items-center justify-center ${tile.ringClass}`}
                  >
                    <TileIcon className="w-5 h-5" />
                  </div>
                  <span className="mt-2.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-[#00D9FF] transition">
                    {tile.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 black:text-neutral-400">
                    {tile.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {!user && (
            <div className="rounded-xl border border-indigo-500/25 black:border-neutral-800 bg-indigo-50/60 dark:bg-[#050811] black:bg-black px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Sign in with Google to auto-save search results directly into Firestore (`collected_research_data`) and sync your live daily credits.
              </p>
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00D9FF] to-[#6366F1] text-slate-950 font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign in with Google
              </button>
            </div>
          )}

          {statusBanner && (
            <div
              className={`rounded-xl border px-4 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 ${
                statusBanner.type === 'error'
                  ? 'border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200'
                  : statusBanner.type === 'success'
                  ? 'border-emerald-500/35 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                  : 'border-[#00D9FF]/35 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-200'
              }`}
            >
              {statusBanner.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : statusBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              )}
              <span>{statusBanner.text}</span>
            </div>
          )}
        </div>
      </section>

      {/* Google Search Results Tabs + Export Bar + Live Feed */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 black:border-neutral-800 bg-white dark:bg-[#0B0F19]/90 black:bg-[#0a0a0a] overflow-hidden transition-colors duration-150">
        <div className="border-b border-slate-200 dark:border-slate-800 black:border-neutral-800 bg-slate-50/80 dark:bg-[#070B14] black:bg-black px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {GOOGLE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-3.5 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition ${
                  activeFilter === tab.id
                    ? 'border-[#00D9FF] text-indigo-700 dark:text-[#00D9FF]'
                    : 'border-transparent text-slate-600 dark:text-slate-400 black:text-neutral-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 py-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!items.length}
              className="min-h-[36px] rounded-xl border border-emerald-500/35 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:border-emerald-400 disabled:opacity-40 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="tabular-nums">Export CSV ({items.length})</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              disabled={!items.length}
              className="min-h-[36px] rounded-xl border border-[#6366F1]/40 bg-indigo-50 dark:bg-[#6366F1]/15 px-3 py-1.5 text-xs font-semibold text-indigo-800 dark:text-indigo-300 hover:border-[#6366F1] disabled:opacity-40 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span className="tabular-nums">Export JSON ({items.length})</span>
            </button>
          </div>
        </div>

        {/* Google Search Results Feed */}
        <div className="p-5 sm:p-6 space-y-5">
          <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 black:text-neutral-400">
            Showing {visibleItems.length} auto-collected Firestore results (
            <code className="text-indigo-700 dark:text-[#22D3EE]">
              collected_research_data
            </code>
            )
          </p>

          {loadingItems ? (
            <div className="py-10 flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-[#00D9FF]" />
              <span>Syncing live Firestore search results...</span>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 black:border-neutral-800 bg-slate-50 dark:bg-[#050811] black:bg-black p-10 text-center text-sm text-slate-600 dark:text-slate-400 black:text-neutral-400">
              Type any topic in the Google-style search bar above or click one of the 4 shortcut tiles — live grounded results appear here and auto-save into Firestore.
            </div>
          ) : (
            <div className="space-y-4">
              {visibleItems.map((item) => {
                const links: SourceItem[] =
                  item.sources && item.sources.length > 0
                    ? item.sources
                    : item.sourceUrl
                    ? [
                        {
                          title: item.sourceTitle || 'Verified Source',
                          uri: item.sourceUrl,
                        },
                      ]
                    : [];

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800/90 black:border-neutral-800 bg-slate-50/70 dark:bg-[#070B14]/80 black:bg-black p-5 hover:border-[#00D9FF]/40 transition space-y-2.5"
                  >
                    {/* Google Breadcrumb URL Line */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="h-5 w-5 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#6366F1] text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0">
                        N
                      </span>
                      <span className="truncate">nisaraistudiovercel-app.vercel.app</span>
                      <span aria-hidden="true">&rsaquo;</span>
                      <span className="text-indigo-700 dark:text-[#00D9FF] font-mono truncate">
                        {item.category}
                      </span>
                      <span className="ml-auto font-mono text-[11px] text-slate-400 shrink-0">
                        #{item.id.slice(0, 8)}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleDeleteItem(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        aria-label={`Delete ${item.query}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Google Result Title */}
                    <h3 className="text-base sm:text-lg font-bold text-indigo-700 dark:text-[#22D3EE]">
                      {item.title || item.query}
                    </h3>

                    {/* Snippet Body */}
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {item.summary}
                    </p>

                    {/* Grounded Links */}
                    {links.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2.5">
                        {links.slice(0, 5).map((src, idx) => (
                          <a
                            key={`${item.id}_src_${idx}`}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050811] px-3 py-1.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 hover:border-[#00D9FF] max-w-[260px] transition"
                          >
                            <span className="truncate">{src.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-[#00D9FF]" />
                          </a>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
