'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Check,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  MessageSquare,
  RotateCcw,
  Send,
  Sliders,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { useAuth } from '../auth-provider';

type ChatMode = 'rule' | 'llm';
type LlmEngine = 'simulated' | 'gemini';
type RightTab = 'inspector' | 'code' | 'studio';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface KeywordRule {
  keywords: string[];
  reply: string;
}

const KEYWORD_RULES: KeywordRule[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'salam'],
    reply:
      "Hi there! I'm the rule-based bot. I only understand exact keywords like 'hours', 'price', or 'help'.",
  },
  {
    keywords: ['hour', 'hours', 'open', 'time'],
    reply: 'We are open Monday to Friday, 9:00 AM – 5:00 PM.',
  },
  {
    keywords: ['price', 'cost', 'pricing', 'plan'],
    reply: 'Our starter plan is free, and the pro plan is $10/month.',
  },
  {
    keywords: ['help', 'support'],
    reply:
      "Try asking about 'hours', 'price', or switch to Language Model mode above to see the difference!",
  },
];

const QUICK_PROMPTS = [
  { label: 'Hello!', prompt: 'Hello!' },
  { label: 'Hours?', prompt: 'What are your hours?' },
  { label: 'How do tokens work?', prompt: 'How do tokens work?' },
  { label: 'What did I just ask?', prompt: 'What did I just ask you?' },
];

const EDUCATIONAL_CODE = `// 1. RULE-BASED BOT: Matches exact keywords
function getRuleBasedReply(userText) {
  const lower = userText.toLowerCase();
  if (lower.includes("hello")) return "Hi there!";
  if (lower.includes("hours")) return "Open 9am - 5pm.";
  return "Sorry, I didn't understand."; // Rigid fallback
}

// 2. LANGUAGE MODEL BOT: Same chat UI, smarter engine
const history = []; // Stores the conversation across turns

async function getLLMReply(userText, systemPrompt) {
  // Add the new user message to conversation history
  history.push({ role: "user", content: userText });

  try {
    // Send system rules + full history to the server API route
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        prompt: JSON.stringify({
          system: systemPrompt, // Sets persona & rules
          messages: history     // Carries context across turns
        })
      })
    });

    const data = await response.json();
    const reply = data.text;

    // Save the AI's reply so the NEXT turn remembers it
    history.push({ role: "assistant", content: reply });
    return reply;
  } catch (err) {
    return "Could not reach the model API: " + err.message;
  }
}`;

const FIREBASE_CONFIG_TEXT = `// Super AI Toolbox • Nisaraistudio (Project: gen-lang-client-0727141331)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Paste full key in .env.local
  authDomain: "gen-lang-client-0727141331.firebaseapp.com",
  projectId: "gen-lang-client-0727141331",
  storageBucket: "gen-lang-client-0727141331.firebasestorage.app",
  messagingSenderId: "978292032659",
  appId: "1:978292032659:web:8e98c2123fa055bd6cf966",
  measurementId: "G-K7CGNRZBE4"
};`;

const ENV_TEXT = `NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gen-lang-client-0727141331
NEXT_PUBLIC_FIREBASE_APP_ID=1:978292032659:web:8e98c2123fa055bd6cf966
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-K7CGNRZBE4
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"`;

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function getRuleBasedReply(userText: string): {
  reply: string;
  matchedKeyword: string | null;
} {
  const lower = userText.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    const matched = rule.keywords.find((kw) => lower.includes(kw));
    if (matched) {
      return { reply: rule.reply, matchedKeyword: matched };
    }
  }
  return {
    reply:
      "I didn't recognize any keywords in that message. (Rule-based bots can't improvise!)",
    matchedKeyword: null,
  };
}

function getSimulatedLLMReply(history: ChatMessage[], systemPrompt: string): string {
  const lastUserMsg = history[history.length - 1]?.content || '';
  const lower = lastUserMsg.toLowerCase();

  if (lower.includes('just ask') || lower.includes('previous') || lower.includes('remember')) {
    const userTurns = history.filter((m) => m.role === 'user');
    if (userTurns.length >= 2) {
      const prev = userTurns[userTurns.length - 2].content;
      return `You previously asked: "${prev}". I know that because the app resent our full conversation history in the messages array!`;
    }
    return "This is your first message in this session, so there's no earlier question in the context yet.";
  }

  if (lower.includes('token')) {
    const tokens = estimateTokens(lastUserMsg);
    return `Tokens are small chunks of text (roughly 3–4 characters each). Your message "${lastUserMsg}" is about ${tokens} tokens. Models read and limit context by total tokens.`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! Right now I'm guided by your System Instruction ("${systemPrompt.slice(0, 60)}..."). Ask me anything, or edit the System Instruction on the right!`;
  }

  if (lower.includes('hour') || lower.includes('open')) {
    return "I'm an AI model, not a store—unless you give me your business hours in my System Instruction or a knowledge base, I don't know them (and if forced to guess, I might make them up!).";
  }

  const turnCount = history.length;
  return `I read your message ("${lastUserMsg}") along with ${turnCount - 1} earlier message(s) and your System Instruction. Unlike the rule-based bot, a real LLM predicts the best next words from patterns—even when no exact keyword matches.`;
}

export function ChatbotBasicsLab() {
  const { user } = useAuth();
  const userId = user?.uid || 'default_user';

  const [currentMode, setCurrentMode] = useState<ChatMode>('rule');
  const [llmEngine, setLlmEngine] = useState<LlmEngine>('simulated');
  const [rightTab, setRightTab] = useState<RightTab>('inspector');
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [matchedKeyword, setMatchedKeyword] = useState<string | null | undefined>(undefined);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a friendly, concise tutor helping a beginner learn AI basics. Always explain concepts in plain English.'
  );
  const [quotaBadge, setQuotaBadge] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, isSending]);

  const payloadPreviewJson = useMemo(() => {
    return JSON.stringify(
      {
        model: 'gemini-2.5-flash',
        messages: [{ role: 'system', content: systemPrompt.trim() }, ...conversationHistory],
      },
      null,
      2
    );
  }, [systemPrompt, conversationHistory]);

  const estimatedContextTokens = useMemo(
    () => estimateTokens(payloadPreviewJson),
    [payloadPreviewJson]
  );

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
  };

  const handleResetChat = () => {
    setConversationHistory([]);
    setMatchedKeyword(undefined);
  };

  const handleSendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isSending) return;

    const nextHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: trimmed },
    ];
    setConversationHistory(nextHistory);
    setInputValue('');

    if (currentMode === 'rule') {
      const result = getRuleBasedReply(trimmed);
      setMatchedKeyword(result.matchedKeyword);
      setConversationHistory([...nextHistory, { role: 'assistant', content: result.reply }]);
      return;
    }

    if (llmEngine === 'simulated') {
      const reply = getSimulatedLLMReply(nextHistory, systemPrompt.trim());
      setConversationHistory([...nextHistory, { role: 'assistant', content: reply }]);
      return;
    }

    // Live Gemini 2.5 Flash mode via /api/generate (respects 10/day atomic quota + paidCredits)
    setIsSending(true);
    try {
      const formattedContext = nextHistory
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
      const fullPrompt = `System Instruction: ${systemPrompt.trim()}\n\nConversation:\n${formattedContext}\nAssistant:`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt.slice(0, 10000),
          userId,
          model: 'gemini-2.5-flash',
        }),
      });

      const data = await res.json();
      if (data.quota) {
        setQuotaBadge(`Free Today: ${data.quota.remainingFree}/${data.quota.dailyLimit}`);
      }

      if (!res.ok) {
        const errMsg =
          res.status === 429
            ? `Quota limit reached: ${data.error || 'Daily limit (10/10) exhausted.'} Switch to Simulated mode or top up Paid Credits.`
            : data.error || 'Gemini API call failed.';
        setConversationHistory([...nextHistory, { role: 'assistant', content: errMsg }]);
        return;
      }

      setConversationHistory([
        ...nextHistory,
        { role: 'assistant', content: data.text || 'No response generated.' },
      ]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Network error calling /api/generate.';
      setConversationHistory([...nextHistory, { role: 'assistant', content: `Error: ${msg}` }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Top Header & Mode Switcher */}
      <header className="border-b border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-4 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-600/30 dark:border-cyan-400/30 flex items-center justify-center text-cyan-800 dark:text-cyan-300 font-bold text-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white leading-tight flex items-center gap-2">
                Chatbot Basics Lab
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/15 text-cyan-900 dark:text-cyan-300 border border-cyan-600/30 dark:border-cyan-500/30">
                  Interactive Sandbox
                </span>
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-400">
                Compare keyword rules vs. a language model in real time
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quotaBadge && (
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-600/30">
                {quotaBadge}
              </span>
            )}

            {/* Mode Toggle */}
            <div
              className="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 p-1 rounded-lg border border-slate-300 dark:border-slate-800"
              role="group"
              aria-label="Chatbot mode"
            >
              <button
                type="button"
                onClick={() => setCurrentMode('rule')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  currentMode === 'rule'
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                1. Rule-Based
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('llm')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  currentMode === 'llm'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                2. Language Model
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Chat */}
        <section className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden h-[560px] lg:h-[640px]">
          {/* Chat Status Bar */}
          <div className="px-4 py-2.5 border-b border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900/60">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentMode === 'rule' ? 'bg-cyan-500' : 'bg-indigo-500'
                }`}
              />
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                {currentMode === 'rule'
                  ? 'Rule-Based Mode (Keyword Matching)'
                  : `Language Model Mode (${
                      llmEngine === 'simulated' ? 'Simulated' : 'Live Gemini 2.5 Flash'
                    })`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentMode === 'llm' && (
                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 p-0.5 rounded-md border border-slate-300 dark:border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setLlmEngine('simulated')}
                    className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                      llmEngine === 'simulated'
                        ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Simulated
                  </button>
                  <button
                    type="button"
                    onClick={() => setLlmEngine('gemini')}
                    className={`px-2 py-0.5 rounded font-medium transition flex items-center gap-1 cursor-pointer ${
                      llmEngine === 'gemini'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    Live Gemini
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleResetChat}
                className="text-xs text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Chat
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-transparent">
            {conversationHistory.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-900 dark:text-slate-200 font-semibold mb-1">
                  Start a conversation
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Type a message below or click a quick prompt to see how{' '}
                  {currentMode === 'rule' ? 'keyword matching' : 'a language model'} responds.
                </p>
              </div>
            ) : (
              conversationHistory.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={`${msg.role}_${idx}`}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-medium shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div
                        className={`text-[10px] uppercase tracking-wider mb-0.5 font-semibold ${
                          isUser
                            ? 'text-cyan-100 dark:text-slate-800'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isUser
                          ? 'You'
                          : currentMode === 'rule'
                          ? 'Rule Bot'
                          : llmEngine === 'simulated'
                          ? 'LLM (Simulated)'
                          : 'Gemini 2.5 Flash'}
                      </div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                );
              })
            )}

            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  Generating response with Gemini 2.5 Flash...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Test Prompts */}
          <div className="px-4 py-2 border-t border-slate-300 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900/50 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-400 mr-1">
              Try:
            </span>
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                disabled={isSending}
                onClick={() => void handleSendMessage(qp.prompt)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage(inputValue);
            }}
            className="p-3 border-t border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex gap-2"
          >
            <input
              type="text"
              autoComplete="off"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold text-sm transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </section>

        {/* Right Column: Under the Hood (Inspector + Commented Code + Studio Config) */}
        <section className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden h-[560px] lg:h-[640px]">
          {/* Inspector Tabs */}
          <div className="flex border-b border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={() => setRightTab('inspector')}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
                rightTab === 'inspector'
                  ? 'border-cyan-500 text-cyan-800 dark:text-cyan-300 bg-white dark:bg-transparent'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Live Inspector
            </button>
            <button
              type="button"
              onClick={() => setRightTab('code')}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
                rightTab === 'code'
                  ? 'border-cyan-500 text-cyan-800 dark:text-cyan-300 bg-white dark:bg-transparent'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Commented Code
            </button>
            <button
              type="button"
              onClick={() => setRightTab('studio')}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
                rightTab === 'studio'
                  ? 'border-cyan-500 text-cyan-800 dark:text-cyan-300 bg-white dark:bg-transparent'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Studio Config
            </button>
          </div>

          {/* Tab 1: Live Inspector */}
          {rightTab === 'inspector' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMode === 'rule' ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
                    <div className="text-xs font-bold text-cyan-800 dark:text-cyan-300 mb-1">
                      Last Match Result
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-300">
                      {matchedKeyword === undefined ? (
                        'Send a message to see which keyword rule triggers.'
                      ) : matchedKeyword === null ? (
                        <span className="text-amber-700 dark:text-amber-300 font-medium">
                          No keyword matched → used fallback reply.
                        </span>
                      ) : (
                        <>
                          Matched keyword:{' '}
                          <span className="text-cyan-800 dark:text-cyan-300 font-mono font-bold">
                            &quot;{matchedKeyword}&quot;
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-300 mb-2">
                      Active Keyword Rules
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {KEYWORD_RULES.map((rule, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border ${
                            matchedKeyword && rule.keywords.includes(matchedKeyword)
                              ? 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-500/60'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800'
                          }`}
                        >
                          <span className="text-cyan-800 dark:text-cyan-300 font-mono font-semibold">
                            [{rule.keywords.join(', ')}]
                          </span>
                          <span className="text-slate-700 dark:text-slate-400"> → {rule.reply}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* System Instruction */}
                  <div>
                    <label
                      htmlFor="lab-system-prompt-input"
                      className="block text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1"
                    >
                      System Instruction (sets behavior &amp; rules)
                    </label>
                    <textarea
                      id="lab-system-prompt-input"
                      rows={3}
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-950 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Token Counter */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
                      <div className="text-[11px] text-slate-700 dark:text-slate-400">
                        Turns in Memory
                      </div>
                      <div className="text-base font-bold text-slate-950 dark:text-white">
                        {conversationHistory.length}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
                      <div className="text-[11px] text-slate-700 dark:text-slate-400">
                        Est. Context Tokens
                      </div>
                      <div className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                        {estimatedContextTokens}
                      </div>
                    </div>
                  </div>

                  {/* Context Payload Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-300">
                        Payload Sent to Model (JSON)
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-500">
                        Sent fresh every turn
                      </span>
                    </div>
                    <pre className="bg-slate-950 text-emerald-300 border border-slate-800 rounded-lg p-3 text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                      {payloadPreviewJson}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Commented Code */}
          {rightTab === 'code' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-800 dark:text-slate-300 font-semibold">
                  How the same app switches engines:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('code', EDUCATIONAL_CODE)}
                  className="text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'code' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                {EDUCATIONAL_CODE}
              </pre>
            </div>
          )}

          {/* Tab 3: Studio Config */}
          {rightTab === 'studio' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300">
                    Nisar AI Studio • Super AI Toolbox
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-600/30">
                    Gemini 2.5 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-400">
                  Reference configuration for Firebase project gen-lang-client-0727141331, Google AI Studio, and Vercel deployment.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://console.firebase.google.com/project/gen-lang-client-0727141331"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-800 dark:text-cyan-300 border border-slate-300 dark:border-slate-700 transition inline-flex items-center gap-1"
                  >
                    Firebase Console <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-800 dark:text-indigo-300 border border-slate-300 dark:border-slate-700 transition inline-flex items-center gap-1"
                  >
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://vercel.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition inline-flex items-center gap-1"
                  >
                    Vercel Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Firebase Config */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-300">
                    Firebase Web Config
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('firebase', FIREBASE_CONFIG_TEXT)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 transition cursor-pointer"
                  >
                    {copiedId === 'firebase' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-amber-200 overflow-x-auto leading-relaxed">
                  {FIREBASE_CONFIG_TEXT}
                </pre>
              </div>

              {/* Vercel .env.local */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-300">
                    Vercel / .env.local Variables
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('env', ENV_TEXT)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 transition cursor-pointer"
                  >
                    {copiedId === 'env' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {ENV_TEXT}
                </pre>
              </div>

              {/* API Routes Summary */}
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-800 dark:text-slate-300">
                <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  API Routes &amp; Firestore Quota
                </div>
                <div>
                  <code className="text-cyan-800 dark:text-cyan-300 font-mono font-semibold">
                    POST /api/generate
                  </code>{' '}
                  — Validates prompt (&le;10,000 chars), checks quota, runs Gemini 2.5 Flash.
                </div>
                <div>
                  <code className="text-cyan-800 dark:text-cyan-300 font-mono font-semibold">
                    POST /api/ai/generate
                  </code>{' '}
                  — Deducts daily free (10/day) or paid credits before execution (HTTP 429 if exhausted).
                </div>
                <div>
                  <code className="text-cyan-800 dark:text-cyan-300 font-mono font-semibold">
                    POST /api/ai/credits
                  </code>{' '}
                  — Updates/reads live <code className="font-mono">UserCredits</code> via Firestore{' '}
                  <code className="font-mono">onSnapshot</code>.
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
