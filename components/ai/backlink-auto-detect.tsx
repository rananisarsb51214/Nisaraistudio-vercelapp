'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Globe,
  History,
  Link2,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useAuth } from '../auth-provider';
import type { BacklinkScanReport, DetectedBacklink } from '@/types/links';

type FilterMode =
  | 'all'
  | 'matching'
  | 'external'
  | 'dofollow'
  | 'nofollow'
  | 'affiliate'
  | 'internal';

interface BacklinkAutoDetectProps {
  onSendToAffiliateConverter?: (url: string) => void;
}

export function BacklinkAutoDetect({ onSendToAffiliateConverter }: BacklinkAutoDetectProps) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid || 'default_user';

  const [targetUrl, setTargetUrl] = useState('https://vercel.com');
  const [targetDomain, setTargetDomain] = useState('');
  const [includeAiOutreach, setIncludeAiOutreach] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<BacklinkScanReport | null>(null);
  const [history, setHistory] = useState<BacklinkScanReport[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    void fetchScanHistory();
  }, [userId, authLoading]);

  const fetchScanHistory = async () => {
    try {
      const res = await fetch(`/api/backlinks/detect?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.scans)) {
        setHistory(data.scans);
      }
    } catch (e) {
      console.warn('Could not load backlink scan history:', e);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim() || isScanning) return;

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/backlinks/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: targetUrl.trim(),
          targetDomain: targetDomain.trim(),
          includeAiOutreach,
          userId,
          saveToFirestore: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Backlink scan failed.');
      }

      setReport(data.report);
      setFilterMode('all');
      void fetchScanHistory();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to scan URL.');
    } finally {
      setIsScanning(false);
    }
  };

  const filteredLinks = useMemo(() => {
    if (!report) return [];
    return report.links.filter((link) => {
      if (filterMode === 'matching' && !link.matchesTargetDomain) return false;
      if (filterMode === 'external' && link.category === 'internal') return false;
      if (filterMode === 'dofollow' && link.relType !== 'dofollow') return false;
      if (filterMode === 'nofollow' && link.relType === 'dofollow') return false;
      if (filterMode === 'affiliate' && !link.isAffiliateCandidate) return false;
      if (filterMode === 'internal' && link.category !== 'internal') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          link.url.toLowerCase().includes(q) ||
          link.anchorText.toLowerCase().includes(q) ||
          link.domain.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [report, filterMode, searchTerm]);

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
  };

  const handleExportCsv = () => {
    if (!report) return;
    const rows = [
      ['URL', 'Domain', 'Anchor Text', 'Rel', 'Category', 'Matches Target', 'Affiliate Candidate'],
      ...filteredLinks.map((l) => [
        `"${l.url.replace(/"/g, '""')}"`,
        `"${l.domain}"`,
        `"${l.anchorText.replace(/"/g, '""')}"`,
        `"${l.relType}"`,
        `"${l.category}"`,
        l.matchesTargetDomain ? 'Yes' : 'No',
        l.isAffiliateCandidate ? 'Yes' : 'No',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backlinks_${report.scannedDomain.replace(/[^a-z0-9]/gi, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-950 dark:text-slate-100">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-100 dark:from-indigo-950/60 via-cyan-50 dark:via-slate-900 to-white dark:to-slate-900 border border-indigo-500/30 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold uppercase tracking-wider">
              <Search className="w-3.5 h-3.5" />
              <span>Live Crawler &amp; SEO Audit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Backlink Auto-Detect Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Crawl any live webpage to auto-detect outbound backlinks,{' '}
              <code className="font-mono text-indigo-800 dark:text-indigo-300">dofollow</code> /{' '}
              <code className="font-mono text-indigo-800 dark:text-indigo-300">nofollow</code> /{' '}
              <code className="font-mono text-indigo-800 dark:text-indigo-300">sponsored</code>{' '}
              attributes, affiliate candidates, and Gemini AI outreach pitches.
            </p>
          </div>
        </div>
      </div>

      {/* Scanner Input Form */}
      <form
        onSubmit={handleScan}
        className="p-5 sm:p-6 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-lg space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1.5">
              Page URL to Crawl &amp; Detect Links
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1.5">
              Target Brand / Domain Filter (Optional)
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                placeholder="e.g. nisaraistudio.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <label className="inline-flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAiOutreach}
              onChange={(e) => setIncludeAiOutreach(e.target.checked)}
              className="w-4 h-4 rounded border-slate-400 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
              Generate Gemini AI SEO Score &amp; Outreach Email (uses 1 quota credit)
            </span>
          </label>

          <button
            type="submit"
            disabled={isScanning || !targetUrl.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning Live Page...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Auto-Detect Backlinks</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/40 border border-rose-500/40 text-xs text-rose-900 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      {/* Active Scan Report */}
      {report && (
        <div className="space-y-6">
          {/* Page Metadata & Export */}
          <div className="p-4 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-mono text-indigo-800 dark:text-indigo-300 font-semibold truncate">
                {report.scannedUrl} • HTTP {report.fetchStatus}
              </div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white truncate">
                {report.pageTitle}
              </h2>
              {report.fetchNote && (
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">{report.fetchNote}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV ({filteredLinks.length})
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Links', val: report.summary.totalLinks, accent: 'text-slate-950 dark:text-white' },
              { label: 'External Links', val: report.summary.externalLinks, accent: 'text-cyan-800 dark:text-cyan-300' },
              { label: 'Dofollow', val: report.summary.dofollowCount, accent: 'text-emerald-800 dark:text-emerald-300' },
              { label: 'Nofollow / Sponsored', val: report.summary.nofollowOrSponsoredCount, accent: 'text-amber-800 dark:text-amber-300' },
              { label: 'Affiliate Candidates', val: report.summary.affiliateLinksCount, accent: 'text-purple-800 dark:text-purple-300' },
              { label: 'Target Matches', val: report.summary.matchingBacklinksCount, accent: 'text-indigo-800 dark:text-indigo-300' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl"
              >
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  {kpi.label}
                </div>
                <div className={`text-xl font-black mt-0.5 ${kpi.accent}`}>{kpi.val}</div>
              </div>
            ))}
          </div>

          {/* AI SEO Audit & Outreach Panel */}
          {report.aiAudit && (
            <div className="p-5 bg-white dark:bg-slate-900/80 border border-indigo-500/40 rounded-2xl shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    Gemini AI Backlink &amp; SEO Audit
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 text-xs font-bold">
                  SEO Score: {report.aiAudit.seoScore}/100
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                {report.aiAudit.verdict}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    Anchor &amp; Attribute Recommendations
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                    {report.aiAudit.anchorInsights.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                      Suggested Outreach Email Pitch
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('pitch', report.aiAudit?.outreachPitch || '')}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'pitch' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === 'pitch' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {report.aiAudit.outreachPitch}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar & Detected Links Table */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: `All (${report.links.length})` },
                    { id: 'external', label: `External (${report.summary.externalLinks})` },
                    { id: 'dofollow', label: `Dofollow (${report.summary.dofollowCount})` },
                    { id: 'nofollow', label: `Nofollow/Sponsored (${report.summary.nofollowOrSponsoredCount})` },
                    { id: 'affiliate', label: `Affiliate (${report.summary.affiliateLinksCount})` },
                    { id: 'matching', label: `Matches (${report.summary.matchingBacklinksCount})` },
                  ] as { id: FilterMode; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterMode(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      filterMode === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter URL, anchor, domain..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[440px]">
              {filteredLinks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-600 dark:text-slate-400">
                  No links match the active filter.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 sticky top-0 z-10 border-b border-slate-300 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-bold">Anchor Text</th>
                      <th className="py-2.5 px-4 font-bold">Destination URL</th>
                      <th className="py-2.5 px-4 font-bold">Rel</th>
                      <th className="py-2.5 px-4 font-bold">Type</th>
                      <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredLinks.map((link: DetectedBacklink) => (
                      <tr
                        key={link.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          link.matchesTargetDomain ? 'bg-indigo-50/70 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                          {link.anchorText}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300 max-w-[280px] truncate">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline inline-flex items-center gap-1"
                          >
                            <span className="truncate">{link.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                          </a>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              link.relType === 'dofollow'
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300'
                            }`}
                          >
                            {link.relType}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                            {link.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopy(link.id, link.url)}
                            className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === link.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                          {onSendToAffiliateConverter && (
                            <button
                              type="button"
                              onClick={() => onSendToAffiliateConverter(link.url)}
                              className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              title="Convert into an Affiliate Link"
                            >
                              <Tag className="w-3 h-3" />
                              Monetize
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Backlink Scans from Firestore */}
      {history.length > 0 && (
        <div className="p-5 bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
            <History className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
            <span>Recent Backlink Scans (Firestore)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {history.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setReport(item)}
                className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-indigo-500/50 transition cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-950 dark:text-white truncate">
                  {item.scannedDomain}
                </div>
                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate mt-0.5">
                  {item.scannedUrl}
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] font-semibold text-indigo-800 dark:text-indigo-300">
                  <span>{item.summary.totalLinks} links</span>
                  <span>{item.summary.dofollowCount} dofollow</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
