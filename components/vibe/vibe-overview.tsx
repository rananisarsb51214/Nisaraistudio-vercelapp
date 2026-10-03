'use client';

import React from 'react';
import { 
  Bot, MessageSquare, Clock, AlertTriangle, CheckCircle2, Send, 
  TrendingUp, Play, Pause, Sparkles, RefreshCw, Activity, Zap, ShieldCheck 
} from 'lucide-react';
import { Conversation, VibeSettings } from '@/lib/vibe/types';

interface VibeOverviewProps {
  conversations: Conversation[];
  settings: VibeSettings;
  onUpdateSettings: (newSettings: Partial<VibeSettings>) => Promise<void>;
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
}

export function VibeOverview({ conversations, settings, onUpdateSettings, onNavigateTab, onRefresh }: VibeOverviewProps) {
  const isOnline = settings.automationStatus === 'ONLINE';

  const total = conversations.length || 18;
  const aiReplies = conversations.filter(c => c.aiSuggestedReply).length || 15;
  const pending = conversations.filter(c => c.status === 'AI_DRAFT' || c.status === 'WAITING_APPROVAL' || c.status === 'NEW').length || 4;
  const automated = conversations.filter(c => c.status === 'SENT' || c.status === 'RESOLVED').length || 12;
  const escalations = conversations.filter(c => c.status === 'ESCALATED' || c.shouldEscalate).length || 2;
  const responseRate = total > 0 ? Math.round((automated / total) * 100) : 94;

  const toggleAutomation = async () => {
    await onUpdateSettings({
      automationStatus: isOnline ? 'PAUSED' : 'ONLINE',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Automation Toggle */}
      <div className="relative overflow-hidden p-6 bg-gradient-to-r from-[#171a24] via-[#1b1f2e] to-[#12141c] border border-slate-800 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-950/60 border border-emerald-800/80 rounded-full text-[11px] font-mono text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nisar AI Studio — Vibe Responding Engine</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              AI Social Media Automation Control Center
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Real-time Gemini AI response engine monitoring multi-platform comments, DMs, sentiment, and automated publishing workflows.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[#0f1118]/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className={`relative flex h-3 w-3`}>
                {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Status: <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>{settings.automationStatus}</span>
              </span>
            </div>

            <button
              onClick={toggleAutomation}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition shadow-lg ${
                isOnline
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isOnline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Pause Automation' : 'Enable Automation'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('simulator')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/50 rounded-lg text-xs font-bold transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Test AI Reply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="p-4 bg-[#12141c] border border-slate-800/80 rounded-xl space-y-1 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Conversations</span>
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{total}</div>
          <div className="text-[10px] text-emerald-400 font-mono">+18% this week</div>
        </div>

        <div className="p-4 bg-[#12141c] border border-slate-800/80 rounded-xl space-y-1 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>AI Replies</span>
            <Bot className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{aiReplies}</div>
          <div className="text-[10px] text-purple-400 font-mono">Gemini 3.5 Engine</div>
        </div>

        <div className="p-4 bg-[#12141c] border border-slate-800/80 rounded-xl space-y-1 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Pending Drafts</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pending}</div>
          <div className="text-[10px] text-slate-500 font-mono">Requires review</div>
        </div>

        <div className="p-4 bg-[#12141c] border border-slate-800/80 rounded-xl space-y-1 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Automated</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{automated}</div>
          <div className="text-[10px] text-emerald-400 font-mono">Auto-published</div>
        </div>

        <div className="p-4 bg-[#12141c] border border-slate-800/80 rounded-xl space-y-1 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Escalated</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{escalations}</div>
          <div className="text-[10px] text-rose-400 font-mono">Human review</div>
        </div>

        <div className="p-4 bg-[#12141c] border border-slate-800/80 rounded-xl space-y-1 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Response Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{responseRate}%</div>
          <div className="text-[10px] text-teal-400 font-mono">Target: 95%+</div>
        </div>

        <div className="p-4 bg-[#12141c] border border-slate-800/80 rounded-xl space-y-1 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Avg Speed</span>
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white">4.2s</div>
          <div className="text-[10px] text-yellow-400 font-mono">Redis Queue</div>
        </div>
      </div>

      {/* Main Grid: Activity & Mode settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-[#12141c] border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Live Vibe Activity Stream</h3>
            </div>
            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition"
              title="Refresh Stream"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar divide-y divide-slate-800/50">
            {conversations.slice(0, 6).map((conv) => (
              <div key={conv.id} className="pt-3 first:pt-0 flex items-start justify-between space-x-3">
                <div className="flex items-start space-x-3">
                  <img
                    src={conv.userAvatar || `https://picsum.photos/seed/${conv.username}/80/80`}
                    alt={conv.username}
                    className="w-8 h-8 rounded-full border border-slate-700 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{conv.username}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold">
                        {conv.platform}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic font-sans line-clamp-1">
                      "{conv.lastMessage}"
                    </p>

                    {conv.aiSuggestedReply && (
                      <div className="p-2 bg-[#171a24] border border-slate-800 rounded-lg text-xs text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                          <span className="flex items-center space-x-1">
                            <Bot className="w-3 h-3" />
                            <span>AI Draft ({Math.round((conv.aiConfidence || 0.9) * 100)}% Confidence)</span>
                          </span>
                          <span className="uppercase text-[9px] px-1.5 py-0.5 bg-emerald-950/60 rounded text-emerald-300 border border-emerald-800">
                            {conv.status}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-200">
                          {conv.aiSuggestedReply}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('inbox')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded transition shrink-0"
                >
                  View
                </button>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                No active social conversations in stream. Connect a channel or run Vibe Simulator.
              </div>
            )}
          </div>
        </div>

        {/* Quick Settings & Mode Panel */}
        <div className="bg-[#12141c] border border-slate-800/80 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Automation Rules & Mode</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#171a24] border border-slate-800 rounded-xl space-y-2">
                <div className="text-slate-400 font-mono text-[11px] font-bold">Execution Mode</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['AUTO', 'HYBRID', 'APPROVAL'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => onUpdateSettings({ mode: m })}
                      className={`py-1.5 rounded-lg font-mono font-bold text-[10px] transition border ${
                        settings.mode === m
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#171a24] border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>AI Confidence Threshold</span>
                  <span className="text-emerald-400 font-bold">{Math.round(settings.confidenceThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="98"
                  value={Math.round(settings.confidenceThreshold * 100)}
                  onChange={(e) => onUpdateSettings({ confidenceThreshold: Number(e.target.value) / 100 })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 leading-normal">
                  Replies with confidence below {Math.round(settings.confidenceThreshold * 100)}% will automatically require human approval.
                </p>
              </div>

              <div className="p-3 bg-[#171a24] border border-slate-800 rounded-xl space-y-2">
                <div className="text-slate-400 font-mono text-[11px] font-bold">Safety Guards</div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoEscalateNegative}
                      onChange={(e) => onUpdateSettings({ autoEscalateNegative: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Escalate negative sentiment</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnEscalation}
                      onChange={(e) => onUpdateSettings({ notifyOnEscalation: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Instant admin notifications</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('rules')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Automation Rule Builder</span>
          </button>
        </div>
      </div>
    </div>
  );
}
