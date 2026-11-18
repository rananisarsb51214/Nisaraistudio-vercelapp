'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Coins,
  Flame,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sliders,
  Snowflake,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import { LeadsList } from '@/components/leads-list';
import { AI_TOOLS_CATALOG } from '@/lib/ai/tools-catalog';
import { isStudioAdmin, saveDisabledTools, STUDIO_ADMIN_EMAIL } from '@/lib/services/toolSettingsService';
import { UserCredits, normalizeUserCredits } from '@/types/credits';

type AdminSubTab = 'leads' | 'credits' | 'tools';

interface AdminPanelProps {
  initialSubTab?: AdminSubTab;
  disabledTools: string[];
  totalLeadsCount: number;
  hotLeadsCount: number;
  coldLeadsCount: number;
  currentUserCredits: UserCredits | null;
  onCreditsUpdated?: (updated: UserCredits) => void;
}

export function AdminPanel({
  initialSubTab = 'leads',
  disabledTools,
  totalLeadsCount,
  hotLeadsCount,
  coldLeadsCount,
  currentUserCredits,
  onCreditsUpdated,
}: AdminPanelProps) {
  const { user } = useAuth();
  const isAdmin = isStudioAdmin(user);

  const [subTab, setSubTab] = useState<AdminSubTab>(initialSubTab);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  // Leads Filter & Search State
  const [leadFilter, setLeadFilter] = useState<'all' | 'HOT' | 'COLD'>('all');
  const [leadSearch, setLeadSearch] = useState('');

  // Credits Control State
  const [allUserCredits, setAllUserCredits] = useState<UserCredits[]>([]);
  const [selectedCreditUserId, setSelectedCreditUserId] = useState<string>(user?.uid || 'default_user');
  const [customPaidInput, setCustomPaidInput] = useState<string>('');
  const [customDailyLimitInput, setCustomDailyLimitInput] = useState<string>('10');
  const [creditsBusy, setCreditsBusy] = useState(false);
  const [creditsFeedback, setCreditsFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tools On/Off State
  const [toolSearch, setToolSearch] = useState('');
  const [savingTools, setSavingTools] = useState(false);
  const [toolsFeedback, setToolsFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.uid) {
      setSelectedCreditUserId((prev) => (prev === 'default_user' || !prev ? user.uid : prev));
    }
  }, [user?.uid]);

  // Real-time list of user_credits documents for Credits Control
  useEffect(() => {
    if (!db || !user) return;
    const unsubscribe = onSnapshot(
      collection(db, 'user_credits'),
      (snap) => {
        const list: UserCredits[] = snap.docs.map((d) =>
          normalizeUserCredits(d.id, d.data() as Partial<UserCredits>)
        );
        if (user.uid && !list.some((c) => c.userId === user.uid)) {
          list.unshift(currentUserCredits || normalizeUserCredits(user.uid, null));
        }
        setAllUserCredits(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.GET, 'user_credits');
        } catch {
          // Fallback handled safely
        }
      }
    );
    return () => unsubscribe();
  }, [user, currentUserCredits]);

  const activeCreditProfile =
    allUserCredits.find((c) => c.userId === selectedCreditUserId) ||
    (selectedCreditUserId === user?.uid ? currentUserCredits : null) ||
    normalizeUserCredits(selectedCreditUserId, null);

  useEffect(() => {
    setCustomDailyLimitInput(String(activeCreditProfile.dailyLimit));
  }, [activeCreditProfile.userId, activeCreditProfile.dailyLimit]);

  const remainingFreeForSelected = Math.max(
    0,
    activeCreditProfile.dailyLimit - activeCreditProfile.dailyUsed
  );

  const applyCreditsUpdate = async (payload: Record<string, unknown>, successMsg: string) => {
    setCreditsBusy(true);
    setCreditsFeedback(null);
    try {
      const res = await fetch('/api/ai/credits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedCreditUserId,
          ...payload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update credits');
      }
      if (data.credits && selectedCreditUserId === user?.uid && onCreditsUpdated) {
        onCreditsUpdated(data.credits);
      }
      setCreditsFeedback({ type: 'success', text: successMsg });
      setCustomPaidInput('');
    } catch (err: unknown) {
      setCreditsFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Credits update failed.',
      });
    } finally {
      setCreditsBusy(false);
    }
  };

  const handleToggleTool = async (toolId: string) => {
    if (!isAdmin || !user?.email) {
      setToolsFeedback({
        type: 'error',
        text: `Tools control sirf verified admin (${STUDIO_ADMIN_EMAIL}) ke liye allowed hai.`,
      });
      return;
    }

    const isCurrentlyDisabled = disabledTools.includes(toolId);
    const nextDisabled = isCurrentlyDisabled
      ? disabledTools.filter((id) => id !== toolId)
      : [...disabledTools, toolId];

    setSavingTools(true);
    setToolsFeedback(null);
    try {
      await saveDisabledTools(nextDisabled, user.email);
      setToolsFeedback({
        type: 'success',
        text: isCurrentlyDisabled
          ? 'Tool successfully ON kar diya gaya.'
          : 'Tool temporarily OFF kar diya gaya.',
      });
    } catch (err: unknown) {
      setToolsFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Tool setting save karne mein masla aaya.',
      });
    } finally {
      setSavingTools(false);
    }
  };

  const handleBulkToggleTools = async (disableAll: boolean) => {
    if (!isAdmin || !user?.email) {
      setToolsFeedback({
        type: 'error',
        text: `Tools control sirf verified admin (${STUDIO_ADMIN_EMAIL}) ke liye allowed hai.`,
      });
      return;
    }
    setSavingTools(true);
    setToolsFeedback(null);
    try {
      const nextDisabled = disableAll ? AI_TOOLS_CATALOG.map((t) => t.id) : [];
      await saveDisabledTools(nextDisabled, user.email);
      setToolsFeedback({
        type: 'success',
        text: disableAll ? 'Tamam tools OFF kar diye gaye.' : 'Tamam tools ON kar diye gaye.',
      });
    } catch (err: unknown) {
      setToolsFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Bulk update failed.',
      });
    } finally {
      setSavingTools(false);
    }
  };

  const enabledToolsCount = AI_TOOLS_CATALOG.length - disabledTools.length;
  const filteredTools = AI_TOOLS_CATALOG.filter((tool) => {
    const q = toolSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Admin Panel Header & Sub-Navigation */}
      <div className="bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                Admin Panel
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Manage captured leads, adjust user credits, and toggle studio tools live in Firestore.
            </p>
          </div>

          {/* Unboxed summary stats */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
            <span>{totalLeadsCount} Leads</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {enabledToolsCount}/{AI_TOOLS_CATALOG.length} Tools Active
            </span>
            <span aria-hidden="true">·</span>
            <span>{isAdmin ? 'Admin Verified' : 'Standard View'}</span>
          </div>
        </div>

        {/* Segmented Sub-Tab Controls (Mobile-friendly 44px touch height) */}
        <div
          role="tablist"
          aria-label="Admin Panel Sections"
          className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-[#090d11] border border-slate-200 dark:border-emerald-950/60"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'leads'}
            onClick={() => setSubTab('leads')}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer ${
              subTab === 'leads'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Leads List</span>
            <span className="hidden sm:inline font-mono tabular-nums opacity-85">
              ({totalLeadsCount})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'credits'}
            onClick={() => setSubTab('credits')}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer ${
              subTab === 'credits'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 shrink-0" />
            <span>Credits Control</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'tools'}
            onClick={() => setSubTab('tools')}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer ${
              subTab === 'tools'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span>Tools On/Off</span>
          </button>
        </div>
      </div>

      {/* ==================== SUB-TAB 1: LEADS LIST ==================== */}
      {subTab === 'leads' && (
        <div className="space-y-5">
          {/* Filter + Search Toolbar */}
          <div className="bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#090d11] border border-slate-200 dark:border-emerald-950/60 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setLeadFilter('all')}
                className={`flex-1 md:flex-none min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  leadFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                All ({totalLeadsCount})
              </button>
              <button
                type="button"
                onClick={() => setLeadFilter('HOT')}
                className={`flex-1 md:flex-none min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  leadFilter === 'HOT'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>HOT ({hotLeadsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setLeadFilter('COLD')}
                className={`flex-1 md:flex-none min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  leadFilter === 'COLD'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>COLD ({coldLeadsCount})</span>
              </button>
            </div>

            <div className="relative w-full md:max-w-xs">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder="Search naam, phone, city..."
                className="w-full min-h-[42px] bg-slate-50 dark:bg-[#090d11] border border-slate-300 dark:border-emerald-950/70 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-950 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <LeadsList filterLabel={leadFilter} searchQuery={leadSearch} />
        </div>
      )}

      {/* ==================== SUB-TAB 2: CREDITS CONTROL ==================== */}
      {subTab === 'credits' && (
        <div className="bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-emerald-950/50">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Credits &amp; Quota Control</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Real-time Firestore adjustments for Paid Credits, Free Daily Quota, and Account Tier.
              </p>
            </div>

            {/* Account Selector */}
            <div className="w-full sm:w-72">
              <label
                htmlFor="admin-credit-user"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
              >
                Target User Account
              </label>
              <select
                id="admin-credit-user"
                value={selectedCreditUserId}
                onChange={(e) => setSelectedCreditUserId(e.target.value)}
                className="w-full min-h-[44px] bg-slate-50 dark:bg-[#090d11] border border-slate-300 dark:border-emerald-950/70 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {allUserCredits.length === 0 ? (
                  <option value={user?.uid || 'default_user'}>
                    {user?.email || 'Current User'}
                  </option>
                ) : (
                  allUserCredits.map((c) => (
                    <option key={c.userId} value={c.userId}>
                      {c.userId === user?.uid ? `My Account (${user?.email || c.userId})` : c.userId}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {creditsFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2 ${
                creditsFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/40 text-rose-900 dark:text-rose-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{creditsFeedback.text}</span>
            </div>
          )}

          {/* Selected Account Live Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090d11] border border-slate-200 dark:border-emerald-950/60 space-y-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">Free Credits Remaining</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-950 dark:text-white">
                {remainingFreeForSelected} / {activeCreditProfile.dailyLimit}
              </div>
              <span className="text-xs text-slate-500 font-mono tabular-nums block">
                {activeCreditProfile.dailyUsed} used today
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090d11] border border-slate-200 dark:border-emerald-950/60 space-y-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">Paid Credits</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                {activeCreditProfile.paidCredits.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 font-mono tabular-nums block">
                {activeCreditProfile.totalSpent.toLocaleString()} total spent
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090d11] border border-slate-200 dark:border-emerald-950/60 space-y-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">Current Tier</span>
              <div className="text-2xl font-bold capitalize text-slate-950 dark:text-white">
                {activeCreditProfile.tier}
              </div>
              <span className="text-xs text-slate-500 font-mono truncate block">
                ID: {activeCreditProfile.userId}
              </span>
            </div>
          </div>

          {/* Paid Credits & Free Quota Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Paid Credits Adjustment */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#090d11] border border-slate-200 dark:border-emerald-950/60 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Paid Credits Control</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Add bonus paid credits or set an exact paid balance.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[10, 50, 100, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={creditsBusy}
                    onClick={() =>
                      void applyCreditsUpdate(
                        {
                          adjustPaidDelta: amt,
                          description: `Admin granted +${amt} paid credits`,
                        },
                        `+${amt} paid credits add kar diye gaye.`
                      )
                    }
                    className="min-h-[40px] px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-bold inline-flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{amt}</span>
                  </button>
                ))}
                <button
                  type="button"
                  disabled={creditsBusy}
                  onClick={() =>
                    void applyCreditsUpdate(
                      {
                        adjustPaidDelta: -10,
                        description: 'Admin deducted 10 paid credits',
                      },
                      '10 paid credits minus kar diye gaye.'
                    )
                  }
                  className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-200 dark:bg-[#141c24] hover:bg-slate-300 dark:hover:bg-[#1b2530] text-slate-900 dark:text-slate-200 text-xs font-mono font-bold transition cursor-pointer"
                >
                  -10
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  value={customPaidInput}
                  onChange={(e) => setCustomPaidInput(e.target.value)}
                  placeholder="Exact paid credits e.g. 250"
                  className="flex-1 min-h-[44px] bg-white dark:bg-[#0e1318] border border-slate-300 dark:border-emerald-950/70 rounded-xl px-3.5 py-2 text-sm font-mono tabular-nums text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  disabled={creditsBusy || customPaidInput.trim() === ''}
                  onClick={() => {
                    const num = Number(customPaidInput);
                    if (!Number.isFinite(num) || num < 0) return;
                    void applyCreditsUpdate(
                      {
                        paidCredits: num,
                        description: `Admin set paid credits to ${num}`,
                      },
                      `Paid credits ${num} par set kar diye gaye.`
                    );
                  }}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer"
                >
                  {creditsBusy ? 'Saving...' : 'Set Balance'}
                </button>
              </div>
            </div>

            {/* Free Daily Quota & Tier Control */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#090d11] border border-slate-200 dark:border-emerald-950/60 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Free Daily Quota &amp; Tier</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Change daily free request limit, reset today&apos;s counter, or switch tier.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={customDailyLimitInput}
                  onChange={(e) => setCustomDailyLimitInput(e.target.value)}
                  placeholder="Daily free limit (default 10)"
                  className="flex-1 min-h-[44px] bg-white dark:bg-[#0e1318] border border-slate-300 dark:border-emerald-950/70 rounded-xl px-3.5 py-2 text-sm font-mono tabular-nums text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  disabled={creditsBusy}
                  onClick={() => {
                    const num = Number(customDailyLimitInput);
                    if (!Number.isFinite(num) || num < 0) return;
                    void applyCreditsUpdate(
                      {
                        dailyLimit: num,
                        description: `Admin updated daily free limit to ${num}`,
                      },
                      `Daily free limit ${num} par set ho gayi.`
                    );
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer"
                >
                  Save Limit
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  disabled={creditsBusy}
                  onClick={() =>
                    void applyCreditsUpdate(
                      {
                        resetDailyUsed: true,
                        description: 'Admin reset today daily free quota usage to 0',
                      },
                      'Aaj ka free daily quota reset kar diya gaya.'
                    )
                  }
                  className="min-h-[42px] px-4 py-2 rounded-xl border border-emerald-600/40 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${creditsBusy ? 'animate-spin' : ''}`} />
                  <span>Reset Today&apos;s Free Used</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {(['free', 'starter', 'pro', 'enterprise'] as const).map((tierOption) => (
                    <button
                      key={tierOption}
                      type="button"
                      disabled={creditsBusy}
                      onClick={() =>
                        void applyCreditsUpdate(
                          {
                            tier: tierOption,
                            description: `Admin changed tier to ${tierOption}`,
                          },
                          `Plan tier "${tierOption}" set ho gaya.`
                        )
                      }
                      className={`min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                        activeCreditProfile.tier === tierOption
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/60 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40'
                      }`}
                    >
                      {tierOption}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 3: TOOLS ON / OFF ==================== */}
      {subTab === 'tools' && (
        <div className="bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-emerald-950/50">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Tools On / Off Control</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Toggle AI Studio tools ON or OFF globally. Changes sync live across sidebar and overview.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={toolSearch}
                  onChange={(e) => setToolSearch(e.target.value)}
                  placeholder="Filter tools..."
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-[#090d11] border border-slate-300 dark:border-emerald-950/70 rounded-xl pl-10 pr-3 py-2 text-sm text-slate-950 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={savingTools || !isAdmin}
                  onClick={() => void handleBulkToggleTools(false)}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold whitespace-nowrap transition cursor-pointer"
                >
                  Enable All
                </button>
                <button
                  type="button"
                  disabled={savingTools || !isAdmin}
                  onClick={() => void handleBulkToggleTools(true)}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-[#141c24] hover:bg-slate-300 dark:hover:bg-[#1c2732] disabled:opacity-50 text-slate-900 dark:text-slate-200 text-xs font-semibold whitespace-nowrap transition cursor-pointer"
                >
                  Disable All
                </button>
              </div>
            </div>
          </div>

          {!isAdmin && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/40 text-xs text-amber-900 dark:text-amber-300">
              Tools On/Off changes require verified admin sign-in ({STUDIO_ADMIN_EMAIL}).
            </div>
          )}

          {toolsFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 ${
                toolsFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/40 text-rose-900 dark:text-rose-200'
              }`}
            >
              <span>{toolsFeedback.text}</span>
              {savingTools && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.map((tool) => {
              const ToolIcon = tool.icon;
              const isEnabled = !disabledTools.includes(tool.id);

              return (
                <div
                  key={`admin_tool_${tool.id}`}
                  className={`p-4 sm:p-5 rounded-xl border transition flex items-center justify-between gap-4 ${
                    isEnabled
                      ? 'bg-slate-50 dark:bg-[#090d11] border-slate-200 dark:border-emerald-950/70'
                      : 'bg-slate-100/70 dark:bg-[#090c0f]/70 border-slate-200 dark:border-slate-800/80 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isEnabled
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <ToolIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-sm font-bold text-slate-950 dark:text-white truncate">
                        {tool.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {tool.category} · {isEnabled ? 'Active (ON)' : 'Paused (OFF)'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    aria-label={`Toggle ${tool.name}`}
                    disabled={savingTools}
                    onClick={() => void handleToggleTool(tool.id)}
                    className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                      isEnabled
                        ? 'bg-emerald-600 border-emerald-500'
                        : 'bg-slate-300 dark:bg-slate-800 border-slate-400 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-150 ${
                        isEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
