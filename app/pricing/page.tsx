import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ToolPageNav } from '@/components/tools/ToolPageNav';
import { BRAND_NAME, SITE_URL } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Pricing — Free Daily AI Credits & Pro Plans',
  description:
    'Start with 10 daily free AI credits across all Nisar AI Studio tools or upgrade your workspace credit quota.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: `Pricing | ${BRAND_NAME}`,
    url: `${SITE_URL}/pricing`,
  },
};

const PLANS = [
  {
    name: 'Starter Free',
    audience: 'For solo creators & builders',
    price: '$0',
    cadence: 'forever · 10 free AI credits/day',
    features: [
      '10 daily free AI credits (auto-reset)',
      'Access to all 10 Super AI Tool Box runners',
      'Memory-Saved Gemini Agent Chatbot',
      'Free Offer Lead Capture & Auto-Gemini',
    ],
    ctaLabel: 'Explore AI Tools',
    ctaHref: '/tools',
  },
  {
    name: 'Pro Studio',
    audience: 'For scaling agencies & teams',
    price: '$19',
    cadence: 'per month · 1,500 paid AI credits',
    features: [
      'Everything in Starter Free',
      '1,500 rollover Paid Credits via Admin Panel',
      'Backlink Auto-Detect & Affiliate Link Vault',
      'Multi-workspace Firestore memory sync',
    ],
    ctaLabel: 'Open Studio Dashboard',
    ctaHref: '/preview',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-950 dark:text-slate-100">
      <ToolPageNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono font-semibold text-indigo-700 dark:text-[#00D9FF]">
            {BRAND_NAME} Plans
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Start Free with 10 Daily AI Credits
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Test every tool with automatic daily credit resets, then top up paid credits when you scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-[#0D1322] p-7 flex flex-col justify-between gap-6"
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
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono tabular-nums text-slate-950 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{plan.cadence}</span>
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
                className="min-h-[44px] w-full rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#6366F1] text-slate-950 font-bold text-sm flex items-center justify-center"
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
