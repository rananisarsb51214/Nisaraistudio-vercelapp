import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ToolPageNav } from '@/components/tools/ToolPageNav';
import { ToolRunner } from '@/components/tools/ToolRunner';
import { ToolFaqAccordion } from '@/components/tools/ToolFaqAccordion';
import {
  getSeoToolBySlug,
  TOOLS_CATALOG_10,
} from '@/lib/seo/tools-catalog-10';
import { BRAND_NAME, SITE_URL } from '@/lib/seo/site-config';

export function generateStaticParams() {
  return TOOLS_CATALOG_10.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getSeoToolBySlug(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
    };
  }

  return {
    title: tool.seoTitle,
    description: tool.metaDescription,
    alternates: {
      canonical: `/tools/${tool.slug}`,
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/tools/${tool.slug}`,
      title: `${tool.seoTitle} | ${BRAND_NAME}`,
      description: tool.metaDescription,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.seoTitle} | ${BRAND_NAME}`,
      description: tool.metaDescription,
      images: ['/og-image.png'],
    },
  };
}

export default async function ToolSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getSeoToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = TOOLS_CATALOG_10.filter((t) =>
    tool.relatedSlugs.includes(t.slug)
  );

  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'AI Tools',
            item: `${SITE_URL}/tools`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.name,
            item: `${SITE_URL}/tools/${tool.slug}`,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: tool.name,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: `${SITE_URL}/tools/${tool.slug}`,
        description: tool.metaDescription,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-950 dark:text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <ToolPageNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-slate-950 dark:hover:text-[#00D9FF] transition">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/tools" className="hover:text-slate-950 dark:hover:text-[#00D9FF] transition">
            Tools
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 dark:text-white font-semibold">{tool.name}</span>
        </nav>

        {/* Hero Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
            <span className="text-indigo-700 dark:text-[#00D9FF] font-semibold">
              {tool.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Model: {tool.model}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span
              className={
                tool.status === 'Operational'
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-amber-600 dark:text-amber-400 font-semibold'
              }
            >
              Status: {tool.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {tool.name}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {tool.tagline}
          </p>
        </header>

        {/* Streaming Interactive ToolRunner */}
        <ToolRunner
          toolName={tool.name}
          endpoint={tool.endpoint}
          placeholder={tool.placeholder}
          samplePrompt={tool.samplePrompt}
        />

        {/* 3-Step How-To Guide */}
        <section aria-label="How it works" className="space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
            How to Use {tool.name} in 3 Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tool.howToSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 dark:border-indigo-500/25 bg-white dark:bg-[#0D1322] p-6 space-y-2.5"
              >
                <div className="text-xs font-mono font-bold text-indigo-700 dark:text-[#00D9FF] inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Step 0{index + 1}</span>
                </div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section aria-label="Frequently Asked Questions" className="space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
            Frequently Asked Questions
          </h2>
          <ToolFaqAccordion faqs={tool.faqs} />
        </section>

        {/* Internal Links to Related Tools */}
        <section aria-label="Related AI Tools" className="space-y-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">
              Related Tools in Super AI Tool Box
            </h2>
            <Link
              href="/tools"
              className="text-xs font-semibold text-indigo-700 dark:text-[#00D9FF] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All 10 Tools</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedTools.map((rel) => (
              <Link
                key={rel.slug}
                href={`/tools/${rel.slug}`}
                className="rounded-2xl border border-slate-200 dark:border-indigo-500/25 hover:border-[#00D9FF] bg-white dark:bg-[#0D1322] p-5 flex flex-col justify-between gap-3 transition group"
              >
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-indigo-700 dark:text-[#00D9FF] font-semibold">
                    {rel.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white group-hover:text-[#00D9FF] transition">
                    {rel.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {rel.tagline}
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-700 dark:text-[#00D9FF] inline-flex items-center gap-1">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
