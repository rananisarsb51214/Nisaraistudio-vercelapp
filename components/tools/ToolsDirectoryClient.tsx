'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Search, Sparkles } from 'lucide-react';
import type { SeoToolDefinition } from '@/lib/seo/tools-catalog-10';

interface ToolsDirectoryClientProps {
  tools: SeoToolDefinition[];
  initialQuery?: string;
}

export function ToolsDirectoryClient({
  tools,
  initialQuery = '',
}: ToolsDirectoryClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(tools.map((t) => t.category)))];

  const filteredTools = tools.filter((tool) => {
    if (selectedCategory !== 'All' && tool.category !== selectedCategory) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.tagline.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Search & Category Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI tools (e.g. Article, SEO, Hashtag, Code, Backlink)..."
            className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-indigo-500/30 bg-white dark:bg-[#0D1322] text-sm text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Highlighted Memory-Saved Gemini Agent Chatbot Card */}
      <Link
        href="/chatbot"
        className="block rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-[#0D1322] via-[#111936] to-[#171230] p-6 sm:p-7 hover:border-[#00D9FF] transition group"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-[#00D9FF]" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#00D9FF] font-semibold">
                Gemini Agent · Persistent Firestore Memory
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Memory-Saved Gemini Agent Chatbot
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Chat with a persistent Gemini AI Agent that remembers your brand guidelines, rules, and past conversations in Firebase Firestore.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00D9FF] text-slate-950 font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 self-start md:self-auto">
            <span>Open Memory Chatbot</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>

      {/* 10 AI Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0D1322]">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No tools matched &ldquo;{query}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="rounded-2xl border border-slate-200 dark:border-indigo-500/25 hover:border-[#00D9FF] bg-white dark:bg-[#0D1322] p-6 flex flex-col justify-between gap-5 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-indigo-700 dark:text-[#00D9FF] font-semibold">
                    {tool.category}
                  </span>
                  <span
                    className={
                      tool.status === 'Operational'
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-amber-600 dark:text-amber-400 font-semibold'
                    }
                  >
                    {tool.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-950 dark:text-white group-hover:text-[#00D9FF] transition">
                  {tool.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tool.tagline}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>{tool.model}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-[#00D9FF] font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
