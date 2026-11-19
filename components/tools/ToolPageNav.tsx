import Link from 'next/link';
import { BRAND_NAME } from '@/lib/seo/site-config';
import { ThemeSwitcher } from '@/components/theme-switcher';

export function ToolPageNav() {
  return (
    <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-10 border-b border-slate-200 dark:border-indigo-500/20 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-md flex items-center justify-between gap-8">
      <Link
        href="/"
        className="flex items-center gap-2.5 text-base sm:text-lg font-extrabold tracking-tight text-slate-950 dark:text-white whitespace-nowrap shrink-0"
      >
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D9FF] via-[#6366F1] to-[#8B5CF6] text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
          N
        </span>
        <span>{BRAND_NAME}</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
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

      <div className="flex items-center gap-3 shrink-0">
        <ThemeSwitcher />
        <Link
          href="/preview"
          className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#6366F1] text-slate-950 font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 inline-flex items-center"
        >
          Open Studio
        </Link>
      </div>
    </header>
  );
}
