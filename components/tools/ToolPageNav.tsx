'use client';

import Link from 'next/link';
import { ExternalLink, Sparkles } from 'lucide-react';
import {
  BRAND_NAME,
  GOOGLE_AI_STUDIO_APP_URL,
  VERCEL_PRODUCTION_URL,
} from '@/lib/seo/site-config';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { trackStudioEvent } from '@/lib/analytics';

export function ToolPageNav() {
  return (
    <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-10 border-b border-slate-200 dark:border-[#00D9FF]/20 bg-white/95 dark:bg-[#050811]/90 backdrop-blur-md flex items-center justify-between gap-4 sm:gap-6">
      <Link
        href="/"
        className="flex items-center gap-2.5 text-base sm:text-lg font-extrabold tracking-tight text-slate-950 dark:text-white whitespace-nowrap shrink-0"
      >
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D9FF] via-[#6366F1] to-[#8B5CF6] text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
          N
        </span>
        <span>{BRAND_NAME}</span>
      </Link>

      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <Link
          href="/tools"
          className="hover:text-slate-950 dark:hover:text-[#00D9FF] transition whitespace-nowrap shrink-0"
        >
          AI Tools
        </Link>
        <Link
          href="/chatbot"
          className="hover:text-slate-950 dark:hover:text-[#00D9FF] transition whitespace-nowrap shrink-0"
        >
          Memory Chatbot
        </Link>
        <Link
          href="/pricing"
          className="hover:text-slate-950 dark:hover:text-[#00D9FF] transition whitespace-nowrap shrink-0"
        >
          Pricing
        </Link>
        <Link
          href="/about"
          className="hover:text-slate-950 dark:hover:text-[#00D9FF] transition whitespace-nowrap shrink-0"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="hover:text-slate-950 dark:hover:text-[#00D9FF] transition whitespace-nowrap shrink-0"
        >
          Contact
        </Link>
      </nav>

      <div className="flex items-center gap-2.5 shrink-0">
        <a
          href={VERCEL_PRODUCTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden xl:inline-flex min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] hover:border-[#6366F1] text-xs font-semibold text-slate-700 dark:text-slate-200 items-center gap-1.5 whitespace-nowrap shrink-0 transition"
        >
          <span>Live Vercel</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#6366F1]" />
        </a>
        <a
          href={GOOGLE_AI_STUDIO_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackStudioEvent('open_google_ai_studio', { source: 'tool_nav' })}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00D9FF] via-[#6366F1] to-[#8B5CF6] text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Google AI Studio ↗</span>
        </a>
        <Link
          href="/preview"
          className="hidden sm:inline-flex min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-[#00D9FF]/35 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-[#22D3EE] font-semibold text-xs whitespace-nowrap shrink-0 items-center transition hover:border-[#00D9FF]"
        >
          Open Studio
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
