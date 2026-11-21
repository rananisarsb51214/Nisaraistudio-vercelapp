import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Leaf } from 'lucide-react';
import { GreenPlaybook } from '@/components/ai/green-playbook';
import { ThemeSwitcher } from '@/components/theme-switcher';

export const metadata: Metadata = {
  title: 'Green Playbook — Energy-Efficient & Low-Carbon AI Checklist',
  description:
    'Make NISAR AI Studio more energy-efficient and lower-carbon with an interactive checklist across AI usage, Compute, Data and storage, Frontend, Media, and Measure.',
  alternates: {
    canonical: '/green-playbook',
  },
};

export default function GreenPlaybookPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] black:bg-black text-slate-950 dark:text-slate-100 black:text-neutral-100 transition-colors duration-150">
      <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-emerald-950/60 black:border-neutral-800 bg-white/95 dark:bg-[#070B14]/90 black:bg-black/95 backdrop-blur-xl flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm sm:text-base font-extrabold tracking-tight text-slate-950 dark:text-white whitespace-nowrap shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4" />
          </span>
          <span>NISAR AI STUDIO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Dashboard
          </Link>
          <Link
            href="/tools"
            className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            AI Tools
          </Link>
          <Link
            href="/pricing"
            className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Pricing
          </Link>
          <Link
            href="/green-playbook"
            className="text-emerald-700 dark:text-emerald-400 font-semibold whitespace-nowrap shrink-0"
          >
            Green Playbook
          </Link>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeSwitcher compact />
          <Link
            href="/"
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Studio</span>
          </Link>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <GreenPlaybook />
      </main>
    </div>
  );
}
