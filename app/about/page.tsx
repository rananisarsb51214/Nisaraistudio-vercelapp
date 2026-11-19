import type { Metadata } from 'next';
import Link from 'next/link';
import { ToolPageNav } from '@/components/tools/ToolPageNav';
import { BRAND_DESCRIPTION, BRAND_NAME, BRAND_TAGLINE, SITE_URL } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'About Nisar AI Studio',
  description: BRAND_DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    title: `About ${BRAND_NAME}`,
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-950 dark:text-slate-100">
      <ToolPageNav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-mono font-semibold text-indigo-700 dark:text-[#00D9FF]">
            About {BRAND_NAME}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {BRAND_TAGLINE}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Founded by Muhammad Nisar, Nisar AI Studio brings together Google Gemini streaming tools, Firestore persistent memory agents, SEO workflows, and automated lead qualification inside one clean Next.js platform.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-[#0D1322] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Official Channels &amp; Open Source
          </h2>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <a
              href="https://github.com/rananisarsb51214"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-700 dark:text-[#00D9FF] hover:underline"
            >
              GitHub Profile
            </a>
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
          </div>
        </div>
      </main>
    </div>
  );
}
