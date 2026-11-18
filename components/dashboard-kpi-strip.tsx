'use client';

import React from 'react';
import { ArrowUpRight, Coins, Flame, Sparkles, Users } from 'lucide-react';

interface DashboardKpiStripProps {
  remainingFree: number;
  dailyLimit: number;
  dailyUsed: number;
  paidCredits: number;
  totalEarned: number;
  totalSpent: number;
  totalLeads: number;
  hotLeads: number;
  coldLeads: number;
  loadingCredits?: boolean;
  loadingLeads?: boolean;
  onOpenAdminLeads: () => void;
  onOpenAdminCredits: () => void;
}

export function DashboardKpiStrip({
  remainingFree,
  dailyLimit,
  dailyUsed,
  paidCredits,
  totalEarned,
  totalSpent,
  totalLeads,
  hotLeads,
  coldLeads,
  loadingCredits = false,
  loadingLeads = false,
  onOpenAdminLeads,
  onOpenAdminCredits,
}: DashboardKpiStripProps) {
  const freePct = dailyLimit > 0 ? Math.min(100, Math.round((remainingFree / dailyLimit) * 100)) : 0;

  return (
    <section
      aria-label="Workspace Summary Metrics"
      className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
    >
      {/* Card 1: Free Credits */}
      <div className="bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Free Credits (Daily Quota)
            </p>
            <div className="flex items-baseline gap-2">
              {loadingCredits ? (
                <div className="h-9 w-24 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ) : (
                <>
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums">
                    {remainingFree}
                  </span>
                  <span className="text-sm font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    / {dailyLimit}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#161f26] overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
              style={{ width: `${freePct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums">
            <span>{dailyUsed} used today</span>
            <span>Resets daily UTC</span>
          </div>
        </div>
      </div>

      {/* Card 2: Paid Credits */}
      <div className="bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Paid Credits Balance
            </p>
            {loadingCredits ? (
              <div className="h-9 w-24 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ) : (
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                {paidCredits.toLocaleString()}
              </div>
            )}
          </div>

          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-emerald-950/50 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-mono tabular-nums truncate">
            {totalEarned.toLocaleString()} earned · {totalSpent.toLocaleString()} spent
          </span>
          <button
            type="button"
            onClick={onOpenAdminCredits}
            className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-semibold whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer"
          >
            <span>Manage</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card 3: Total Leads */}
      <div className="bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Total Leads Captured
            </p>
            {loadingLeads ? (
              <div className="h-9 w-20 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ) : (
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white font-mono tabular-nums">
                {totalLeads.toLocaleString()}
              </div>
            )}
          </div>

          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-emerald-950/50 text-xs">
          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 font-mono tabular-nums truncate">
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
              <Flame className="w-3.5 h-3.5" />
              {hotLeads} HOT
            </span>
            <span aria-hidden="true">·</span>
            <span>{coldLeads} COLD</span>
          </span>
          <button
            type="button"
            onClick={onOpenAdminLeads}
            className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-semibold whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer"
          >
            <span>Open Leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
