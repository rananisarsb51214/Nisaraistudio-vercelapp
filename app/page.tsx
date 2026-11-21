'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../components/auth-provider';
import { Login } from '../components/login';
import { Dashboard } from '../components/dashboard';
import { LeadForm } from '../components/lead-form';
import { ThemeSwitcher } from '../components/theme-switcher';
import { Shield, Cpu, RefreshCw, LayoutDashboard, Sparkles, Bot, ArrowRight, ExternalLink, Leaf } from 'lucide-react';
import {
  GOOGLE_AI_STUDIO_APP_URL,
  VERCEL_PRODUCTION_URL,
} from '@/lib/seo/site-config';
import { trackStudioEvent } from '@/lib/analytics';

export default function Home() {
  const { user, loading } = useAuth();
  const [showDashboardPreview, setShowDashboardPreview] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('preview') === '1') {
        setShowDashboardPreview(true);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050811] black:bg-black dark:text-slate-100 black:text-neutral-100 transition-colors">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-700 dark:text-[#00D9FF] mb-4" />
        <p className="font-mono text-xs text-slate-700 dark:text-slate-400">Synchronizing user session...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050811] black:bg-black dark:text-slate-100 black:text-neutral-100 selection:bg-[#00D9FF]/30 transition-colors">
        <Dashboard />
      </div>
    );
  }

  if (showDashboardPreview) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050811] black:bg-black dark:text-slate-100 black:text-neutral-100 selection:bg-[#00D9FF]/30 transition-colors">
        <Dashboard previewMode onExitPreview={() => setShowDashboardPreview(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050811] black:bg-black dark:text-slate-100 black:text-neutral-100 selection:bg-[#00D9FF]/30 transition-colors">
      <div className="relative flex flex-col items-center justify-start min-h-screen px-4 sm:px-6 py-8 md:py-10 gap-8 overflow-x-hidden">
        <header className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D9FF] via-[#6366F1] to-[#8B5CF6] text-slate-950 flex items-center justify-center font-black text-sm tracking-tight shrink-0">
              N
            </span>
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-950 dark:text-white whitespace-nowrap block leading-tight">
                NISAR AI STUDIO
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#00D9FF] hidden sm:block">
                Super AI Toolbox · Build Smarter. Automate Better. Create More.
              </span>
            </div>
          </div>

          <nav aria-label="Primary" className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Link
              href="/green-playbook"
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-[#0B0F19] black:bg-[#0a0a0a] hover:border-emerald-400 text-xs font-semibold text-emerald-800 dark:text-emerald-400 transition whitespace-nowrap"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Green Playbook</span>
            </Link>
            <Link
              href="/tools"
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 black:border-neutral-800 bg-white dark:bg-[#0B0F19] black:bg-[#0a0a0a] hover:border-[#00D9FF] text-xs font-semibold text-slate-800 dark:text-slate-100 transition whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
              <span>AI Tools</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowDashboardPreview(true)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-[#0B0F19] hover:border-emerald-400 text-xs font-semibold text-emerald-800 dark:text-emerald-400 transition whitespace-nowrap cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Unified Dashboard</span>
            </button>
            <a
              href={VERCEL_PRODUCTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] hover:border-[#6366F1] text-xs font-semibold text-slate-700 dark:text-slate-200 transition whitespace-nowrap"
            >
              <span>Live Vercel</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#6366F1]" />
            </a>
            <a
              href={GOOGLE_AI_STUDIO_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackStudioEvent('open_google_ai_studio', { source: 'landing_header' })}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] via-[#6366F1] to-[#8B5CF6] text-slate-950 text-xs font-bold transition whitespace-nowrap"
            >
              <span>Google AI Studio ↗</span>
            </a>
            <ThemeSwitcher />
          </nav>
        </header>

        {/* Top Priority Lead Form */}
        <div className="w-full max-w-6xl">
          <LeadForm source="landing" />
        </div>

        {/* Super AI Tool Box + Login Split */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <section className="lg:col-span-7 p-6 sm:p-8 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-indigo-500/30 rounded-2xl flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-mono font-semibold text-indigo-700 dark:text-[#00D9FF]">
                Super AI Tool Box &amp; Automation Hub
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Build Smarter. Automate Better. Create More.
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Explore 10 dedicated SEO &amp; automation tools powered by Google Gemini, real-time Backlink Auto-Detect, Affiliate Link Converter, and a persistent Save-Memory Gemini Agent Chatbot.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <Link
                href="/tools/ai-article-writer"
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 hover:border-[#00D9FF] flex items-center justify-between gap-2 transition"
              >
                <span className="font-semibold text-slate-900 dark:text-white">AI Article Writer</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00D9FF]" />
              </Link>
              <Link
                href="/tools/seo-title-metadata"
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 hover:border-[#00D9FF] flex items-center justify-between gap-2 transition"
              >
                <span className="font-semibold text-slate-900 dark:text-white">SEO Title &amp; Meta</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00D9FF]" />
              </Link>
              <Link
                href="/tools/backlink-auto-detect"
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 hover:border-[#00D9FF] flex items-center justify-between gap-2 transition"
              >
                <span className="font-semibold text-slate-900 dark:text-white">Backlink Auto-Detect</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00D9FF]" />
              </Link>
              <Link
                href="/tools/affiliate-link-converter"
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 hover:border-[#00D9FF] flex items-center justify-between gap-2 transition"
              >
                <span className="font-semibold text-slate-900 dark:text-white">Affiliate Link Converter</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00D9FF]" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/tools"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#6366F1] text-slate-950 font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition"
              >
                <span>Open All 10 Tools</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/chatbot"
                className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#8B5CF6]/40 bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition hover:border-[#8B5CF6]"
              >
                <Bot className="w-4 h-4 text-[#8B5CF6]" />
                <span>Launch Save-Memory Chatbot</span>
              </Link>
            </div>
          </section>

          {/* Core Login Container */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-emerald-950/70 rounded-2xl text-center flex flex-col justify-between space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                AI Workspace · Super AI Toolbox &amp; Admin Panel
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Workspace Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Sign in with Google for live Firestore memory, leads sync, and credits, ya Dashboard Preview khol kar pura layout dekhein.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-indigo-500/20 rounded-xl flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-700 dark:text-[#00D9FF] shrink-0" />
                <span>Gemini AI Core</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-indigo-500/20 rounded-xl flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>Secure Auth</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <Login />
              <Link
                href="/preview"
                className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#070B14] hover:border-emerald-500/50 text-slate-900 dark:text-emerald-300 border border-slate-200 dark:border-emerald-950/70 font-semibold py-2.5 px-4 rounded-xl transition text-xs sm:text-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Open Full Dashboard Preview</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-500">
              <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-[#00D9FF]">Pricing</Link>
              <Link href="/about" className="hover:text-slate-900 dark:hover:text-[#00D9FF]">About</Link>
              <Link href="/contact" className="hover:text-slate-900 dark:hover:text-[#00D9FF]">Contact</Link>
              <span>&copy; {new Date().getFullYear()} Nisar AI Studio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
