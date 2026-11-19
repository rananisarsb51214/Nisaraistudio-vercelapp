import type { Metadata } from 'next';
import { ToolPageNav } from '@/components/tools/ToolPageNav';
import { MemoryGeminiChatbot } from '@/components/ai/memory-gemini-chatbot';
import { BRAND_NAME, SITE_URL } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Memory-Saved Gemini Agent Chatbot',
  description:
    'Chat with Nisar AI Studio Memory Agent powered by Google Gemini and persistent Firebase Firestore memory.',
  alternates: {
    canonical: '/chatbot',
  },
  openGraph: {
    title: `Memory-Saved Gemini Agent Chatbot | ${BRAND_NAME}`,
    description:
      'Persistent AI chatbot with custom saved brand rules, workspace memory, and streaming Google Gemini responses.',
    url: `${SITE_URL}/chatbot`,
  },
};

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-950 dark:text-slate-100">
      <ToolPageNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 space-y-8">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-mono font-semibold text-indigo-700 dark:text-[#00D9FF]">
            {BRAND_NAME} · Persistent AI Memory Agent
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Gemini Agent Ready Memory Chatbot
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Save workspace facts, instructions, and chat highlights into Firestore memory so Gemini recalls your context across turns.
          </p>
        </div>

        <MemoryGeminiChatbot />
      </main>
    </div>
  );
}
