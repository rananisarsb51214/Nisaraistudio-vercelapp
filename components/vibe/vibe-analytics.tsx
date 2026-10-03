'use client';

import React from 'react';
import { 
  TrendingUp, BarChart3, PieChart, Activity, CheckCircle2, AlertTriangle, ShieldCheck, Zap 
} from 'lucide-react';

interface VibeAnalyticsProps {
  metrics: any;
}

export function VibeAnalytics({ metrics }: VibeAnalyticsProps) {
  const m = metrics || {
    totalConversations: 18,
    aiRepliesGenerated: 15,
    sentReplies: 12,
    pendingReplies: 4,
    escalatedReplies: 2,
    responseRate: 94,
    automationRate: 82,
    avgResponseTime: '4.2s',
    approvalRate: 92,
    sentimentDistribution: { positive: 65, neutral: 25, negative: 8, urgent: 2 },
    platformBreakdown: [
      { platform: 'Instagram', count: 8, percentage: 44 },
      { platform: 'Facebook', count: 5, percentage: 28 },
      { platform: 'YouTube', count: 3, percentage: 17 },
      { platform: 'TikTok', count: 2, percentage: 11 },
    ],
    topKeywords: ['price', 'discount', 'features', 'package', 'access', 'setup'],
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
          <BarChart3 className="w-4 h-4" />
          <span>Vibe Responding Performance & Social Analytics</span>
        </div>
        <h2 className="text-xl font-black text-white">Social Media Automation Analytics</h2>
        <p className="text-xs text-slate-400 max-w-xl">
          Comprehensive statistics on AI response accuracy, escalation rates, sentiment trends, response speed, and platform engagement.
        </p>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-[#12141c] border border-slate-800/80 rounded-2xl space-y-2">
          <span className="text-xs font-mono text-slate-400">Total Conversations</span>
          <div className="text-3xl font-black text-white">{m.totalConversations}</div>
          <span className="text-[10px] text-emerald-400 font-mono">100% Processed</span>
        </div>

        <div className="p-5 bg-[#12141c] border border-slate-800/80 rounded-2xl space-y-2">
          <span className="text-xs font-mono text-slate-400">AI Automation Rate</span>
          <div className="text-3xl font-black text-emerald-400">{m.automationRate}%</div>
          <span className="text-[10px] text-emerald-400 font-mono">Fully Automated</span>
        </div>

        <div className="p-5 bg-[#12141c] border border-slate-800/80 rounded-2xl space-y-2">
          <span className="text-xs font-mono text-slate-400">Human Approval Rate</span>
          <div className="text-3xl font-black text-cyan-400">{m.approvalRate}%</div>
          <span className="text-[10px] text-cyan-400 font-mono">High Quality Match</span>
        </div>

        <div className="p-5 bg-[#12141c] border border-slate-800/80 rounded-2xl space-y-2">
          <span className="text-xs font-mono text-slate-400">Average Speed</span>
          <div className="text-3xl font-black text-yellow-400">{m.avgResponseTime}</div>
          <span className="text-[10px] text-yellow-400 font-mono">Gemini 3.5 Flash</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <div className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Customer Sentiment Breakdown</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Positive Sentiment</span>
                <span className="text-emerald-400">{m.sentimentDistribution.positive}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${m.sentimentDistribution.positive}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Neutral Sentiment</span>
                <span className="text-cyan-400">{m.sentimentDistribution.neutral}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${m.sentimentDistribution.neutral}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Negative Sentiment</span>
                <span className="text-amber-400">{m.sentimentDistribution.negative}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${m.sentimentDistribution.negative}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Urgent / Legal / Risk</span>
                <span className="text-rose-400">{m.sentimentDistribution.urgent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${m.sentimentDistribution.urgent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Platform Volume Distribution</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {m.platformBreakdown.map((item: any) => (
              <div key={item.platform}>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{item.platform}</span>
                  <span className="text-emerald-400">{item.count} conv ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
