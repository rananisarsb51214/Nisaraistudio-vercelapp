'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Sparkles, Zap, Search, Coins, RefreshCw, Copy, Check, 
  Download, Star, Trash2, ArrowRight, Clock, ShieldCheck, 
  Sliders, ChevronRight, Layers, FileText, Video, TrendingUp, 
  Briefcase, CheckCircle2, AlertCircle, Share2, CornerDownRight,
  Send, ExternalLink, Bookmark, Cpu, Globe, History, Flame
} from 'lucide-react';
import { AI_TOOL_CATEGORIES, AI_TOOLS_REGISTRY } from '@/lib/ai/schemas';
import { ToolCategory, ToolDefinition, ToolExecutionResponse } from '@/types/ai';
import { UserCredits } from '@/types/credits';
import { GenerationHistoryItem } from '@/types/generation';
import { useAuth } from '../auth-provider';

export function SuperAiToolbox() {
  const { user } = useAuth();
  const userId = user?.uid || 'default_user';

  // Active Navigation State
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('content');
  const [selectedToolId, setSelectedToolId] = useState<string>('social-post');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Parameters State
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');

  // Execution & Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [activeOutput, setActiveOutput] = useState<ToolExecutionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Credits & History State
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'studio' | 'history'>('studio');
  const [historySearch, setHistorySearch] = useState('');
  const [historyFavoritesOnly, setHistoryFavoritesOnly] = useState(false);

  const selectedTool: ToolDefinition = AI_TOOLS_REGISTRY[selectedToolId] || AI_TOOLS_REGISTRY['social-post'];

  // Initialize form defaults whenever selectedTool changes
  useEffect(() => {
    const defaults: Record<string, any> = {};
    selectedTool.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      } else {
        defaults[field.name] = '';
      }
    });
    setParameters(defaults);
    setErrorMessage(null);
  }, [selectedToolId]);

  // Load Credits & History on Mount or User Change
  useEffect(() => {
    fetchCredits();
    fetchHistory();
  }, [userId]);

  const fetchCredits = async () => {
    try {
      const res = await fetch(`/api/ai/credits?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && data.credits) {
        setCredits(data.credits);
      }
    } catch (e) {
      console.warn('Failed to load user credits:', e);
    }
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/ai/history?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && data.history) {
        setHistory(data.history);
      }
    } catch (e) {
      console.warn('Failed to load generation history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleClaimDailyCredits = async () => {
    try {
      const res = await fetch('/api/ai/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: 50, type: 'bonus', description: 'Daily Refill Claimed' }),
      });
      const data = await res.json();
      if (data.success && data.credits) {
        setCredits(data.credits);
      }
    } catch (e) {
      console.error('Error claiming credits:', e);
    }
  };

  const handleParamChange = (fieldName: string, value: any) => {
    setParameters((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleExecuteTool = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationStep('Validating input parameters...');

    try {
      // Step feedback animation
      setTimeout(() => setGenerationStep('Connecting to Google Gemini Engine...'), 400);
      setTimeout(() => setGenerationStep('Generating structured output & applying guardrails...'), 900);

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: selectedTool.id,
          userId,
          parameters,
          model: selectedModel,
          tone: selectedTone,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Generation failed.');
      }

      setActiveOutput(data);
      if (credits) {
        setCredits({ ...credits, balance: data.remainingCredits });
      }
      fetchHistory(); // refresh history list
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during AI execution.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (text: string, title: string, extension: 'md' | 'txt') => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleToggleFavorite = async (historyId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/ai/history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyId, isFavorite: !currentStatus }),
      });
      setHistory((prev) =>
        prev.map((item) => (item.id === historyId ? { ...item, isFavorite: !currentStatus } : item))
      );
    } catch (e) {
      console.error('Error toggling favorite:', e);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    try {
      await fetch(`/api/ai/history?historyId=${encodeURIComponent(historyId)}`, {
        method: 'DELETE',
      });
      setHistory((prev) => prev.filter((item) => item.id !== historyId));
    } catch (e) {
      console.error('Error deleting history:', e);
    }
  };

  // Filter tools for search
  const allTools = Object.values(AI_TOOLS_REGISTRY);
  const filteredTools = allTools.filter((t) => {
    const matchesCategory = searchQuery ? true : t.category === activeCategory;
    const matchesSearch = searchQuery
      ? t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.urduName && t.urduName.includes(searchQuery))
      : true;
    return matchesCategory && matchesSearch;
  });

  const filteredHistory = history.filter((item) => {
    const matchesFavorites = historyFavoritesOnly ? item.isFavorite : true;
    const matchesSearch = historySearch
      ? item.toolName.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.output.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.promptSummary.toLowerCase().includes(historySearch.toLowerCase())
      : true;
    return matchesFavorites && matchesSearch;
  });

  return (
    <div id="super-ai-toolbox-root" className="w-full min-h-screen text-slate-100 pb-16">
      {/* Top Banner / System Ribbon */}
      <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                NISAR AI STUDIO
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Super AI Toolbox V1
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Modular Architecture • Google Gemini 2.5 • Firebase Auth & Firestore Engine
            </p>
          </div>
        </div>

        {/* Credits Status Badge & Action Controls */}
        <div className="flex items-center gap-3">
          <a
            href="https://nisaraistudiovercel-app.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all shadow-sm"
            title="Live NISAR AI Studio Deployment"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Live Vercel App</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <div className="text-xs">
              <span className="text-slate-400">Credits:</span>{' '}
              <strong className="text-amber-300 font-bold text-sm">
                {credits ? credits.balance : '...'}
              </strong>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
              {credits?.tier || 'Pro'}
            </span>
          </div>

          <button
            id="claim-daily-credits-btn"
            onClick={handleClaimDailyCredits}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all shadow-sm active:scale-95"
            title="Claim daily bonus credits"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            +50 Daily Refill
          </button>

          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              id="view-studio-tab-btn"
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'studio'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Toolbox
            </button>
            <button
              id="view-history-tab-btn"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History ({history.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* ================= HISTORY BROWSER TAB ================= */
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                Generation History & Saved Outputs
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                All previous Gemini executions persisted in your private Firestore collection.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search outputs..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => setHistoryFavoritesOnly(!historyFavoritesOnly)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
                  historyFavoritesOnly
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${historyFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
                Favorites Only
              </button>
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading your generation history from Firestore...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
              <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">No Generations Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Execute any of the 30+ AI tools in the Toolbox to see your outputs stored here.
              </p>
              <button
                onClick={() => setActiveTab('studio')}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all"
              >
                Go to AI Toolbox
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold text-white">{item.toolName}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleFavorite(item.id, item.isFavorite)}
                          className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                          title="Favorite"
                        >
                          <Star
                            className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                      <strong>Input:</strong> {item.promptSummary}
                    </p>

                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {item.output}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()} • {item.modelUsed}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(item.output)}
                        className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-all"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          setSelectedToolId(item.toolId);
                          setParameters(item.parameters || {});
                          setActiveOutput({
                            success: true,
                            generationId: item.id,
                            toolId: item.toolId,
                            category: item.category,
                            output: item.output,
                            creditsUsed: item.creditsCost,
                            remainingCredits: credits?.balance || 50,
                            executionTimeMs: item.executionTimeMs,
                            modelUsed: item.modelUsed,
                            timestamp: item.createdAt,
                          });
                          setActiveTab('studio');
                        }}
                        className="px-2.5 py-1 text-xs rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-all"
                      >
                        Open in Runner
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= MAIN TOOLBOX STUDIO ================= */
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          {/* Category Tabs & Tool Search Bar */}
          <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {AI_TOOL_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id && !searchQuery;
                return (
                  <button
                    key={cat.id}
                    id={`category-tab-${cat.id}`}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchQuery('');
                      // select first tool in category
                      const firstInCat = Object.values(AI_TOOLS_REGISTRY).find((t) => t.category === cat.id);
                      if (firstInCat) setSelectedToolId(firstInCat.id);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] opacity-75 font-normal ${isActive ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                      ({Object.values(AI_TOOLS_REGISTRY).filter((t) => t.category === cat.id).length})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-tools-input"
                type="text"
                placeholder="Search 30+ AI tools (e.g. blog, hooks, seo)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Core 2-Column Workstation: Left (Tool Selector & Parameter Form) | Right (Output Canvas) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Tool Browser & Parameter Configuration Form */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Tool Selector Chips Carousel/Grid */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 backdrop-blur">
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {searchQuery ? `Search Results (${filteredTools.length})` : `${AI_TOOL_CATEGORIES.find((c) => c.id === activeCategory)?.label} Tools`}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {filteredTools.length} tools available
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredTools.map((tool) => {
                    const isSelected = selectedTool.id === tool.id;
                    return (
                      <button
                        key={tool.id}
                        id={`tool-select-${tool.id}`}
                        onClick={() => setSelectedToolId(tool.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {tool.name}
                          </span>
                          {tool.badge && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span className="truncate">{tool.urduName || tool.category}</span>
                          <span className="font-semibold text-amber-400 flex items-center gap-0.5">
                            {tool.creditCost} <Coins className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Parameter Input Form */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{selectedTool.name}</h3>
                      {selectedTool.urduName && (
                        <span className="text-xs text-slate-400 font-urdu">{selectedTool.urduName}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedTool.description}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                      <Coins className="w-3.5 h-3.5" /> {selectedTool.creditCost} Credits
                    </span>
                  </div>
                </div>

                {/* Form Fields Generator */}
                <div className="space-y-4">
                  {selectedTool.fields.map((field) => (
                    <div key={field.name} className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                        <span>
                          {field.label} {field.required && <span className="text-rose-400">*</span>}
                        </span>
                        {field.helpText && <span className="text-[10px] text-slate-500">{field.helpText}</span>}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          placeholder={field.placeholder}
                          value={parameters[field.name] || ''}
                          onChange={(e) => handleParamChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-y"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={parameters[field.name] || field.defaultValue || ''}
                          onChange={(e) => handleParamChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={parameters[field.name] || ''}
                          onChange={(e) => handleParamChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                      )}
                    </div>
                  ))}

                  {/* Global Modifiers (Language, Tone, Model) */}
                  <div className="pt-3 mt-3 border-t border-slate-800 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Language
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="English">English (Global)</option>
                        <option value="Urdu">Urdu (اردو)</option>
                        <option value="Roman Urdu">Roman Urdu (Easy Urdu)</option>
                        <option value="Arabic">Arabic (العربية)</option>
                        <option value="Hindi">Hindi (हिन्दी)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Gemini Model
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Fast)</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                      </select>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-300">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Action Execution Button */}
                  <button
                    id="execute-ai-tool-btn"
                    disabled={isGenerating}
                    onClick={handleExecuteTool}
                    className={`w-full mt-2 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isGenerating
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/20 hover:scale-[1.01] active:scale-95'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>{generationStep || 'Executing Tool...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-slate-950" />
                        <span>Generate with Gemini ({selectedTool.creditCost} Credits)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Output Canvas & Export Station */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl min-h-[560px] flex flex-col justify-between">
                {/* Header Toolbar */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h3 className="text-sm font-bold text-white">AI Output Canvas</h3>
                    {activeOutput && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        ⚡ {(activeOutput.executionTimeMs / 1000).toFixed(2)}s • {activeOutput.modelUsed}
                      </span>
                    )}
                  </div>

                  {activeOutput && (
                    <div className="flex items-center gap-1.5">
                      <button
                        id="copy-output-btn"
                        onClick={() => handleCopy(activeOutput.output)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all border border-slate-700"
                        title="Copy to Clipboard"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        id="download-markdown-btn"
                        onClick={() =>
                          handleDownload(activeOutput.output, selectedTool.name, 'md')
                        }
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all border border-slate-700"
                        title="Download Markdown"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>.MD</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 py-4 overflow-y-auto max-h-[640px]">
                  {isGenerating ? (
                    <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-spin">
                          <Cpu className="w-8 h-8 text-emerald-400" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Gemini Super AI Engine Active</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm font-mono">
                          {generationStep || 'Synthesizing output...'}
                        </p>
                      </div>
                    </div>
                  ) : activeOutput ? (
                    <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/90 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap selection:bg-emerald-500 selection:text-slate-950">
                      {activeOutput.output}
                    </div>
                  ) : (
                    <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800/80 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-3 text-slate-500">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-300">Ready to Generate</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">
                        Configure the parameters on the left and hit <strong className="text-emerald-400">Generate with Gemini</strong> to stream high-precision outputs.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                          ✨ 31 Built-in Tools
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                          🔒 Server-Side Key Security
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                          ⚡ Firestore Persisted History
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Status */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>NISAR AI STUDIO Engine • Architecture V1</span>
                  <span>Google Cloud + Gemini 2.5 + Firestore</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
