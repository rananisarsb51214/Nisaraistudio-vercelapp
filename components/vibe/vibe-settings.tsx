'use client';

import React, { useState } from 'react';
import { 
  Sliders, ShieldCheck, Bell, Zap, Save, CheckCircle2 
} from 'lucide-react';
import { VibeSettings } from '@/lib/vibe/types';

interface VibeSettingsProps {
  settings: VibeSettings;
  onSaveSettings: (settings: Partial<VibeSettings>) => Promise<void>;
  loading: boolean;
}

export function VibeSettingsView({ settings, onSaveSettings, loading }: VibeSettingsProps) {
  const [formData, setFormData] = useState<VibeSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
          <Sliders className="w-4 h-4" />
          <span>System & Global Automation Threshold Configuration</span>
        </div>
        <h2 className="text-xl font-black text-white">Vibe Responding Global Settings</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Configure default automation modes, confidence thresholds, rate limits, escalation rules, and admin notification dispatch.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl space-y-6 shadow-xl text-xs">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Automation Mode & Status</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-mono font-bold">Automation Status</label>
              <select
                value={formData.automationStatus}
                onChange={(e) => setFormData({ ...formData, automationStatus: e.target.value as any })}
                className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono"
              >
                <option value="ONLINE">ONLINE (Active Engine)</option>
                <option value="PAUSED">PAUSED (Manual Only)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-mono font-bold">Execution Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono"
              >
                <option value="AUTO">AUTO (Fully Automated)</option>
                <option value="APPROVAL">APPROVAL (Human Approves All)</option>
                <option value="HYBRID">HYBRID (Confidence Threshold Based)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-mono font-bold">
              <span>Confidence Threshold ({Math.round(formData.confidenceThreshold * 100)}%)</span>
            </div>
            <input
              type="range"
              min="50"
              max="98"
              value={Math.round(formData.confidenceThreshold * 100)}
              onChange={(e) => setFormData({ ...formData, confidenceThreshold: Number(e.target.value) / 100 })}
              className="w-full accent-emerald-500 cursor-pointer mt-2"
            />
          </div>

          <div>
            <label className="text-slate-300 font-mono font-bold">Max Replies Per Day</label>
            <input
              type="number"
              value={formData.maxRepliesPerDay}
              onChange={(e) => setFormData({ ...formData, maxRepliesPerDay: Number(e.target.value) })}
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Safety & Notifications</h3>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={formData.autoEscalateNegative}
                onChange={(e) => setFormData({ ...formData, autoEscalateNegative: e.target.checked })}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Automatically escalate negative sentiment or payment disputes</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={formData.notifyOnEscalation}
                onChange={(e) => setFormData({ ...formData, notifyOnEscalation: e.target.checked })}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Send in-dashboard notifications on human escalation triggers</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={formData.notifyOnFailure}
                onChange={(e) => setFormData({ ...formData, notifyOnFailure: e.target.checked })}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Notify when social API access tokens expire or fail</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Global Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
