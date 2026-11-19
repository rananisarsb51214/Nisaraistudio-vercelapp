'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Check,
  Copy,
  Database,
  ExternalLink,
  GitBranch,
  Globe,
  MapPin,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, FIREBASE_META } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import {
  getAnalyticsCounts,
  subscribeAnalytics,
  trackStudioEvent,
  type StudioAnalyticsEvent,
} from '@/lib/analytics';
import type { StudioUserProfile } from '@/lib/services/userQuotaService';
import {
  BRAND_NAME,
  FOUNDER_INFO,
  GITHUB_HUB_REPO,
  GITHUB_HUB_URL,
  GITHUB_VERCEL_REPO,
  GITHUB_VERCEL_URL,
  GOOGLE_AI_STUDIO_APP_ID,
  GOOGLE_AI_STUDIO_APP_URL,
  VERCEL_PRODUCTION_URL,
} from '@/lib/seo/site-config';

const EVENT_LABELS: { key: StudioAnalyticsEvent; label: string }[] = [
  { key: 'search_auto_collect', label: 'search_auto_collect' },
  { key: 'export_collected_data', label: 'export_collected_data' },
  { key: 'agent_evolver_run', label: 'agent_evolver_run' },
  { key: 'claude_router_run', label: 'claude_router_run' },
  { key: 'initiate_checkout', label: 'initiate_checkout' },
  { key: 'open_google_ai_studio', label: 'open_google_ai_studio' },
];

const MASTER_PROMPT_TEXT = `Build and synchronize the complete **NISAR AI STUDIO** (${VERCEL_PRODUCTION_URL}) and **Super AI Toolbox** web application connected to Google AI Studio app \`${GOOGLE_AI_STUDIO_APP_ID}\` (${GOOGLE_AI_STUDIO_APP_URL}) and GitHub repositories \`${GITHUB_HUB_REPO}\` + \`${GITHUB_VERCEL_REPO}\`.

Style everything in a sleek dark glassmorphism neon command-center UI (#050811 / #070B14 / #0B0F19 with cyan #00D9FF / #22D3EE, indigo #6366F1, and violet #8B5CF6 accents). Keep all modules unified inside ONE dashboard:
1. **Identity & Brand:** NISAR AI STUDIO ("Build Smarter. Automate Better. Create More.") + Super AI Toolbox by ${FOUNDER_INFO.name}, ${FOUNDER_INFO.location}.
2. **Firebase & Firestore Sync:** Project \`${FIREBASE_META.projectId}\`, Web App ID \`${FIREBASE_META.webAppId}\`, Analytics \`fpn=${FIREBASE_META.fpn}\`, supporting \`VITE_FIREBASE_MEASUREMENT_ID\` / \`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID\`, live \`onSnapshot\` on \`users/{userId}\` (10 free daily credits + atomic deduction) and \`collected_research_data\`.
3. **Dual Billing & Monetization:** Stripe $5 Starter (100 credits) & $15 Pro (500 credits) with idempotent \`stripe_events\` webhook handling + JazzCash & Easypaisa \`${FOUNDER_INFO.localPaymentNumber}\` (${FOUNDER_INFO.localPaymentTitle}, PKR 499 / PKR 1,499) via \`local_payments\`.
4. **Search & Auto-Collect + CSV/JSON Export + Agent Evolver:** Gemini Google Search grounding with auto-store into Firestore, one-click CSV & JSON export (including metadata: NISAR AI STUDIO, Super AI Toolbox, userId, exportedAt, totalRecords), plus Agent Evolver control supporting Gemini and Claude AI routing, and a top-right "Google AI Studio ↗" button opening ${GOOGLE_AI_STUDIO_APP_URL}.`;

export function AnalyticsCommandPanel({
  userProfile,
}: {
  userProfile: StudioUserProfile | null;
}) {
  const { user } = useAuth();
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [eventCounts, setEventCounts] = useState<Record<StudioAnalyticsEvent, number>>(() =>
    getAnalyticsCounts()
  );

  async function handleCopyMasterPrompt() {
    try {
      await navigator.clipboard.writeText(MASTER_PROMPT_TEXT);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      setCopiedPrompt(false);
    }
  }
  const [firestoreStats, setFirestoreStats] = useState({
    researchRecords: 0,
    toolboxRuns: 0,
    geminiRuns: 0,
    claudeRuns: 0,
    localPayments: 0,
    approvedPayments: 0,
    stripeEvents: 0,
  });

  useEffect(() => {
    setEventCounts(getAnalyticsCounts());
    return subscribeAnalytics(() => {
      setEventCounts(getAnalyticsCounts());
    });
  }, []);

  useEffect(() => {
    if (!db || !user?.uid) return;

    const unsubResearch = onSnapshot(
      query(collection(db, 'collected_research_data'), where('userId', '==', user.uid)),
      (snap) => {
        setFirestoreStats((prev) => ({ ...prev, researchRecords: snap.size }));
      },
      () => {}
    );

    const unsubRuns = onSnapshot(
      query(collection(db, 'super_ai_toolbox_runs'), where('userId', '==', user.uid)),
      (snap) => {
        let geminiRuns = 0;
        let claudeRuns = 0;
        snap.forEach((d) => {
          if (d.data()?.providerUsed === 'claude') claudeRuns += 1;
          else geminiRuns += 1;
        });
        setFirestoreStats((prev) => ({
          ...prev,
          toolboxRuns: snap.size,
          geminiRuns,
          claudeRuns,
        }));
      },
      () => {}
    );

    const unsubLocal = onSnapshot(
      query(collection(db, 'local_payments'), where('userId', '==', user.uid)),
      (snap) => {
        let approvedPayments = 0;
        snap.forEach((d) => {
          if (d.data()?.status === 'APPROVED') approvedPayments += 1;
        });
        setFirestoreStats((prev) => ({
          ...prev,
          localPayments: snap.size,
          approvedPayments,
        }));
      },
      () => {}
    );

    const unsubStripe = onSnapshot(
      query(collection(db, 'stripe_events'), where('userId', '==', user.uid)),
      (snap) => {
        setFirestoreStats((prev) => ({ ...prev, stripeEvents: snap.size }));
      },
      () => {}
    );

    return () => {
      unsubResearch();
      unsubRuns();
      unsubLocal();
      unsubStripe();
    };
  }, [user?.uid]);

  return (
    <div className="space-y-6">
      {/* Live Firestore & Analytics Summary Strip */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#00D9FF]/25 bg-white dark:bg-[#0B0F19]/90 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 dark:text-[#00D9FF]">
              <BarChart3 className="w-4 h-4" />
              <span>Real-Time Data Analytics &amp; Sync Hub</span>
            </div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              {BRAND_NAME} Live Telemetry
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Project: {FIREBASE_META.projectId}</span>
            <span aria-hidden="true">·</span>
            <span>FPN: {FIREBASE_META.fpn}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811]">
            <div className="text-xs text-slate-500 dark:text-slate-400">Live User Credits</div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-indigo-700 dark:text-[#00D9FF] mt-1">
              {userProfile?.credits ?? 10}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              Plan: {userProfile?.plan || 'FREE'}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811]">
            <div className="text-xs text-slate-500 dark:text-slate-400">Collected Research</div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-950 dark:text-white mt-1">
              {firestoreStats.researchRecords}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              collected_research_data
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811]">
            <div className="text-xs text-slate-500 dark:text-slate-400">Agent Evolver Runs</div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-950 dark:text-white mt-1">
              {firestoreStats.toolboxRuns}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              Gemini {firestoreStats.geminiRuns} · Claude {firestoreStats.claudeRuns}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811]">
            <div className="text-xs text-slate-500 dark:text-slate-400">Billing Ledger</div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
              {firestoreStats.localPayments + firestoreStats.stripeEvents}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              Local {firestoreStats.localPayments} · Stripe {firestoreStats.stripeEvents}
            </div>
          </div>
        </div>

        {/* Tracked Analytics Events Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tracked Firebase &amp; Studio Analytics Events
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {EVENT_LABELS.map((ev) => (
              <div
                key={ev.key}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811]"
              >
                <div className="text-[11px] font-mono text-slate-500 truncate" title={ev.label}>
                  {ev.label}
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-950 dark:text-[#22D3EE] mt-1">
                  {eventCounts[ev.key] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner Identity, Firebase IDs & GitHub Auto-Sync Metadata */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19]/90 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
            <UserCheck className="w-4 h-4 text-[#00D9FF]" />
            <span>Studio Identity &amp; Firebase Project</span>
          </div>
          <dl className="space-y-2.5 text-xs">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800/70 pb-2">
              <dt className="text-slate-500">Founder / Owner</dt>
              <dd className="font-semibold text-slate-900 dark:text-white text-right">
                {FOUNDER_INFO.name}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800/70 pb-2">
              <dt className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Location</span>
              </dt>
              <dd className="text-slate-800 dark:text-slate-200 text-right">
                {FOUNDER_INFO.location}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800/70 pb-2">
              <dt className="text-slate-500 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                <span>Firebase Project ID</span>
              </dt>
              <dd className="font-mono text-indigo-700 dark:text-[#00D9FF]">
                {FIREBASE_META.projectId}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800/70 pb-2">
              <dt className="text-slate-500">Firebase Web App ID</dt>
              <dd className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                {FIREBASE_META.webAppId}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-slate-500">Analytics Project Number (FPN)</dt>
              <dd className="font-mono text-slate-800 dark:text-slate-200">
                {FIREBASE_META.fpn}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19]/90 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
            <GitBranch className="w-4 h-4 text-[#8B5CF6]" />
            <span>Production Deployment &amp; GitHub Auto-Sync</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            GitHub Actions workflow (`.github/workflows/sync-to-vercel-repo.yml`) automatically pushes updates from the Agent Skills Hub repository to the Vercel deployment repository using `VERCEL_REPO_PAT`.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <a
              href={GOOGLE_AI_STUDIO_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackStudioEvent('open_google_ai_studio', { source: 'analytics_panel' })
              }
              className="p-3 rounded-xl border border-[#00D9FF]/35 bg-slate-50 dark:bg-[#050811] hover:border-[#00D9FF] flex items-center justify-between gap-2 transition"
            >
              <span className="font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#00D9FF] shrink-0" />
                <span className="truncate">AI Studio ({GOOGLE_AI_STUDIO_APP_ID.slice(0, 8)})</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#00D9FF] shrink-0" />
            </a>

            <a
              href={VERCEL_PRODUCTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-[#6366F1] flex items-center justify-between gap-2 transition"
            >
              <span className="font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                <span className="truncate">Live Vercel App</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
            </a>

            <a
              href={GITHUB_HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-[#8B5CF6] flex items-center justify-between gap-2 transition"
            >
              <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                {GITHUB_HUB_REPO}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
            </a>

            <a
              href={GITHUB_VERCEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-emerald-500 flex items-center justify-between gap-2 transition"
            >
              <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                {GITHUB_VERCEL_REPO}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </a>
          </div>
        </div>
      </section>

      {/* One-Click Copy-Paste Google AI Studio Master Prompt Sync */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#6366F1]/30 bg-white dark:bg-[#0B0F19]/90 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-semibold text-indigo-700 dark:text-[#00D9FF]">
              One-Click Prompt Sync
            </span>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-0.5">
              Copy-Paste Google AI Studio Master Prompt
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyMasterPrompt}
              className="min-h-[40px] rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#6366F1] px-4 py-2 text-xs font-bold text-slate-950 inline-flex items-center gap-1.5 cursor-pointer transition"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'Copied' : 'Copy Master Prompt'}</span>
            </button>
            <a
              href={GOOGLE_AI_STUDIO_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackStudioEvent('open_google_ai_studio', { source: 'master_prompt_card' })
              }
              className="min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] px-4 py-2 text-xs font-semibold text-slate-800 dark:text-[#22D3EE] hover:border-[#00D9FF] inline-flex items-center gap-1.5 transition"
            >
              <span>Paste in AI Studio ↗</span>
            </a>
          </div>
        </div>

        <pre className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] p-4 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-mono custom-scrollbar">
          {MASTER_PROMPT_TEXT}
        </pre>
      </section>
    </div>
  );
}
