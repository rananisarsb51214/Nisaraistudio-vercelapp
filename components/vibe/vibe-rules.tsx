'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit, Shield, Check, Sliders, Zap, AlertTriangle 
} from 'lucide-react';
import { AutomationRule, SocialPlatform } from '@/lib/vibe/types';

interface VibeRulesProps {
  rules: AutomationRule[];
  onSaveRule: (rule: Partial<AutomationRule>) => Promise<void>;
  onDeleteRule: (ruleId: string) => Promise<void>;
}

export function VibeRules({ rules, onSaveRule, onDeleteRule }: VibeRulesProps) {
  const [editingRule, setEditingRule] = useState<Partial<AutomationRule> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenNew = () => {
    setEditingRule({
      name: 'New Custom Automation Rule',
      enabled: true,
      platforms: ['instagram', 'facebook'],
      triggers: {
        event: 'NEW_COMMENT',
        keywords: [],
        minConfidence: 0.85,
      },
      actions: {
        type: 'GENERATE_REPLY',
      }
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingRule || !editingRule.name) return;
    await onSaveRule(editingRule);
    setIsModalOpen(false);
    setEditingRule(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
            <Zap className="w-4 h-4" />
            <span>Visual Automation Logic Engine</span>
          </div>
          <h2 className="text-xl font-black text-white">Automation Rules Builder</h2>
          <p className="text-xs text-slate-400">
            Define automated triggers, keywords, sentiment filters, confidence thresholds, and actions for incoming social media messages.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Rule</span>
        </button>
      </div>

      {/* Rules List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 bg-[#12141c] border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl space-y-4 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[180px]">{rule.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  rule.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                }`}>
                  {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              {/* Platforms */}
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-slate-500 font-mono">Platforms:</span>
                <div className="flex flex-wrap gap-1">
                  {rule.platforms.map((p) => (
                    <span key={p} className="px-1.5 py-0.5 bg-[#171a24] border border-slate-800 text-slate-300 text-[9px] font-mono rounded capitalize">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Triggers */}
              <div className="p-3 bg-[#171a24] border border-slate-800/80 rounded-xl space-y-1.5 text-xs text-slate-300 font-mono">
                <div className="text-[10px] text-slate-500 uppercase font-bold">WHEN / IF:</div>
                <div>⚡ Event: <span className="text-emerald-400">{rule.triggers.event}</span></div>
                {rule.triggers.keywords && rule.triggers.keywords.length > 0 && (
                  <div>🔑 Keywords: <span className="text-cyan-400">{rule.triggers.keywords.join(', ')}</span></div>
                )}
                {rule.triggers.minConfidence && (
                  <div>🎯 Min Confidence: <span className="text-amber-400">{Math.round(rule.triggers.minConfidence * 100)}%</span></div>
                )}
              </div>

              {/* Action */}
              <div className="p-3 bg-[#171a24] border border-slate-800/80 rounded-xl space-y-1.5 text-xs text-slate-300 font-mono">
                <div className="text-[10px] text-slate-500 uppercase font-bold">THEN ACTION:</div>
                <div className="text-emerald-400 font-bold">🚀 {rule.actions.type}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <button
                onClick={() => {
                  setEditingRule(rule);
                  setIsModalOpen(true);
                }}
                className="text-xs text-slate-400 hover:text-emerald-400 font-mono flex items-center space-x-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Rule</span>
              </button>

              <button
                onClick={() => onDeleteRule(rule.id)}
                className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Rule Editing */}
      {isModalOpen && editingRule && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingRule.id ? 'Edit Automation Rule' : 'Create Automation Rule'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-mono">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-2.5 text-white mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono">Trigger Event</label>
                <select
                  value={editingRule.triggers?.event || 'NEW_COMMENT'}
                  onChange={(e) => setEditingRule({
                    ...editingRule,
                    triggers: { ...editingRule.triggers!, event: e.target.value as any }
                  })}
                  className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-2.5 text-white mt-1 font-mono"
                >
                  <option value="NEW_COMMENT">NEW_COMMENT</option>
                  <option value="NEW_DM">NEW_DM</option>
                  <option value="MENTION">MENTION</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-mono">Trigger Keywords (comma separated)</label>
                <input
                  type="text"
                  placeholder="price, cost, refund, info"
                  value={(editingRule.triggers?.keywords || []).join(', ')}
                  onChange={(e) => setEditingRule({
                    ...editingRule,
                    triggers: {
                      ...editingRule.triggers!,
                      keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-2.5 text-white mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono">Action Type</label>
                <select
                  value={editingRule.actions?.type || 'GENERATE_REPLY'}
                  onChange={(e) => setEditingRule({
                    ...editingRule,
                    actions: { ...editingRule.actions!, type: e.target.value as any }
                  })}
                  className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-2.5 text-white mt-1 font-mono"
                >
                  <option value="GENERATE_REPLY">GENERATE_REPLY (Create Draft)</option>
                  <option value="AUTO_SEND">AUTO_SEND (Auto Publish)</option>
                  <option value="ESCALATE">ESCALATE (Flag for Human Review)</option>
                  <option value="ADD_TAG">ADD_TAG (Categorize)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-mono rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 shadow-lg"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
