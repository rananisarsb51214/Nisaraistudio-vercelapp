'use client';

import React, { useState } from 'react';
import { 
  Share2, CheckCircle2, AlertCircle, RefreshCw, Unlink, Link2, ShieldCheck, ExternalLink 
} from 'lucide-react';
import { SocialAccount, SocialPlatform } from '@/lib/vibe/types';

interface VibeAccountsProps {
  accounts: SocialAccount[];
  onConnectAccount: (platform: SocialPlatform) => Promise<void>;
  onTestConnection: (accountId: string) => Promise<void>;
  onDisconnectAccount: (accountId: string) => Promise<void>;
  loading: boolean;
}

const ALL_PLATFORMS: Array<{ id: SocialPlatform; name: string; iconBg: string; desc: string }> = [
  { id: 'instagram', name: 'Instagram Business', iconBg: 'from-purple-600 to-pink-600', desc: 'Direct messages, Reel comments & story interactions.' },
  { id: 'facebook', name: 'Facebook Pages', iconBg: 'from-blue-600 to-indigo-600', desc: 'Page inbox messages, post comments & ad responses.' },
  { id: 'youtube', name: 'YouTube Channel', iconBg: 'from-red-600 to-rose-600', desc: 'Video comments, community posts & short replies.' },
  { id: 'tiktok', name: 'TikTok Creator', iconBg: 'from-slate-900 to-slate-700', desc: 'TikTok video comments & direct messaging.' },
  { id: 'linkedin', name: 'LinkedIn Company', iconBg: 'from-cyan-600 to-blue-700', desc: 'Organization posts, articles & lead messages.' },
];

export function VibeAccounts({ accounts, onConnectAccount, onTestConnection, onDisconnectAccount, loading }: VibeAccountsProps) {
  const [testResultMsg, setTestResultMsg] = useState<string | null>(null);

  const handleTest = async (accountId: string) => {
    setTestResultMsg(null);
    await onTestConnection(accountId);
    setTestResultMsg(`Tested account ${accountId}: Connection Active.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
          <Share2 className="w-4 h-4" />
          <span>Connected Channels & Social Media OAuth API Gateways</span>
        </div>
        <h2 className="text-xl font-black text-white">Social Media Accounts & Connections</h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Connect your official Facebook Pages, Instagram Business, YouTube Channels, TikTok Creators, and LinkedIn Pages using official API OAuth flows.
        </p>
      </div>

      {testResultMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{testResultMsg}</span>
        </div>
      )}

      {/* Grid of Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ALL_PLATFORMS.map((platformInfo) => {
          const connectedAccount = accounts.find(a => a.platform === platformInfo.id && a.status === 'CONNECTED');

          return (
            <div
              key={platformInfo.id}
              className="p-5 bg-[#12141c] border border-slate-800/80 hover:border-slate-700 rounded-2xl space-y-4 flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${platformInfo.iconBg} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {platformInfo.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{platformInfo.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">Official API</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    connectedAccount ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {connectedAccount ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {platformInfo.desc}
                </p>

                {connectedAccount && (
                  <div className="p-3 bg-[#171a24] border border-slate-800 rounded-xl space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-300 font-bold">
                      <span>Account:</span>
                      <span className="text-emerald-400">{connectedAccount.accountName}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Last Sync:</span>
                      <span>{new Date(connectedAccount.lastSyncAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                {connectedAccount ? (
                  <div className="flex items-center space-x-2 w-full justify-between">
                    <button
                      onClick={() => handleTest(connectedAccount.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition"
                    >
                      Test Connection
                    </button>
                    <button
                      onClick={() => onDisconnectAccount(connectedAccount.id)}
                      className="px-3 py-1.5 bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 text-xs font-mono rounded-lg transition flex items-center space-x-1"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onConnectAccount(platformInfo.id)}
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Connect {platformInfo.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
