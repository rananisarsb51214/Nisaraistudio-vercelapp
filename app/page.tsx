'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '../components/auth-provider';
import { Login } from '../components/login';
import { Dashboard } from '../components/dashboard';
import { LeadForm } from '../components/lead-form';
import { ThemeSwitcher } from '../components/theme-switcher';
import { Sparkles, Shield, Cpu, RefreshCw } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-950 dark:bg-[#0b0c10] dark:text-slate-100 transition-colors">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-700 dark:text-emerald-400 mb-4" />
        <p className="font-mono text-xs text-slate-700 dark:text-slate-400">Synchronizing secure user state...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#0b0c10] dark:text-slate-100 selection:bg-emerald-500/30 transition-colors">
      {user ? (
        <Dashboard />
      ) : (
        <div className="relative flex flex-col items-center justify-start min-h-screen px-4 py-10 md:py-12 gap-6 overflow-x-hidden">
          <div className="absolute top-5 right-5 z-20">
            <ThemeSwitcher />
          </div>

          {/* Decorative Background Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Top Priority Lead Form */}
          <div className="relative z-10 w-full max-w-4xl pt-6 sm:pt-2">
            <LeadForm source="landing" />
          </div>

          {/* Core Login Container */}
          <div className="relative z-10 w-full max-w-md p-8 bg-white dark:bg-[#12141c]/80 border border-slate-900/20 dark:border-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl dark:shadow-2xl text-center space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mx-auto">
                <Sparkles className="w-3 h-3" />
                <span>Next-Gen AI Workspace</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 pt-2">
                NISAR AI Studio Super AI Toolbox
              </h1>
              <p className="text-xs text-slate-700 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                One Platform. Every AI Tool. Unlimited Possibilities.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 gap-2.5 text-left py-2 font-mono text-[10px] text-slate-800 dark:text-slate-400">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-800 rounded-lg flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Gemini 3.5 Core</span>
              </div>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-800 rounded-lg flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Secure Auth</span>
              </div>
            </div>

            <div className="pt-2">
              <Login />
            </div>

            <p className="text-[10px] text-slate-600 dark:text-slate-500 font-mono">
              Secure gRPC synchronization &copy; {new Date().getFullYear()} NISAR AI SaaS. All rights reserved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
