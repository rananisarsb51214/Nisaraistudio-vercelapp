'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  RefreshCw,
  Sparkles,
  Tag,
  Trash2,
  Zap,
} from 'lucide-react';
import { useAuth } from '../auth-provider';
import { convertLinksInText, convertSingleAffiliateUrl } from '@/lib/links/affiliate-engine';
import type { AffiliateNetworkPreset, SavedAffiliateLink } from '@/types/links';

interface AffiliateLinkConverterProps {
  initialUrl?: string;
}

const NETWORK_OPTIONS: { value: AffiliateNetworkPreset; label: string; hint: string }[] = [
  { value: 'auto', label: 'Auto-Detect Network', hint: 'Amazon, ClickBank, Impact, ShareASale, CJ, Custom' },
  { value: 'amazon', label: 'Amazon Associates', hint: 'Injects ?tag=...' },
  { value: 'impact', label: 'Impact / PartnerStack', hint: 'Injects ?irgwc=...' },
  { value: 'clickbank', label: 'ClickBank', hint: 'Injects ?hop=...' },
  { value: 'shareasale', label: 'ShareASale', hint: 'Injects ?afftrack=...' },
  { value: 'cj', label: 'CJ Affiliate', hint: 'Injects ?cjevent=...' },
  { value: 'custom', label: 'Custom Query Param', hint: 'Uses custom key (e.g. ref, via, aff_id)' },
];

export function AffiliateLinkConverter({ initialUrl = '' }: AffiliateLinkConverterProps) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid || 'default_user';

  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [rawUrl, setRawUrl] = useState(
    initialUrl || 'https://www.amazon.com/dp/B09XS7JWHH?utm_source=old'
  );
  const [rawText, setRawText] = useState(
    'Check out this creator mic https://www.amazon.com/dp/B09XS7JWHH and host your app at https://vercel.com/pricing?ref=oldtag for fast AI deployments.'
  );
  const [label, setLabel] = useState('');
  const [network, setNetwork] = useState<AffiliateNetworkPreset>('auto');
  const [affiliateTag, setAffiliateTag] = useState('nisarai-20');
  const [customParamKey, setCustomParamKey] = useState('ref');
  const [utmSource, setUtmSource] = useState('nisar_studio');
  const [utmMedium, setUtmMedium] = useState('affiliate');
  const [utmCampaign, setUtmCampaign] = useState('creator_2026');
  const [stripExistingTags, setStripExistingTags] = useState(true);
  const [includeAiCopy, setIncludeAiCopy] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [aiResult, setAiResult] = useState<{ aiHook?: string; aiDisclosure?: string } | null>(null);
  const [vaultLinks, setVaultLinks] = useState<SavedAffiliateLink[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialUrl) {
      setRawUrl(initialUrl);
      setMode('single');
    }
  }, [initialUrl]);

  useEffect(() => {
    if (authLoading) return;
    void fetchVault();
  }, [userId, authLoading]);

  const fetchVault = async () => {
    try {
      const res = await fetch(`/api/affiliate/convert?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.links)) {
        setVaultLinks(data.links);
      }
    } catch (e) {
      console.warn('Failed to fetch affiliate vault:', e);
    }
  };

  // Real-time zero-latency conversion preview as user types
  const liveOptions = useMemo(
    () => ({
      network,
      affiliateTag,
      customParamKey,
      utmSource,
      utmMedium,
      utmCampaign,
      stripExistingTags,
    }),
    [network, affiliateTag, customParamKey, utmSource, utmMedium, utmCampaign, stripExistingTags]
  );

  const liveSingle = useMemo(
    () => convertSingleAffiliateUrl(rawUrl, liveOptions),
    [rawUrl, liveOptions]
  );

  const liveBulk = useMemo(
    () => convertLinksInText(rawText, liveOptions),
    [rawText, liveOptions]
  );

  const handleSaveAndGenerate = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/affiliate/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(mode === 'single' ? { rawUrl } : { rawText }),
          ...liveOptions,
          includeAiCopy,
          saveToVault: true,
          label: label.trim(),
          userId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save affiliate conversion.');
      }

      if (data.aiHook || data.aiDisclosure) {
        setAiResult({ aiHook: data.aiHook, aiDisclosure: data.aiDisclosure });
      }
      void fetchVault();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Conversion save error.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVaultLink = async (id: string) => {
    try {
      const res = await fetch(`/api/affiliate/convert?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setVaultLinks((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      console.warn('Failed to delete saved affiliate link:', e);
    }
  };

  const handleCopy = (id: string, text: string) => {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-950 dark:text-slate-100">
      {/* Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-100 dark:from-emerald-950/60 via-teal-50 dark:via-slate-900 to-white dark:to-slate-900 border border-emerald-500/30 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-Time Monetization Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Real-Time Affiliate Link Converter
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Instantly detect networks, strip competitor tags, inject your affiliate ID + UTM tracking, and generate SEO-compliant{' '}
              <code className="font-mono text-emerald-800 dark:text-emerald-300">rel=&quot;sponsored nofollow&quot;</code> snippets or bulk-convert full articles.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'single'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Single URL
            </button>
            <button
              type="button"
              onClick={() => setMode('bulk')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'bulk'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Bulk Article Replacer
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Settings & Input */}
        <div className="lg:col-span-6 p-5 sm:p-6 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-lg space-y-4">
          {mode === 'single' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1.5">
                Destination Product URL
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={rawUrl}
                  onChange={(e) => setRawUrl(e.target.value)}
                  placeholder="https://www.amazon.com/dp/..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1.5">
                Blog Post / Social Caption (Auto-detects all URLs)
              </label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste any content containing multiple https:// links..."
                className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
                Affiliate Network
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as AffiliateNetworkPreset)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                {NETWORK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
                Your Affiliate Tag / Partner ID
              </label>
              <input
                type="text"
                value={affiliateTag}
                onChange={(e) => setAffiliateTag(e.target.value)}
                placeholder="nisarai-20"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
                Custom Param Key (when Custom)
              </label>
              <input
                type="text"
                value={customParamKey}
                onChange={(e) => setCustomParamKey(e.target.value)}
                placeholder="ref"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
                Vault Label (Optional)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Studio Mic Deal"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* UTM Builder */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              UTM Tracking Parameters
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="utm_source"
                className="px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-950 dark:text-white"
              />
              <input
                type="text"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="utm_medium"
                className="px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-950 dark:text-white"
              />
              <input
                type="text"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="utm_campaign"
                className="px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={stripExistingTags}
                onChange={(e) => setStripExistingTags(e.target.checked)}
                className="w-4 h-4 rounded border-slate-400 text-emerald-600"
              />
              <span>Strip existing competitor affiliate &amp; tracking params before tagging</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAiCopy}
                onChange={(e) => setIncludeAiCopy(e.target.checked)}
                className="w-4 h-4 rounded border-slate-400 text-emerald-600"
              />
              <span className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                Generate Gemini AI Promo CTA &amp; FTC Disclosure (uses 1 quota credit)
              </span>
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/40 border border-rose-500/40 text-xs text-rose-900 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isSaving || (mode === 'single' ? !liveSingle.isValid : liveBulk.conversions.length === 0)}
            onClick={handleSaveAndGenerate}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Firestore Vault...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>
                  {includeAiCopy
                    ? 'Save Link to Vault & Generate AI Promo Copy'
                    : 'Save Converted Link(s) to Firestore Vault'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right: Live Real-Time Conversion Output */}
        <div className="lg:col-span-6 p-5 sm:p-6 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                Real-Time Converted Output
              </h3>
            </div>
            {mode === 'single' && liveSingle.isValid && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30">
                {liveSingle.detectedNetwork} ({liveSingle.appliedParamKey}=)
              </span>
            )}
            {mode === 'bulk' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30">
                {liveBulk.conversions.length} Links Converted Live
              </span>
            )}
          </div>

          {mode === 'single' ? (
            liveSingle.isValid ? (
              <div className="space-y-4">
                {/* Converted Clean URL */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Converted Affiliate URL
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('single_url', liveSingle.convertedUrl)}
                      className="text-xs px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'single_url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === 'single_url' ? 'Copied' : 'Copy URL'}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-900 dark:text-slate-100 break-all">
                    {liveSingle.convertedUrl}
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    Short Alias Slug: <strong className="text-slate-900 dark:text-slate-200">/go/{liveSingle.shortSlug}</strong>
                  </div>
                </div>

                {/* HTML Snippet */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                      SEO HTML (&quot;sponsored nofollow&quot;)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('html', liveSingle.htmlSnippet)}
                      className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'html' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === 'html' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-800 dark:text-cyan-200 overflow-x-auto whitespace-pre-wrap break-all">
                    {liveSingle.htmlSnippet}
                  </pre>
                </div>

                {/* Markdown Snippet */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
                      Markdown Snippet
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('md', liveSingle.markdownSnippet)}
                      className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'md' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === 'md' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-800 dark:text-indigo-200 overflow-x-auto whitespace-pre-wrap break-all">
                    {liveSingle.markdownSnippet}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-rose-700 dark:text-rose-400 border border-dashed border-rose-500/40 rounded-xl">
                {liveSingle.error || 'Enter a valid HTTP/HTTPS product URL on the left.'}
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Rewritten Text with Affiliate Links
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('bulk_text', liveBulk.convertedText)}
                    className="text-xs px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'bulk_text' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'bulk_text' ? 'Copied' : 'Copy All Text'}
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words max-h-56 overflow-y-auto leading-relaxed">
                  {liveBulk.convertedText}
                </pre>
              </div>

              {liveBulk.conversions.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <div className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-400">
                    Detected &amp; Converted URLs ({liveBulk.conversions.length})
                  </div>
                  {liveBulk.conversions.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-[11px] font-mono flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-emerald-800 dark:text-emerald-300 font-bold truncate">
                          [{item.detectedNetwork}] {item.convertedUrl}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.convertedUrl)}
                        className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 shrink-0 cursor-pointer"
                      >
                        {copiedId === item.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Optional AI Hook & Disclosure */}
          {aiResult && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/40 space-y-2 text-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Promotional CTA &amp; FTC Disclosure
              </div>
              {aiResult.aiHook && (
                <p className="text-slate-900 dark:text-slate-100 font-medium">{aiResult.aiHook}</p>
              )}
              {aiResult.aiDisclosure && (
                <p className="text-[11px] text-slate-700 dark:text-slate-400 italic">
                  Disclosure: {aiResult.aiDisclosure}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Saved Affiliate Links Vault (Firestore) */}
      <div className="p-5 bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
            <Database className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Saved Affiliate Links Vault ({vaultLinks.length})</span>
          </div>
          <button
            type="button"
            onClick={() => void fetchVault()}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {vaultLinks.length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-slate-400 py-4 text-center">
            No saved affiliate links yet. Click &quot;Save Converted Link(s) to Firestore Vault&quot; above to store one.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vaultLinks.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-950 dark:text-white truncate">
                      {item.label || item.domain}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300">
                      {item.detectedNetwork}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">
                    {item.convertedUrl}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    /go/{item.shortSlug} • {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(`vault_${item.id}`, item.convertedUrl)}
                    className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 cursor-pointer"
                    title="Copy Converted URL"
                  >
                    {copiedId === `vault_${item.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={item.convertedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200"
                    title="Open URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleDeleteVaultLink(item.id)}
                    className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
