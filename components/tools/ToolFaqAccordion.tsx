'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ToolFaqItem } from '@/lib/seo/tools-catalog-10';

export function ToolFaqAccordion({ faqs }: { faqs: ToolFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-indigo-500/25 bg-white dark:bg-[#0D1322] overflow-hidden">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="w-full min-h-[52px] px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-[#121A2E] transition cursor-pointer"
            >
              <span className="text-sm sm:text-base font-semibold text-slate-950 dark:text-white">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 dark:text-[#00D9FF] shrink-0 transition-transform duration-150 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
