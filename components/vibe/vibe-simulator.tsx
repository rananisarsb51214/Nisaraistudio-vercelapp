'use client';

import React, { useState } from 'react';
import { 
  Bot, Sparkles, Send, RotateCw, AlertTriangle, CheckCircle2, ShieldAlert, Cpu 
} from 'lucide-react';
import { SocialPlatform } from '@/lib/vibe/types';

export function VibeSimulator() {
  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [message, setMessage] = useState('Assalam O Alaikum! What is the annual discount price for Nisar AI Studio?');
  const [postContext, setPostContext] = useState('Reel: Vibe Responding Launch');
  const [customBrandVoice, setCustomBrandVoice] = useState('Professional, helpful, warm in Roman Urdu or English.');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/vibe/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          message,
          postContext,
          customBrandVoice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      } else {
        alert(data.error || 'Simulator test failed');
      }
    } catch (err: any) {
      alert(err.message || 'Simulator error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
          <Cpu className="w-4 h-4" />
          <span>Vibe Simulator — Interactive AI Testing Sandbox</span>
        </div>
        <h2 className="text-xl font-black text-white">Vibe Responding Simulator</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Test customer queries live against Gemini 3.5 Flash and inspect generated responses, confidence scores, risk flags, and brand voice rules safely without publishing to real channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Inputs */}
        <form onSubmit={handleTest} className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl space-y-4 shadow-xl text-xs">
          <div>
            <label className="text-slate-300 font-mono font-bold">Select Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono"
            >
              <option value="instagram">Instagram Business</option>
              <option value="facebook">Facebook Page</option>
              <option value="youtube">YouTube Comments</option>
              <option value="tiktok">TikTok Creator</option>
              <option value="linkedin">LinkedIn Page</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-mono font-bold">Customer Input Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              required
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono focus:ring-1 focus:ring-emerald-500"
              placeholder="Type any comment or DM to test..."
            />
          </div>

          <div>
            <label className="text-slate-300 font-mono font-bold">Post Context (Optional)</label>
            <input
              type="text"
              value={postContext}
              onChange={(e) => setPostContext(e.target.value)}
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono"
              placeholder="e.g. Reel: AI Studio launch discount"
            />
          </div>

          <div>
            <label className="text-slate-300 font-mono font-bold">Custom Brand Voice Guidance (Optional)</label>
            <input
              type="text"
              value={customBrandVoice}
              onChange={(e) => setCustomBrandVoice(e.target.value)}
              className="w-full bg-[#171a24] border border-slate-700 rounded-xl p-3 text-white mt-1.5 font-mono"
              placeholder="e.g. Enthusiastic, polite, Roman Urdu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center space-x-2"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            <span>{loading ? 'Running Gemini AI Analysis...' : 'Simulate Gemini AI Reply'}</span>
          </button>
        </form>

        {/* Output Diagnostics */}
        <div className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Gemini AI Simulator Output Diagnostics</span>
            </h3>

            {result ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#171a24] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">STATUS:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      result.shouldEscalate ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {result.shouldEscalate ? 'HUMAN ESCALATION REQUIRED' : 'SAFE FOR AUTOMATION'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Confidence Score:</span>
                    <span className="text-emerald-400 font-bold">{Math.round(result.confidence * 100)}%</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Detected Intent:</span>
                    <span className="text-cyan-400 font-bold">{result.intent}</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Detected Sentiment:</span>
                    <span className="text-amber-400 font-bold">{result.sentiment}</span>
                  </div>

                  {result.detectedLanguage && (
                    <div className="flex justify-between text-slate-300">
                      <span>Detected Language:</span>
                      <span className="text-purple-400 font-bold">{result.detectedLanguage}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#171a24] border border-emerald-500/40 rounded-xl space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">GENERATED AI RESPONSE:</div>
                  <p className="text-slate-100 font-sans text-xs leading-relaxed whitespace-pre-wrap">{result.reply}</p>
                </div>

                <div className="p-3 bg-[#171a24] border border-slate-800 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">REASONING & STRATEGY:</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{result.reason}</p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs font-mono">
                Click "Simulate Gemini AI Reply" to generate live diagnostics.
              </div>
            )}
          </div>

          <div className="p-3 bg-[#171a24] border border-slate-800/80 rounded-xl text-[10px] font-mono text-slate-400">
            ℹ️ Sandbox Note: Simulator uses Gemini 3.5 Flash server-side with strict JSON schema response mode.
          </div>
        </div>
      </div>
    </div>
  );
}
