'use client';

import React, { useState } from 'react';
import { 
  Link as LinkIcon, Sparkles, Globe, Copy, Check, FileText, 
  Code, ArrowRight, Search, Loader2, ExternalLink, ShieldCheck, Cpu 
} from 'lucide-react';
import { useAuth } from '../auth-provider';

export function AiLinkConverter() {
  const { user } = useAuth();
  const userId = user?.uid || 'default_user';

  const [inputUrl, setInputUrl] = useState('');
  const [conversionMode, setConversionMode] = useState<'marketing' | 'seo' | 'blueprint' | 'code'>('marketing');
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvertLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'social-post', // Using existing powerful tool registration or generic generation
          userId,
          parameters: {
            topic: `Analyze and convert URL/Link asset: ${inputUrl.trim()} with mode: ${conversionMode}. Provide comprehensive insights, marketing copy, SEO summary, and actionable structure.`,
            tone: 'professional',
            useSearch: useSearchGrounding
          },
          model: 'gemini-3.5-flash',
          tone: 'professional',
          language: 'English'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze and convert link.');
      }

      setResult(data.output);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while processing link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    const textToCopy = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="p-8 bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Link & Asset Conversion Engine</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            AI Add Link & URL Converter
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Paste any link, URL, or asset reference (including blob links and media URLs) to instantly analyze, ground with Google Search, and convert into high-converting campaigns, code blueprints, or SEO content.
          </p>
        </div>
      </div>

      {/* Main Form Input */}
      <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl space-y-6">
        <form onSubmit={handleConvertLink} className="space-y-5">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2 flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-emerald-400" />
              <span>Target Link / URL / Blob Reference</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="https://... or blob:https://..."
                className="w-full bg-[#12141c] border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-mono flex items-center space-x-1">
                <Globe className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            {inputUrl.includes('blob:') && (
              <p className="text-[11px] text-amber-400 font-mono mt-1.5 flex items-center space-x-1">
                <span>⚠️ Detected local blob reference. AI will analyze structure and generate matching synthetic assets.</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                Conversion Mode
              </label>
              <select
                className="w-full bg-[#12141c] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                value={conversionMode}
                onChange={(e: any) => setConversionMode(e.target.value)}
              >
                <option value="marketing">🚀 Marketing & Ad Copy Suite</option>
                <option value="seo">🔍 SEO Summary & Keyword Analysis</option>
                <option value="blueprint">📐 Full-Stack Website Blueprint</option>
                <option value="code">💻 Clean Code & Snippet Conversion</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-3 p-3 bg-[#12141c] border border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500/50 transition">
                <input
                  type="checkbox"
                  checked={useSearchGrounding}
                  onChange={(e) => setUseSearchGrounding(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-900"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">Enable Google Search Grounding</span>
                  <span className="text-slate-400 text-[10px]">Fetch real-time web context using Gemini 3.5 Flash</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputUrl.trim()}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Analyzing & Converting Link with Google Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Execute AI Link Conversion</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output Results */}
      {result && (
        <div className="p-6 bg-slate-950/80 border border-emerald-500/40 rounded-2xl shadow-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Conversion Output Result</h3>
                <p className="text-xs text-slate-400">Successfully generated by Google Gemini 3.5 Flash</p>
              </div>
            </div>
            <button
              onClick={handleCopyResult}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl border border-emerald-500/30 text-xs font-mono font-bold transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Result'}</span>
            </button>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/50 text-rose-300 rounded-xl text-xs font-mono">
          <span>Error: {errorMessage}</span>
        </div>
      )}
    </div>
  );
}
