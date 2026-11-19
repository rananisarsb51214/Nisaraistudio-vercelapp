'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  Globe,
  Loader2,
  Search,
  Sparkles,
  Trash2,
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

export interface StoredResearchRecord {
  id: string;
  userId: string;
  query: string;
  title: string;
  category: string;
  summary: string;
  keyMetrics: string;
  sourceUrl: string;
  sourceTitle: string;
  modelUsed: string;
  createdAt?: any;
}

const PRESET_CATEGORIES = [
  'Market & SEO Intelligence',
  'AI SaaS Competitors',
  'Affiliate & Monetization',
  'Pakistan Tech & E-Commerce',
  'Lead Generation Trends',
];

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '').replace(/\r?\n/g, ' ');
  if (/[",]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatCreatedAt(val: any): string {
  if (!val) return new Date().toISOString();
  if (typeof val?.toDate === 'function') return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export function SearchAutoCollectAgent() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
  const [filterText, setFilterText] = useState('');
  const [isCollecting, setIsCollecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState<string>('');
  const [latestSources, setLatestSources] = useState<{ title: string; url: string }[]>([]);
  const [records, setRecords] = useState<StoredResearchRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    if (!db || !user?.uid) {
      setLoadingRecords(false);
      return;
    }

    setLoadingRecords(true);
    const q = query(
      collection(db, 'collected_research_data'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: StoredResearchRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StoredResearchRecord, 'id'>),
        }));
        items.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });
        setRecords(items);
        setLoadingRecords(false);
      },
      (err) => {
        setLoadingRecords(false);
        try {
          handleFirestoreError(err, OperationType.LIST, 'collected_research_data');
        } catch {
          // Handled safely
        }
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const filteredRecords = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.query?.toLowerCase().includes(q) ||
        r.summary?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q)
    );
  }, [records, filterText]);

  const handleRunSearchCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery || isCollecting) return;

    setIsCollecting(true);
    setErrorMsg(null);
    setStatusNotice(null);

    try {
      if (user?.uid) {
        const quota = await deductUserCreditAtomic(user.uid, 1);
        if (!quota.ok) {
          setErrorMsg(quota.reason || 'Insufficient credits.');
          setIsCollecting(false);
          return;
        }
      }

      const res = await fetch('/api/ai/search-collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery, category }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || `Search & Auto-Collect failed (HTTP ${res.status}).`);
      }

      setExecutiveSummary(data.executiveSummary || '');
      setLatestSources(Array.isArray(data.sources) ? data.sources : []);

      const incomingItems = Array.isArray(data.items) ? data.items : [];
      let savedCount = 0;

      if (user?.uid && db) {
        for (const item of incomingItems) {
          await addDoc(collection(db, 'collected_research_data'), {
            userId: user.uid,
            query: cleanQuery.slice(0, 500),
            title: String(item.title || cleanQuery).slice(0, 220),
            category: String(item.category || category).slice(0, 80),
            summary: String(item.summary || '').slice(0, 2000),
            keyMetrics: String(item.keyMetrics || '').slice(0, 320),
            sourceUrl: String(item.sourceUrl || '').slice(0, 600),
            sourceTitle: String(item.sourceTitle || '').slice(0, 220),
            modelUsed: String(data.modelUsed || 'gemini-4-hydrogen').slice(0, 80),
            createdAt: serverTimestamp(),
          });
          savedCount += 1;
        }
      } else {
        const localBatch: StoredResearchRecord[] = incomingItems.map((item: any, idx: number) => ({
          id: `local_${Date.now()}_${idx}`,
          userId: 'guest',
          query: cleanQuery,
          title: String(item.title || cleanQuery),
          category: String(item.category || category),
          summary: String(item.summary || ''),
          keyMetrics: String(item.keyMetrics || ''),
          sourceUrl: String(item.sourceUrl || ''),
          sourceTitle: String(item.sourceTitle || ''),
          modelUsed: String(data.modelUsed || 'gemini-4-hydrogen'),
          createdAt: new Date().toISOString(),
        }));
        setRecords((prev) => [...localBatch, ...prev]);
        savedCount = localBatch.length;
      }

      trackStudioEvent('search_auto_collect', {
        category,
        records_collected: savedCount,
        sources_count: Array.isArray(data.sources) ? data.sources.length : 0,
      });

      setStatusNotice(
        user?.uid
          ? `Collected and synced ${savedCount} grounded records to Firestore (collected_research_data).`
          : `Collected ${savedCount} grounded records in preview session. Sign in with Google to persist in Firestore.`
      );
      setSearchQuery('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Search & Auto-Collect failed.');
    } finally {
      setIsCollecting(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (recordId.startsWith('local_')) {
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      return;
    }
    if (!db || !user?.uid) return;
    try {
      await deleteDoc(doc(db, 'collected_research_data', recordId));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `collected_research_data/${recordId}`);
      } catch {
        setErrorMsg('Unable to delete record.');
      }
    }
  };

  const handleExportCsv = () => {
    if (records.length === 0) return;
    const headers = [
      'id',
      'query',
      'category',
      'title',
      'summary',
      'keyMetrics',
      'sourceTitle',
      'sourceUrl',
      'modelUsed',
      'createdAt',
    ];
    const rows = records.map((r) =>
      [
        r.id,
        r.query,
        r.category,
        r.title,
        r.summary,
        r.keyMetrics,
        r.sourceTitle,
        r.sourceUrl,
        r.modelUsed,
        formatCreatedAt(r.createdAt),
      ]
        .map(escapeCsvCell)
        .join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nisar-ai-studio-collected-data-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    trackStudioEvent('export_collected_data', {
      format: 'csv',
      total_records: records.length,
    });
  };

  const handleExportJson = () => {
    if (records.length === 0) return;
    const payload = {
      studio: BRAND_NAME,
      toolbox: TOOLBOX_NAME,
      userId: user?.uid || 'guest',
      exportedAt: new Date().toISOString(),
      totalRecords: records.length,
      records: records.map((r) => ({
        id: r.id,
        query: r.query,
        category: r.category,
        title: r.title,
        summary: r.summary,
        keyMetrics: r.keyMetrics,
        sourceTitle: r.sourceTitle,
        sourceUrl: r.sourceUrl,
        modelUsed: r.modelUsed,
        createdAt: formatCreatedAt(r.createdAt),
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nisar-ai-studio-collected-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    trackStudioEvent('export_collected_data', {
      format: 'json',
      total_records: records.length,
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Search & Auto-Collect Command Card */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#00D9FF]/25 bg-white dark:bg-[#0B0F19]/90 backdrop-blur-md p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 dark:text-[#00D9FF]">
              <span>Google Search Grounding</span>
              <span aria-hidden="true">·</span>
              <span>Firestore Auto-Sync</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
              Search &amp; Auto-Collect Agent
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Query live web data with Gemini Google Search grounding, auto-store structured records in Firestore, and export as CSV or JSON.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={records.length === 0}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 dark:border-[#00D9FF]/35 bg-slate-50 dark:bg-[#070B14] hover:border-[#00D9FF] text-xs font-semibold text-slate-800 dark:text-[#22D3EE] inline-flex items-center gap-2 disabled:opacity-40 whitespace-nowrap cursor-pointer transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              disabled={records.length === 0}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 dark:border-[#8B5CF6]/40 bg-slate-50 dark:bg-[#070B14] hover:border-[#8B5CF6] text-xs font-semibold text-slate-800 dark:text-violet-300 inline-flex items-center gap-2 disabled:opacity-40 whitespace-nowrap cursor-pointer transition"
            >
              <FileJson className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {!user && (
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-50/70 dark:bg-[#070B14] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              Sign in with Google to automatically sync collected records into your Firestore database (`collected_research_data`).
            </p>
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#6366F1] text-slate-950 font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign in with Google
            </button>
          </div>
        )}

        <form onSubmit={handleRunSearchCollect} className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Top AI automation SaaS trends and pricing models in 2026..."
              disabled={isCollecting}
              className="w-full min-h-[46px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] pl-10 pr-4 py-2.5 text-sm text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]"
              required
            />
          </div>
          <div className="lg:col-span-3">
            <select
              aria-label="Research Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isCollecting}
              className="w-full min-h-[46px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]"
            >
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={isCollecting || !searchQuery.trim()}
              className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D9FF] via-[#6366F1] to-[#8B5CF6] text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap cursor-pointer transition"
            >
              {isCollecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Collecting Live...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Search &amp; Auto-Collect</span>
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

        {statusNotice && (
          <div className="p-4 rounded-xl border border-emerald-500/35 bg-emerald-50 dark:bg-emerald-950/25 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{statusNotice}</span>
          </div>
        )}

        {executiveSummary && (
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-3">
            <div className="text-xs font-mono text-indigo-700 dark:text-[#00D9FF] font-semibold">
              Latest Grounded Executive Summary
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {executiveSummary}
            </p>
            {latestSources.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
                <span className="font-mono text-slate-500">Verified Web Sources:</span>
                {latestSources.map((src) => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-700 dark:text-[#22D3EE] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[220px]">{src.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Live Firestore Synced Research Table */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19]/90 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-700 dark:text-[#00D9FF]" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
                Collected Research Vault
              </h3>
              <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {records.length} stored records · Live Firestore sync
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter collected records..."
              className="w-full min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]"
            />
          </div>
        </div>

        {loadingRecords ? (
          <div className="py-12 flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#00D9FF]" />
            <span>Syncing collected_research_data...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-2 px-4">
            <Download className="w-7 h-7 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No collected research records yet
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Run a live Google Search query above to auto-collect structured findings and export them as CSV or JSON.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <th className="py-3 pr-4 font-semibold">Finding &amp; Query</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Key Metrics</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 pl-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                {filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#070B14]/70 transition align-top"
                  >
                    <td className="py-3.5 pr-4 max-w-md">
                      <div className="font-semibold text-slate-950 dark:text-white">
                        {rec.title}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {rec.summary}
                      </p>
                      <div className="text-[11px] font-mono text-slate-500 mt-1">
                        Query: {rec.query}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">
                      {rec.category || 'Research'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-700 dark:text-slate-300 max-w-[200px]">
                      {rec.keyMetrics || 'Grounded'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      {rec.sourceUrl ? (
                        <a
                          href={rec.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-700 dark:text-[#00D9FF] hover:underline"
                        >
                          <span className="truncate max-w-[140px]">
                            {rec.sourceTitle || 'Open Source'}
                          </span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-500">Search Grounded</span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        aria-label={`Delete ${rec.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
