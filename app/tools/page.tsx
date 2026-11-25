import type { Metadata } from 'next';
import { ToolPageNav } from '@/components/tools/ToolPageNav';
import { ToolsDirectoryClient } from '@/components/tools/ToolsDirectoryClient';
import { TOOLS_CATALOG_10 } from '@/lib/seo/tools-catalog-10';
import { BRAND_NAME, BRAND_TAGLINE, SITE_URL } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Super AI Tool Box — All 10 AI Tools',
  description:
    'Explore all 10 Gemini-powered AI tools inside Nisar AI Studio: AI Article Writer, SEO Metadata, Hashtag Generator, Autonomous Coding Agent, Code Reviewer, Backlink Auto-Detect, and Affiliate Link Converter.',
  alternates: {
    canonical: '/tools',
  },
  openGraph: {
    title: `Super AI Tool Box | ${BRAND_NAME}`,
    description: BRAND_TAGLINE,
    url: `${SITE_URL}/tools`,
  },
};

export default async function ToolsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialQuery = typeof resolvedParams?.q === 'string' ? resolvedParams.q : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] black:bg-black text-slate-950 dark:text-slate-100 black:text-neutral-100 transition-colors duration-150">
      <ToolPageNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 space-y-10">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-mono font-semibold text-indigo-700 dark:text-[#00D9FF]">
            {BRAND_NAME} · {BRAND_TAGLINE}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Super AI Tool Box Directory
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Run 10 specialized streaming Gemini tools with 10 daily free AI credits, or open the persistent-memory Gemini Agent Chatbot.
          </p>
        </div>

        <ToolsDirectoryClient tools={TOOLS_CATALOG_10} initialQuery={initialQuery} />
      </main>
    </div>
  );
}
