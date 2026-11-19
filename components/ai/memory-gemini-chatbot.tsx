'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookmarkPlus,
  Bot,
  Brain,
  Check,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { loginWithGoogle, useAuth } from '@/components/auth-provider';

interface ChatMessageItem {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface ChatSessionItem {
  id: string;
  title: string;
  userId: string;
  projectId?: string;
  messages: ChatMessageItem[];
  updatedAt?: any;
}

interface SavedMemoryNode {
  id: string;
  key: string;
  value: string;
  category: string;
  tenantId?: string;
}

export function MemoryGeminiChatbot({ selectedProjectId = 'default' }: { selectedProjectId?: string }) {
  const { user } = useAuth();
  const userId = user?.uid || 'default_user';

  // Persistent Memory Nodes State
  const [memories, setMemories] = useState<SavedMemoryNode[]>([]);
  const [memoryKey, setMemoryKey] = useState('');
  const [memoryValue, setMemoryValue] = useState('');
  const [memoryCategory, setMemoryCategory] = useState('brand_guidelines');
  const [savingMemory, setSavingMemory] = useState(false);
  const [savedNoticeId, setSavedNoticeId] = useState<string | null>(null);

  // Chat Sessions State
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subscribe to Firestore saved memory & chat sessions when signed in
  useEffect(() => {
    if (!db || !user?.uid) {
      setMemories([]);
      setSessions([]);
      return;
    }

    const memQuery = query(collection(db, 'memory'), where('tenantId', '==', user.uid));
    const unsubMem = onSnapshot(
      memQuery,
      (snap) => {
        const items: SavedMemoryNode[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SavedMemoryNode, 'id'>),
        }));
        setMemories(items);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.GET, 'memory');
        } catch {
          // Logged safely
        }
      }
    );

    const chatQuery = query(collection(db, 'chat_sessions'), where('userId', '==', user.uid));
    const unsubChat = onSnapshot(
      chatQuery,
      (snap) => {
        const list: ChatSessionItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ChatSessionItem, 'id'>),
        }));
        list.sort((a, b) => {
          const getTime = (v: any) => (v?.toMillis ? v.toMillis() : new Date(v || 0).getTime());
          return getTime(b.updatedAt) - getTime(a.updatedAt);
        });
        setSessions(list);
        if (list.length > 0 && !activeSessionId) {
          setActiveSessionId(list[0].id);
          setMessages(list[0].messages || []);
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.GET, 'chat_sessions');
        } catch {
          // Logged safely
        }
      }
    );

    return () => {
      unsubMem();
      unsubChat();
    };
  }, [user?.uid, activeSessionId]);

  const handleSaveMemoryNode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = memoryKey.trim();
    const cleanVal = memoryValue.trim();
    if (!cleanKey || !cleanVal) return;

    setSavingMemory(true);
    setErrorMsg(null);
    try {
      if (user?.uid && db) {
        await addDoc(collection(db, 'memory'), {
          key: cleanKey,
          value: cleanVal,
          category: memoryCategory,
          projectId: selectedProjectId || 'default',
          tenantId: user.uid,
          createdAt: Timestamp.now(),
        });
      } else {
        setMemories((prev) => [
          {
            id: `local_${Date.now()}`,
            key: cleanKey,
            value: cleanVal,
            category: memoryCategory,
          },
          ...prev,
        ]);
      }
      setMemoryKey('');
      setMemoryValue('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save memory node.');
    } finally {
      setSavingMemory(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (user?.uid && db && !id.startsWith('local_')) {
      try {
        await deleteDoc(doc(db, 'memory', id));
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, `memory/${id}`);
        } catch {
          // Logged
        }
      }
    } else {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleSaveReplyToMemory = async (msgText: string, index: number) => {
    const summaryVal = msgText.slice(0, 450);
    const keyLabel = `chat_fact_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}`;
    try {
      if (user?.uid && db) {
        await addDoc(collection(db, 'memory'), {
          key: keyLabel,
          value: summaryVal,
          category: 'agent_memory',
          projectId: selectedProjectId || 'default',
          tenantId: user.uid,
          createdAt: Timestamp.now(),
        });
      } else {
        setMemories((prev) => [
          {
            id: `local_${Date.now()}`,
            key: keyLabel,
            value: summaryVal,
            category: 'agent_memory',
          },
          ...prev,
        ]);
      }
      setSavedNoticeId(`${index}`);
      setTimeout(() => setSavedNoticeId(null), 2000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save reply to memory.');
    }
  };

  const handleNewSession = async () => {
    const starter: ChatMessageItem = {
      role: 'model',
      text: 'Assalam-o-Alaikum! I am Nisar AI Memory Agent. Everything saved in your Memory Vault on the left is automatically remembered across our conversation.',
      timestamp: new Date().toISOString(),
    };

    if (user?.uid && db) {
      try {
        const ref = await addDoc(collection(db, 'chat_sessions'), {
          title: 'Memory Agent Chat',
          userId: user.uid,
          projectId: selectedProjectId || 'default',
          messages: [starter],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setActiveSessionId(ref.id);
        setMessages([starter]);
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.CREATE, 'chat_sessions');
        } catch {
          // Logged
        }
      }
    } else {
      setActiveSessionId(null);
      setMessages([starter]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const promptText = input.trim();
    if (!promptText || isStreaming) return;

    setErrorMsg(null);
    setInput('');
    setIsStreaming(true);

    const userMsg: ChatMessageItem = {
      role: 'user',
      text: promptText,
      timestamp: new Date().toISOString(),
    };

    const baseMessages = [...messages, userMsg];
    setMessages([...baseMessages, { role: 'model', text: '', timestamp: new Date().toISOString() }]);

    let currentSessionId = activeSessionId;
    if (user?.uid && db && !currentSessionId) {
      try {
        const safeTitle = (promptText.slice(0, 60).trim() || 'Memory Chat');
        const ref = await addDoc(collection(db, 'chat_sessions'), {
          title: safeTitle,
          userId: user.uid,
          projectId: selectedProjectId || 'default',
          messages: baseMessages,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        currentSessionId = ref.id;
        setActiveSessionId(ref.id);
      } catch {
        // Continue chat locally if session creation fails
      }
    }

    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          userId,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          memories: memories.map((m) => ({
            key: m.key,
            value: m.value,
            category: m.category,
          })),
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        let msg = `Gemini API error (${response.status})`;
        if (contentType.includes('application/json')) {
          const errJson = await response.json();
          msg = errJson?.error || msg;
        }
        throw new Error(msg);
      }

      let fullReply = '';
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            fullReply += decoder.decode(value, { stream: true });
            setMessages([
              ...baseMessages,
              { role: 'model', text: fullReply, timestamp: new Date().toISOString() },
            ]);
          }
        }
        fullReply += decoder.decode();
      } else {
        fullReply = await response.text();
      }

      const finalMessages: ChatMessageItem[] = [
        ...baseMessages,
        {
          role: 'model',
          text: fullReply || 'No response received.',
          timestamp: new Date().toISOString(),
        },
      ];
      setMessages(finalMessages);

      if (user?.uid && db && currentSessionId) {
        const safeUpdatedTitle = (finalMessages.find((m) => m.role === 'user')?.text.slice(0, 60).trim() || 'Memory Chat');
        await updateDoc(doc(db, 'chat_sessions', currentSessionId), {
          title: safeUpdatedTitle,
          messages: finalMessages.slice(-200),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err: unknown) {
      const textErr = err instanceof Error ? err.message : 'Failed to connect to Gemini.';
      setErrorMsg(textErr);
      setMessages(baseMessages);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Persistent Memory Bank & Sessions */}
      <aside className="lg:col-span-4 space-y-5">
        <div className="rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-[#0D1322] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-700 dark:text-[#00D9FF]" />
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                Saved Agent Memory
              </h2>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {memories.length} facts
            </span>
          </div>

          {!user && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-indigo-500/25 space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Sign in with Google to save memories &amp; chat sessions permanently in Firestore.
              </p>
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#00D9FF] text-slate-950 text-xs font-bold cursor-pointer"
              >
                Continue with Google
              </button>
            </div>
          )}

          {/* Add Memory Form */}
          <form onSubmit={handleSaveMemoryNode} className="space-y-3">
            <input
              type="text"
              value={memoryKey}
              onChange={(e) => setMemoryKey(e.target.value)}
              placeholder="Memory key (e.g. brand_voice)"
              className="w-full min-h-[42px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D9FF]"
            />
            <textarea
              rows={2}
              value={memoryValue}
              onChange={(e) => setMemoryValue(e.target.value)}
              placeholder="Fact to remember (e.g. Our brand is Nisar AI Studio targeting Pakistan SaaS founders)..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D9FF]"
            />
            <div className="flex items-center gap-2">
              <select
                value={memoryCategory}
                onChange={(e) => setMemoryCategory(e.target.value)}
                className="flex-1 min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="brand_guidelines">Brand Guidelines</option>
                <option value="target_audience">Target Audience</option>
                <option value="seo_rules">SEO Rules</option>
                <option value="agent_memory">Agent Fact</option>
              </select>
              <button
                type="submit"
                disabled={savingMemory || !memoryKey.trim() || !memoryValue.trim()}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#6366F1] disabled:opacity-50 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Memory</span>
              </button>
            </div>
          </form>

          {/* Saved Memory List */}
          <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
            {memories.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No memories saved yet. Add a fact above to personalize Gemini replies.
              </p>
            ) : (
              memories.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono text-indigo-700 dark:text-[#00D9FF] font-semibold truncate">
                      {m.key} · {m.category}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 break-words">
                      {m.value}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMemory(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition shrink-0 cursor-pointer"
                    aria-label={`Delete memory ${m.key}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Saved Chat Sessions */}
        {sessions.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-[#0D1322] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
                <span>Saved Chat Threads</span>
              </span>
              <button
                type="button"
                onClick={handleNewSession}
                className="text-xs font-semibold text-indigo-700 dark:text-[#00D9FF] hover:underline cursor-pointer"
              >
                + New Chat
              </button>
            </div>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveSessionId(s.id);
                    setMessages(s.messages || []);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium truncate transition cursor-pointer ${
                    activeSessionId === s.id
                      ? 'bg-indigo-50 dark:bg-[#6366F1]/20 text-indigo-900 dark:text-[#00D9FF] border border-indigo-500/40'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#070B14]'
                  }`}
                >
                  {s.title || 'Untitled Session'}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Right Column: Streaming Gemini Chatbot */}
      <section className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-[#0D1322] flex flex-col min-h-[540px] max-h-[720px]">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-700 dark:text-[#00D9FF]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
                Nisar AI Memory Agent Chatbot
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Linked to Google Gemini 4 Hydrogen · {memories.length} active memory context nodes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNewSession}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-indigo-500/30 bg-slate-50 dark:bg-[#070B14] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#00D9FF] cursor-pointer"
          >
            New Thread
          </button>
        </div>

        {/* Conversation Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
              <Sparkles className="w-9 h-9 text-[#00D9FF]" />
              <h3 className="text-base font-bold text-slate-950 dark:text-white">
                Memory-Ready Gemini Agent Online
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
                Ask anything about SEO, Next.js code, marketing campaigns, or workflows. Save any fact on the left so the agent remembers it automatically.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={`${msg.timestamp}_${idx}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-[#6366F1] text-white'
                      : 'bg-slate-100 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {msg.text || (isStreaming && idx === messages.length - 1 ? 'Thinking...' : '')}
                  </div>
                  {msg.role === 'model' && msg.text && (
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveReplyToMemory(msg.text, idx)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 dark:text-[#00D9FF] hover:underline cursor-pointer"
                      >
                        {savedNoticeId === `${idx}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Saved to Memory</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3 h-3" />
                            <span>Save Reply to Memory</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {errorMsg && (
          <div className="mx-5 mb-3 p-3 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Chat Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Nisar AI Memory Agent..."
            disabled={isStreaming}
            className="flex-1 min-h-[46px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-4 py-2.5 text-sm text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#6366F1] disabled:opacity-50 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Send</span>
          </button>
        </form>
      </section>
    </div>
  );
}
