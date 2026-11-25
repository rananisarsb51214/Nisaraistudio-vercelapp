import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, CreditCard, Smartphone } from 'lucide-react';
import { ToolPageNav } from '@/components/tools/ToolPageNav';
import { BILLING_PLANS, BRAND_NAME, FOUNDER_INFO, SITE_URL } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Pricing — Free Daily Credits, JazzCash / Easypaisa & Stripe Plans',
  description:
    'Start with 10 free daily AI credits or upgrade via JazzCash/Easypaisa (PKR 499 / PKR 1,499) or Stripe ($5 / $15) inside NISAR AI STUDIO.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: `Pricing | ${BRAND_NAME}`,
    url: `${SITE_URL}/pricing`,
  },
};

const PLANS = [
  {
    name: BILLING_PLANS.free.name,
    audience: 'For solo creators & testing',
    priceUsd: '$0',
    pricePkr: 'PKR 0',
    cadence: 'forever · 10 free AI credits/day (atomic auto-reset)',
    features: [
      '10 daily free AI credits in Firestore (users/{userId})',
      'Search & Auto-Collect with CSV & JSON Export',
      'Agent Evolver Control (Gemini + Claude AI router)',
      'Memory-Saved Gemini Chatbot & 10 SEO tools',
    ],
    ctaLabel: 'Start Free in Studio',
    ctaHref: '/preview',
    highlight: false,
  },
  {
    name: BILLING_PLANS.starter.name,
    audience: 'For freelancers & growth builders',
    priceUsd: `$${BILLING_PLANS.starter.priceUsd}`,
    pricePkr: `PKR ${BILLING_PLANS.starter.pricePkr.toLocaleString()}`,
    cadence: 'one-time pack · 100 priority AI credits',
    features: [
      '100 rollover priority credits added atomically',
      'JazzCash / Easypaisa TID verification (0323-5052148)',
      'International Stripe checkout with idempotent webhooks',
      'Full Backlink Auto-Detect & Affiliate Link Vault',
    ],
    ctaLabel: 'Upgrade to Starter',
    ctaHref: '/preview',
    highlight: false,
  },
  {
    name: BILLING_PLANS.pro.name,
    audience: 'For agencies & automation teams',
    priceUsd: `$${BILLING_PLANS.pro.priceUsd}`,
    pricePkr: `PKR ${BILLING_PLANS.pro.pricePkr.toLocaleString()}`,
    cadence: 'power pack · 500 priority AI credits',
    features: [
      '500 rollover priority credits across all AI modules',
      '10,000-character Agent Evolver & Multi-Model routing',
      'Priority JazzCash / Easypaisa or Stripe verification',
      'Live Data Analytics & GitHub-to-Vercel Sync Hub',
    ],
    ctaLabel: 'Upgrade to Pro Studio',
    ctaHref: '/preview',
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] black:bg-black text-slate-950 dark:text-slate-100 black:text-neutral-100 transition-colors duration-150">
      <ToolPageNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono font-semibold text-indigo-700 dark:text-[#00D9FF]">
            {BRAND_NAME} · Super AI Toolbox Billing
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Dual Local (PKR) &amp; Global (USD) Pricing
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Start with 10 free daily credits. Upgrade seamlessly via JazzCash &amp; Easypaisa in Pakistan or Stripe worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-7 flex flex-col justify-between gap-6 ${
                plan.highlight
                  ? 'border-[#00D9FF]/50 bg-white dark:bg-[#0B0F19]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19]/90'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-mono text-indigo-700 dark:text-[#00D9FF] font-semibold">
                    {plan.audience}
                  </p>
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white mt-1">
                    {plan.name}
                  </h2>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-950 dark:text-white">
                      {plan.pricePkr}
                    </span>
                    <span className="text-sm font-mono font-bold text-indigo-700 dark:text-[#22D3EE]">
                      / {plan.priceUsd} USD
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{plan.cadence}</p>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#00D9FF] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.ctaHref}
                className="min-h-[44px] w-full rounded-xl bg-gradient-to-r from-[#00D9FF] via-[#6366F1] to-[#8B5CF6] text-slate-950 font-bold text-sm flex items-center justify-center"
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/30 bg-white dark:bg-[#0B0F19] p-6 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>JazzCash &amp; Easypaisa (Pakistan)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Account Number: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{FOUNDER_INFO.localPaymentNumber}</strong> ({FOUNDER_INFO.localPaymentTitle}). Submit your Transaction ID (TID) inside the Studio Billing Hub for rapid verification.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-[#6366F1]/30 bg-white dark:bg-[#0B0F19] p-6 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
              <CreditCard className="w-4 h-4 text-[#00D9FF]" />
              <span>International Stripe Checkout</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Pay securely in USD ($5 Starter / $15 Pro) with automated idempotent webhook fulfillment and real-time Firestore credit updates.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
