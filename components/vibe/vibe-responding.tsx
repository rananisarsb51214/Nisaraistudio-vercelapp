'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, MessageSquare, Sliders, Share2, Database, Sparkles, BarChart3, Cpu, Settings, RefreshCw 
} from 'lucide-react';

import { VibeOverview } from './vibe-overview';
import { VibeInbox } from './vibe-inbox';
import { VibeRules } from './vibe-rules';
import { VibeAccounts } from './vibe-accounts';
import { VibeQueue } from './vibe-queue';
import { VibeBrand } from './vibe-brand';
import { VibeAnalytics } from './vibe-analytics';
import { VibeSimulator } from './vibe-simulator';
import { VibeSettingsView } from './vibe-settings';

import { 
  Conversation, ConversationMessage, SocialAccount, AutomationRule, 
  BrandProfile, ContentQueueJob, VibeSettings, SocialPlatform 
} from '@/lib/vibe/types';

export function VibeResponding() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(false);

  // States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [jobs, setJobs] = useState<ContentQueueJob[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [settings, setSettings] = useState<VibeSettings>({
    userId: 'demo_user',
    automationStatus: 'ONLINE',
    mode: 'HYBRID',
    confidenceThreshold: 0.85,
    autoEscalateNegative: true,
    notifyOnEscalation: true,
    notifyOnFailure: true,
    maxRepliesPerDay: 500,
    updatedAt: new Date().toISOString(),
  });

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/vibe/inbox');
      const data = await res.json();
      if (data.success && data.conversations) {
        setConversations(data.conversations);
        if (!activeConversation && data.conversations.length > 0) {
          setActiveConversation(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error('[VibeResponding] fetchConversations error:', err);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/vibe/inbox?conversationId=${convId}`);
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('[VibeResponding] fetchMessages error:', err);
    }
  };

  // Fetch connected accounts
  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/vibe/accounts');
      const data = await res.json();
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error('[VibeResponding] fetchAccounts error:', err);
    }
  };

  // Fetch automation rules
  const fetchRules = async () => {
    try {
      const res = await fetch('/api/vibe/rules');
      const data = await res.json();
      if (data.success && data.rules) {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('[VibeResponding] fetchRules error:', err);
    }
  };

  // Fetch brand profile
  const fetchBrandProfile = async () => {
    try {
      const res = await fetch('/api/vibe/brand');
      const data = await res.json();
      if (data.success && data.profile) {
        setBrandProfile(data.profile);
      }
    } catch (err) {
      console.error('[VibeResponding] fetchBrandProfile error:', err);
    }
  };

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/vibe/jobs');
      const data = await res.json();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error('[VibeResponding] fetchJobs error:', err);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/vibe/analytics');
      const data = await res.json();
      if (data.success && data.metrics) {
        setAnalytics(data.metrics);
      }
    } catch (err) {
      console.error('[VibeResponding] fetchAnalytics error:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchAccounts();
    fetchRules();
    fetchBrandProfile();
    fetchJobs();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation?.id]);

  // Actions
  const handleGenerateReply = async (conv: Conversation) => {
    setLoading(true);
    try {
      const res = await fetch('/api/vibe/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conv.id,
          platform: conv.platform,
          message: conv.lastMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchConversations();
      }
    } catch (err) {
      console.error('[handleGenerateReply]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (conv: Conversation, replyText: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/vibe/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conv.id,
          platform: conv.platform,
          accountId: conv.accountId,
          replyText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchConversations();
        await fetchMessages(conv.id);
        await fetchJobs();
      } else {
        alert(data.error || 'Failed to send reply');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending reply');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (convId: string, status: Conversation['status']) => {
    try {
      await fetch('/api/vibe/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', conversationId: convId, status }),
      });
      await fetchConversations();
    } catch (err) {
      console.error('[handleUpdateStatus]', err);
    }
  };

  const handleAddUserMessage = async (convId: string, text: string) => {
    try {
      await fetch('/api/vibe/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_user_message', conversationId: convId, messageText: text }),
      });
      await fetchConversations();
      await fetchMessages(convId);
    } catch (err) {
      console.error('[handleAddUserMessage]', err);
    }
  };

  const handleConnectAccount = async (platform: SocialPlatform) => {
    setLoading(true);
    try {
      const res = await fetch('/api/vibe/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect', platform }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAccounts();
      }
    } catch (err) {
      console.error('[handleConnectAccount]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (accountId: string) => {
    try {
      await fetch('/api/vibe/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', accountId }),
      });
      await fetchAccounts();
    } catch (err) {
      console.error('[handleTestConnection]', err);
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      await fetch(`/api/vibe/accounts?id=${accountId}`, { method: 'DELETE' });
      await fetchAccounts();
    } catch (err) {
      console.error('[handleDisconnectAccount]', err);
    }
  };

  const handleSaveRule = async (rule: Partial<AutomationRule>) => {
    try {
      await fetch('/api/vibe/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      await fetchRules();
    } catch (err) {
      console.error('[handleSaveRule]', err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await fetch(`/api/vibe/rules?id=${ruleId}`, { method: 'DELETE' });
      await fetchRules();
    } catch (err) {
      console.error('[handleDeleteRule]', err);
    }
  };

  const handleSaveBrandProfile = async (profile: Partial<BrandProfile>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/vibe/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setBrandProfile(data.profile);
      }
    } catch (err) {
      console.error('[handleSaveBrandProfile]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReprocessJob = async (jobId: string) => {
    try {
      await fetch('/api/vibe/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reprocess', jobId }),
      });
      await fetchJobs();
    } catch (err) {
      console.error('[handleReprocessJob]', err);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await fetch('/api/vibe/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', jobId }),
      });
      await fetchJobs();
    } catch (err) {
      console.error('[handleCancelJob]', err);
    }
  };

  const SUB_NAV_TABS = [
    { id: 'overview', label: 'Overview', icon: Bot },
    { id: 'inbox', label: 'Unified Inbox', icon: MessageSquare },
    { id: 'rules', label: 'Automation Rules', icon: Sliders },
    { id: 'accounts', label: 'Social Accounts', icon: Share2 },
    { id: 'queue', label: 'Content Queue', icon: Database },
    { id: 'brand', label: 'Brand Voice', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'simulator', label: 'Vibe Simulator', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar p-1.5 bg-[#12141c] border border-slate-800/80 rounded-2xl shadow-lg text-xs font-mono">
        {SUB_NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition font-bold shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active View */}
      {activeTab === 'overview' && (
        <VibeOverview
          conversations={conversations}
          settings={settings}
          onUpdateSettings={async (s) => setSettings({ ...settings, ...s })}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onRefresh={fetchConversations}
        />
      )}

      {activeTab === 'inbox' && (
        <VibeInbox
          conversations={conversations}
          activeConversation={activeConversation}
          messages={messages}
          onSelectConversation={(c) => setActiveConversation(c)}
          onGenerateReply={handleGenerateReply}
          onSendReply={handleSendReply}
          onUpdateStatus={handleUpdateStatus}
          onAddUserMessage={handleAddUserMessage}
          loading={loading}
        />
      )}

      {activeTab === 'rules' && (
        <VibeRules
          rules={rules}
          onSaveRule={handleSaveRule}
          onDeleteRule={handleDeleteRule}
        />
      )}

      {activeTab === 'accounts' && (
        <VibeAccounts
          accounts={accounts}
          onConnectAccount={handleConnectAccount}
          onTestConnection={handleTestConnection}
          onDisconnectAccount={handleDisconnectAccount}
          loading={loading}
        />
      )}

      {activeTab === 'queue' && (
        <VibeQueue
          jobs={jobs}
          onRefreshJobs={fetchJobs}
          onReprocessJob={handleReprocessJob}
          onCancelJob={handleCancelJob}
        />
      )}

      {activeTab === 'brand' && (
        <VibeBrand
          brandProfile={brandProfile}
          onSaveBrandProfile={handleSaveBrandProfile}
          loading={loading}
        />
      )}

      {activeTab === 'analytics' && (
        <VibeAnalytics metrics={analytics} />
      )}

      {activeTab === 'simulator' && (
        <VibeSimulator />
      )}

      {activeTab === 'settings' && (
        <VibeSettingsView
          settings={settings}
          onSaveSettings={async (s) => setSettings({ ...settings, ...s })}
          loading={loading}
        />
      )}
    </div>
  );
}
