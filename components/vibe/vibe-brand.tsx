'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Save, Languages, ShieldAlert, MessageSquare, CheckCircle2 
} from 'lucide-react';
import { BrandProfile, BrandVoiceStyle } from '@/lib/vibe/types';

interface VibeBrandProps {
  brandProfile: BrandProfile | null;
  onSaveBrandProfile: (profile: Partial<BrandProfile>) => Promise<void>;
  loading: boolean;
}

const VOICE_STYLES: BrandVoiceStyle[] = [
  'Professional', 'Friendly', 'Casual', 'Expert', 'Minimal', 'Funny', 'Premium', 'Custom'
];

export function VibeBrand({ brandProfile, onSaveBrandProfile, loading }: VibeBrandProps) {
  const [formData, setFormData] = useState<Partial<BrandProfile>>(brandProfile || {
    brandName: 'Nisar AI Studio',
    style: 'Friendly',
    customDescription: 'A modern, empowering, and helpful AI SaaS platform guiding creators.',
    primaryLanguage: 'English',
    allowedLanguages: ['English', 'Urdu', 'Roman Urdu', 'Hindi', 'Arabic'],
    responseLength: 'medium',
    emojiUsage: 'minimal',
    formality: 'balanced',
    callToActionStyle: 'Soft invitation to learn more about Nisar AI Studio features',
    forbiddenWords: ['cheap', 'guarantee 100%', 'free forever'],
    requiredPhrases: ['Nisar AI Studio'],
    businessInfo: 'Nisar AI Studio Super AI Toolbox offers complete full-stack AI website building, social media automation, content generation, and multi-agent workflows.',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveBrandProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Brand Voice & Personality Customization Engine</span>
        </div>
        <h2 className="text-xl font-black text-white">Brand Voice & AI Persona Setup</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Configure how Gemini AI models reflect your company tone, language preferences, formality, prohibited words, and business context across all social channels.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Brand Profile & Voice settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl space-y-6 shadow-xl text-xs">
        {/* Brand Name & Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-300 font-mono font-bold">Brand / Company Name</label>
            <input
              type="text"
              value={formData.brandName || ''}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 font-mono font-bold">Primary Brand Voice Style</label>
            <select
              value={formData.style || 'Friendly'}
              onChange={(e) => setFormData({ ...formData, style: e.target.value as any })}
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono focus:ring-1 focus:ring-emerald-500"
            >
              {VOICE_STYLES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Persona Description */}
        <div>
          <label className="text-slate-300 font-mono font-bold">Custom Persona Description</label>
          <textarea
            value={formData.customDescription || ''}
            onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
            rows={3}
            placeholder="Describe how your brand should communicate with customers on social media..."
            className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed"
          />
        </div>

        {/* Business Knowledge Context */}
        <div>
          <label className="text-slate-300 font-mono font-bold">Business Context & Knowledge Base</label>
          <textarea
            value={formData.businessInfo || ''}
            onChange={(e) => setFormData({ ...formData, businessInfo: e.target.value })}
            rows={3}
            placeholder="Key products, services, contact info, pricing model, operating hours..."
            className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed"
          />
        </div>

        {/* Formality, Length, Emoji */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-slate-300 font-mono font-bold">Formality Level</label>
            <select
              value={formData.formality || 'balanced'}
              onChange={(e) => setFormData({ ...formData, formality: e.target.value as any })}
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono"
            >
              <option value="casual">Casual & Relaxed</option>
              <option value="balanced">Balanced & Professional</option>
              <option value="formal">Formal & Corporate</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-mono font-bold">Response Length</label>
            <select
              value={formData.responseLength || 'medium'}
              onChange={(e) => setFormData({ ...formData, responseLength: e.target.value as any })}
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono"
            >
              <option value="short">Short & Punchy (1-2 sentences)</option>
              <option value="medium">Medium (2-3 sentences)</option>
              <option value="detailed">Detailed & Comprehensive</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-mono font-bold">Emoji Usage</label>
            <select
              value={formData.emojiUsage || 'minimal'}
              onChange={(e) => setFormData({ ...formData, emojiUsage: e.target.value as any })}
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono"
            >
              <option value="none">None</option>
              <option value="minimal">Minimal (1-2 emojis)</option>
              <option value="frequent">Frequent (Expressive)</option>
            </select>
          </div>
        </div>

        {/* Forbidden Words & Required Phrases */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-300 font-mono font-bold">Forbidden Words (comma separated)</label>
            <input
              type="text"
              value={(formData.forbiddenWords || []).join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                forbiddenWords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="cheap, free, guarantee"
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5"
            />
          </div>

          <div>
            <label className="text-slate-300 font-mono font-bold">Required Phrases (comma separated)</label>
            <input
              type="text"
              value={(formData.requiredPhrases || []).join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                requiredPhrases: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="Nisar AI Studio"
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Brand Voice Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
