import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, MapPin } from 'lucide-react';
import { ToolPageNav } from '@/components/tools/ToolPageNav';
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_TAGLINE,
  FOUNDER_INFO,
  GITHUB_HUB_URL,
  GITHUB_VERCEL_URL,
  GOOGLE_AI_STUDIO_APP_URL,
  SITE_URL,
  VERCEL_PRODUCTION_URL,
} from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'About NISAR AI STUDIO',
  description: BRAND_DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    title: `About ${BRAND_NAME}`,
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] black:bg-black text-slate-950 dark:text-slate-100 black:text-neutral-100 transition-colors duration-150">
      <ToolPageNav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-mono font-semibold text-indigo-700 dark:text-[#00D9FF]">
            About {BRAND_NAME} · Super AI Toolbox
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {BRAND_TAGLINE}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Founded by {FOUNDER_INFO.name} in {FOUNDER_INFO.location}, {BRAND_NAME} unifies Google Gemini search-grounded data collection, multi-model Agent Evolver control (Gemini + Claude AI), Firestore real-time quota management, dual Pakistan/international billing, and persistent memory chatbots into one production workspace.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>{FOUNDER_INFO.location}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#00D9FF]/25 bg-white dark:bg-[#0B0F19] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Official Production Links &amp; Synchronized Repositories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-semibold">
            <a
              href={VERCEL_PRODUCTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-[#00D9FF] flex items-center justify-between text-indigo-700 dark:text-[#00D9FF]"
            >
              <span>Live Production App (Vercel)</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
            <a
              href={GOOGLE_AI_STUDIO_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-[#00D9FF] flex items-center justify-between text-indigo-700 dark:text-[#22D3EE]"
            >
              <span>Google AI Studio App</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
            <a
              href={GITHUB_HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-[#6366F1] flex items-center justify-between text-slate-800 dark:text-slate-200"
            >
              <span>GitHub: Agent Skills Hub</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
            <a
              href={GITHUB_VERCEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] hover:border-[#8B5CF6] flex items-center justify-between text-slate-800 dark:text-slate-200"
            >
              <span>GitHub: Vercel Production Repo</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          </div>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
            <a
              href="https://www.youtube.com/@Billukittentailz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-700 dark:text-[#00D9FF] hover:underline"
            >
              YouTube Channel
            </a>
            <Link href="/tools" className="text-indigo-700 dark:text-[#00D9FF] hover:underline">
              Explore All 10 AI Tools
            </Link>
            <Link href="/pricing" className="text-indigo-700 dark:text-[#00D9FF] hover:underline">
              View Billing Plans
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
