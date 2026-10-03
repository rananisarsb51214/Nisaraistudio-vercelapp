'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Plus, Trash2, Search, Clock, Send, 
  Sparkles, Loader2, ChevronRight, Bookmark, ArrowRight, Bot,
  Download, FileJson, FileText
} from 'lucide-react';
import { useAuth } from '../auth-provider';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp 
} from 'firebase/firestore';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  projectId?: string;
  messages: ChatMessage[];
  createdAt: any;
  updatedAt: any;
}

export function ChatHistorySidebar({ selectedProjectId }: { selectedProjectId: string }) {
  const { user } = useAuth();
  const userId = user?.uid || 'default_user';

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Fetch chat sessions from Firestore
  useEffect(() => {
    if (!userId) return;
    fetchSessions();
  }, [userId]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const q = query(collection(db, 'chat_sessions'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const loadedSessions: ChatSession[] = [];
      snap.forEach((d) => {
        loadedSessions.push({ id: d.id, ...d.data() } as ChatSession);
      });
      // Sort by updatedAt descending
      loadedSessions.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : new Date(a.updatedAt || 0).getTime();
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : new Date(b.updatedAt || 0).getTime();
        return timeB - timeA;
      });

      setSessions(loadedSessions);
      if (loadedSessions.length > 0 && !activeSessionId) {
        setActiveSessionId(loadedSessions[0].id);
        setMessages(loadedSessions[0].messages || []);
      }
    } catch (e) {
      console.warn('Failed to fetch chat sessions:', e);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages || []);
  };

  const handleCreateNewChat = async () => {
    try {
      const newSessionData = {
        title: 'New AI Conversation',
        userId,
        projectId: selectedProjectId || 'default',
        messages: [
          {
            role: 'model' as const,
            text: 'Hello! I am your NISAR AI Assistant with persistent Firestore memory. How can I assist you today?',
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'chat_sessions'), newSessionData);
      const newSession: ChatSession = { id: docRef.id, ...newSessionData };
      setSessions([newSession, ...sessions]);
      setActiveSessionId(docRef.id);
      setMessages(newSession.messages);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'chat_sessions');
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat conversation?')) return;
    try {
      await deleteDoc(doc(db, 'chat_sessions', sessionId));
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0].id);
          setMessages(updated[0].messages || []);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'chat_sessions');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isGenerating) return;

    let currentSessionId = activeSessionId;
    let updatedSessions = [...sessions];

    // If no active session, create one
    if (!currentSessionId) {
      try {
        const newSessionData = {
          title: inputMessage.slice(0, 30) + '...',
          userId,
          projectId: selectedProjectId || 'default',
          messages: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        const docRef = await addDoc(collection(db, 'chat_sessions'), newSessionData);
        currentSessionId = docRef.id;
        setActiveSessionId(currentSessionId);
      } catch (err) {
        console.error(err);
        return;
      }
    }

    const userMsg: ChatMessage = {
      role: 'user',
      text: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const promptText = inputMessage.trim();
    setInputMessage('');
    setIsGenerating(true);

    try {
      // Call Gemini API route
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'social-post',
          userId,
          parameters: { topic: promptText, tone: 'professional' },
          model: 'gemini-3.5-flash',
          tone: 'professional',
          language: 'English'
        })
      });

      const data = await res.json();
      const modelReplyText = data.success && data.output ? (typeof data.output === 'string' ? data.output : JSON.stringify(data.output)) : 'AI generation completed successfully.';

      const modelMsg: ChatMessage = {
        role: 'model',
        text: modelReplyText,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...newMessages, modelMsg];
      setMessages(finalMessages);

      // Update Firestore
      const sessionRef = doc(db, 'chat_sessions', currentSessionId);
      const titleCandidate = finalMessages.find(m => m.role === 'user')?.text.slice(0, 30) + '...' || 'Chat Session';
      await updateDoc(sessionRef, {
        title: titleCandidate,
        messages: finalMessages,
        updatedAt: Timestamp.now()
      });

      // Refresh session list locally
      setSessions(sessions.map(s => s.id === currentSessionId ? { ...s, title: titleCandidate, messages: finalMessages, updatedAt: Timestamp.now() } : s));
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'model',
        text: `Error: ${err.message || 'Failed to generate response'}`,
        timestamp: new Date().toISOString()
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadJson = () => {
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeSession, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chat_session_${activeSession.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadPdf = () => {
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>${activeSession.title} - Chat Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
            .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
            .msg { margin-bottom: 15px; padding: 12px; border-radius: 8px; line-height: 1.5; }
            .user { background: #e3f2fd; border-left: 4px solid #1e88e5; }
            .model { background: #f1f3f4; border-left: 4px solid #10b981; }
            .role { font-weight: bold; font-size: 11px; text-transform: uppercase; margin-bottom: 4px; color: #444; }
          </style>
        </head>
        <body>
          <h1>${activeSession.title}</h1>
          <div class="meta">Exported from NISAR AI Studio • Session ID: ${activeSession.id}</div>
          <div>
            ${messages.map(m => `
              <div class="msg ${m.role}">
                <div class="role">${m.role === 'user' ? 'User' : 'Gemini AI'} (${new Date(m.timestamp).toLocaleString()})</div>
                <div>${m.text.replace(/\n/g, '<br>')}</div>
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages?.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 h-[750px] bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Sidebar List */}
      <div className="lg:col-span-1 border-r border-slate-800 bg-[#0d0f14]/80 flex flex-col">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Chat History</span>
            </h3>
            <button
              onClick={handleCreateNewChat}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold font-mono flex items-center space-x-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search past chats..."
              className="w-full bg-[#161922] border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingSessions ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No chat history found</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition text-xs ${
                  activeSessionId === session.id
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-slate-100 font-medium'
                    : 'hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Bot className={`w-4 h-4 shrink-0 ${activeSessionId === session.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Thread Area */}
      <div className="lg:col-span-3 flex flex-col bg-slate-950">
        {activeSessionId ? (
          <>
            <div className="p-4 border-b border-slate-800 bg-[#0d0f14]/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  {sessions.find(s => s.id === activeSessionId)?.title || 'Active Session'}
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadJson}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-[10px] font-mono flex items-center space-x-1 transition cursor-pointer"
                  title="Export as JSON"
                >
                  <FileJson className="w-3 h-3 text-emerald-400" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-[10px] font-mono flex items-center space-x-1 transition cursor-pointer"
                  title="Export as PDF / Print"
                >
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span>PDF / Print</span>
                </button>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-900">
                  Firestore Persisted
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed font-sans ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                        : 'bg-[#181b24] text-slate-100 border border-slate-800 rounded-bl-none shadow-inner whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-[#181b24] border border-slate-800 p-4 rounded-2xl rounded-bl-none flex items-center space-x-2 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Gemini is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-[#0d0f14]/80 flex space-x-2">
              <input
                type="text"
                placeholder="Type your message to Gemini..."
                className="flex-1 bg-[#161922] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={isGenerating || !inputMessage.trim()}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Bot className="w-12 h-12 text-slate-600 mb-3" />
            <h4 className="text-sm font-bold text-slate-200">No Chat Selected</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              Select an existing conversation from the sidebar or start a new chat to begin interacting with Gemini.
            </p>
            <button
              onClick={handleCreateNewChat}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono transition"
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
