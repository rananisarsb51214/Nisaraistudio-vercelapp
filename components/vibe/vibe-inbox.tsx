'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, Send, Bot, Check, Edit2, RotateCw, AlertTriangle, 
  Trash2, Filter, Search, Sparkles, CheckCircle, Clock, ShieldAlert, Tag 
} from 'lucide-react';
import { Conversation, ConversationMessage, SocialPlatform } from '@/lib/vibe/types';

interface VibeInboxProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: ConversationMessage[];
  onSelectConversation: (conv: Conversation) => void;
  onGenerateReply: (conv: Conversation) => Promise<void>;
  onSendReply: (conv: Conversation, replyText: string) => Promise<void>;
  onUpdateStatus: (convId: string, status: Conversation['status']) => Promise<void>;
  onAddUserMessage: (convId: string, text: string) => Promise<void>;
  loading: boolean;
}

export function VibeInbox({
  conversations,
  activeConversation,
  messages,
  onSelectConversation,
  onGenerateReply,
  onSendReply,
  onUpdateStatus,
  onAddUserMessage,
  loading
}: VibeInboxProps) {
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingReplyText, setEditingReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'Unread') return c.unread;
    if (filter === 'Needs Reply') return c.status === 'NEW' || c.status === 'AI_DRAFT';
    if (filter === 'AI Drafts') return c.status === 'AI_DRAFT' || c.status === 'WAITING_APPROVAL';
    if (filter === 'Approved') return c.status === 'APPROVED';
    if (filter === 'Escalated') return c.status === 'ESCALATED';
    if (filter === 'Resolved') return c.status === 'RESOLVED' || c.status === 'SENT';
    return true;
  });

  const handleSelect = (conv: Conversation) => {
    onSelectConversation(conv);
    setEditingReplyText(conv.aiSuggestedReply || '');
    setIsEditing(false);
  };

  const handleSend = async () => {
    if (!activeConversation) return;
    const textToSend = isEditing ? editingReplyText : (activeConversation.aiSuggestedReply || editingReplyText);
    if (!textToSend.trim()) return;
    await onSendReply(activeConversation, textToSend);
    setIsEditing(false);
  };

  const handleSimulateCustomerReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !newMessageText.trim()) return;
    await onAddUserMessage(activeConversation.id, newMessageText);
    setNewMessageText('');
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[600px] bg-[#12141c] border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
      {/* Left Sidebar: Conversations List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-800/80 flex flex-col bg-[#0f1118]">
        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171a24] border border-slate-700/80 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar pb-1 text-[11px] font-mono">
            {['All', 'Needs Reply', 'AI Drafts', 'Escalated', 'Approved', 'Resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition font-bold ${
                  filter === f
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-[#171a24] text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 custom-scrollbar">
          {filteredConversations.map((conv) => {
            const isSelected = activeConversation?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv)}
                className={`p-3.5 cursor-pointer transition flex items-start space-x-3 relative ${
                  isSelected ? 'bg-[#1b1f2e] border-l-4 border-emerald-500' : 'hover:bg-[#151822]'
                }`}
              >
                <div className="relative">
                  <img
                    src={conv.userAvatar || `https://picsum.photos/seed/${conv.username}/80/80`}
                    alt={conv.username}
                    className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                  />
                  <span className={`absolute -bottom-1 -right-1 px-1 py-0.2 text-[8px] font-mono font-bold rounded uppercase text-white bg-slate-900 border border-slate-700`}>
                    {conv.platform.substring(0, 2)}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{conv.username}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 truncate font-sans">
                    {conv.lastMessage}
                  </p>

                  <div className="flex items-center space-x-1.5 pt-0.5">
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                      conv.status === 'ESCALATED' ? 'bg-rose-950/80 text-rose-300 border border-rose-800' :
                      conv.status === 'AI_DRAFT' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                      conv.status === 'SENT' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {conv.status}
                    </span>

                    {conv.aiConfidence && (
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">
                        {Math.round(conv.aiConfidence * 100)}% Match
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No conversations match the current filter.
            </div>
          )}
        </div>
      </div>

      {/* Right Main Panel: Active Conversation */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-[#12141c]">
          {/* Top Bar Details */}
          <div className="p-4 border-b border-slate-800/80 bg-[#171a24] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={activeConversation.userAvatar || `https://picsum.photos/seed/${activeConversation.username}/80/80`}
                alt={activeConversation.username}
                className="w-10 h-10 rounded-full border border-slate-700"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">{activeConversation.username}</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-slate-800 text-emerald-400 rounded border border-slate-700 font-bold">
                    {activeConversation.platform}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Intent: <span className="text-cyan-400">{activeConversation.intent || 'Inquiry'}</span> • Sentiment: <span className={activeConversation.sentiment === 'negative' || activeConversation.sentiment === 'urgent' ? 'text-rose-400' : 'text-emerald-400'}>{activeConversation.sentiment}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onUpdateStatus(activeConversation.id, 'RESOLVED')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg transition"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => onUpdateStatus(activeConversation.id, 'ESCALATED')}
                className="px-3 py-1.5 bg-rose-950/60 text-rose-300 border border-rose-800/80 hover:bg-rose-900/60 text-xs font-mono font-bold rounded-lg transition flex items-center space-x-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Escalate</span>
              </button>
            </div>
          </div>

          {/* Conversation Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-[#0d0f14]">
            {activeConversation.postContext && (
              <div className="p-3 bg-[#171a24] border border-slate-800 rounded-xl text-xs text-slate-400 font-mono flex items-center justify-between">
                <span>📍 Context: {activeConversation.postContext}</span>
                <span className="text-emerald-400">Linked Post</span>
              </div>
            )}

            {/* Render conversation messages */}
            {messages.length > 0 ? (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.isFromUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-lg p-3.5 rounded-2xl text-xs space-y-1 shadow-md ${
                      m.isFromUser
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-[#1b1f2e] text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
                      <span>{m.senderName}</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-start">
                <div className="max-w-lg p-3.5 bg-[#1b1f2e] border border-slate-800 rounded-2xl text-xs text-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
                    <span>{activeConversation.username}</span>
                    <span>{new Date(activeConversation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="leading-relaxed">{activeConversation.lastMessage}</p>
                </div>
              </div>
            )}

            {/* AI Suggested Reply Box */}
            <div className="p-4 bg-[#171a24] border border-emerald-500/40 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Gemini AI Response Engine</span>
                  {activeConversation.aiConfidence && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-800">
                      {Math.round(activeConversation.aiConfidence * 100)}% Confidence
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onGenerateReply(activeConversation)}
                    disabled={loading}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition"
                    title="Regenerate with Gemini"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingReplyText(activeConversation.aiSuggestedReply || '');
                      setIsEditing(!isEditing);
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition"
                    title="Edit Reply Text"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {activeConversation.aiReasoning && (
                <div className="text-[11px] text-slate-400 italic font-mono bg-[#12141c] p-2 rounded-lg border border-slate-800">
                  🧠 AI Strategy: {activeConversation.aiReasoning}
                </div>
              )}

              {isEditing ? (
                <textarea
                  value={editingReplyText}
                  onChange={(e) => setEditingReplyText(e.target.value)}
                  className="w-full bg-[#12141c] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[90px] font-mono"
                  placeholder="Type or edit AI response..."
                />
              ) : (
                <div className="p-3 bg-[#12141c] border border-slate-800/80 rounded-xl text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                  {editingReplyText || activeConversation.aiSuggestedReply || 'Click regenerate to create AI response with Gemini.'}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500 font-mono">
                  {activeConversation.shouldEscalate ? '⚠️ Human Escalation Triggered' : '✓ Safe for Auto-Publishing'}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSend}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Approve & Send Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Test Message Input */}
          <form onSubmit={handleSimulateCustomerReply} className="p-3 bg-[#171a24] border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Simulate customer message..."
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              className="flex-1 bg-[#12141c] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl transition"
            >
              Simulate Message
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-500">
          <MessageSquare className="w-12 h-12 text-slate-700 animate-pulse" />
          <h4 className="text-sm font-bold text-slate-400">Select a Conversation</h4>
          <p className="text-xs max-w-sm">
            Choose a social conversation from the inbox on the left to view messages, inspect Gemini AI suggested replies, or manage escalation.
          </p>
        </div>
      )}
    </div>
  );
}
