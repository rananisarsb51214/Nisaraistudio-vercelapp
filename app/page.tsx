'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../components/auth-provider';
import { Login } from '../components/login';
import { Dashboard } from '../components/dashboard';
import { LeadForm } from '../components/lead-form';
import { ThemeSwitcher } from '../components/theme-switcher';
import { Shield, Cpu, RefreshCw, LayoutDashboard } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-950 dark:bg-[#080b0e] dark:text-slate-100 transition-colors">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-700 dark:text-emerald-400 mb-4" />
        <p className="font-mono text-xs text-slate-700 dark:text-slate-400">Synchronizing user session...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#080b0e] dark:text-slate-100 selection:bg-emerald-500/30 transition-colors">
        <Dashboard />
      </div>
    );
  }

  if (showDashboardPreview) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#080b0e] dark:text-slate-100 selection:bg-emerald-500/30 transition-colors">
        <Dashboard previewMode onExitPreview={() => setShowDashboardPreview(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#080b0e] dark:text-slate-100 selection:bg-emerald-500/30 transition-colors">
      <div className="relative flex flex-col items-center justify-start min-h-screen px-4 sm:px-6 py-10 md:py-12 gap-8 overflow-x-hidden">
        <div className="w-full max-w-4xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm tracking-tight shrink-0">
              N
            </span>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-950 dark:text-white whitespace-nowrap">
              NISAR AI STUDIO
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDashboardPreview(true)}
              className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Preview</span>
            </button>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Top Priority Lead Form */}
        <div className="w-full max-w-4xl">
          <LeadForm source="landing" />
        </div>

        {/* Core Login Container */}
        <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl text-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              AI Workspace · Super AI Toolbox &amp; Admin Panel
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              NISAR AI Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Sign in with Google for live workspace &amp; Firestore sync, ya Dashboard Preview khol kar pura layout dekhein.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-[#090d11] border border-slate-200 dark:border-emerald-950/60 rounded-xl flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>Gemini AI Core</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#090d11] border border-slate-200 dark:border-emerald-950/60 rounded-xl flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>Secure Auth</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <Login />
            <Link
              href="/preview"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#090d11] hover:border-emerald-500/50 text-slate-900 dark:text-emerald-300 border border-slate-200 dark:border-emerald-950/70 font-semibold py-2.5 px-4 rounded-xl transition text-xs sm:text-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Open Full Dashboard Preview</span>
            </Link>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} NISAR AI STUDIO. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
