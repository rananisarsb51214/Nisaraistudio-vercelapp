'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Sparkles, BookOpen, Zap, Bot, Brain, Globe, Calendar, 
  Layers, Layout, Activity, Plus, Trash2, ArrowRight, X, Command,
  Terminal, ShieldCheck, CornerDownLeft, Loader2, Check
} from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  description: string;
  category: 'AI Tools' | 'Navigation' | 'Workspaces' | 'Quick Actions';
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  projects: any[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  setIsCreatingProject: (val: boolean) => void;
  onClearActivities?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpen,
  activeTab,
  setActiveTab,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  setIsCreatingProject,
  onClearActivities
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quickAiLoading, setQuickAiLoading] = useState(false);
  const [quickAiResult, setQuickAiResult] = useState<string | null>(null);
  const [quickAiPrompt, setQuickAiPrompt] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onOpen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpen]);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setQuickAiResult(null);
      setIsAiMode(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Construct command list
  const commands: CommandItem[] = [
    // AI Tools
    {
      id: 'cmd_super_ai_toolbox',
      label: 'Super AI Toolbox (30+ Tools)',
      description: 'Open modular AI suite for Content, Video, Marketing, Business & Productivity',
      category: 'AI Tools',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setActiveTab('toolbox');
        onClose();
      },
      shortcut: 'Tab 1'
    },
    {
      id: 'cmd_quick_gemini',
      label: 'Quick Gemini AI Assistant',
      description: 'Ask Google Gemini AI anything directly from the command bar',
      category: 'AI Tools',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setIsAiMode(true);
        if (query.trim()) setQuickAiPrompt(query);
      },
      shortcut: 'AI Mode'
    },
    {
      id: 'cmd_blog_factory',
      label: 'SEO Blog Article Factory',
      description: 'Generate high-ranking AI articles with keywords & metadata',
      category: 'AI Tools',
      icon: <BookOpen className="w-4 h-4 text-teal-400" />,
      action: () => {
        setActiveTab('blog');
        onClose();
      },
      shortcut: 'Tab 2'
    },
    {
      id: 'cmd_ecom_funnel',
      label: 'Ecom AI Sales Funnels',
      description: 'Build 5-page conversion funnels for affiliate or direct products',
      category: 'AI Tools',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      action: () => {
        setActiveTab('ecom');
        onClose();
      },
      shortcut: 'Tab 3'
    },
    {
      id: 'cmd_ai_agents',
      label: 'Autonomous AI Agents',
      description: 'Configure and test specialized AI agents with custom personas',
      category: 'AI Tools',
      icon: <Bot className="w-4 h-4 text-violet-400" />,
      action: () => {
        setActiveTab('agents');
        onClose();
      },
      shortcut: 'Tab 4'
    },
    {
      id: 'cmd_memory_matrix',
      label: 'AI Memory Matrix',
      description: 'Persistent contextual knowledge graph for your workspace',
      category: 'AI Tools',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      action: () => {
        setActiveTab('memory');
        onClose();
      }
    },
    {
      id: 'cmd_website_builder',
      label: 'AI Website & Page Builder',
      description: 'Create responsive landing pages with live HTML/Tailwind preview',
      category: 'AI Tools',
      icon: <Globe className="w-4 h-4 text-pink-400" />,
      action: () => {
        setActiveTab('builder');
        onClose();
      }
    },
    {
      id: 'cmd_social_scheduler',
      label: 'Social Media Auto-Scheduler',
      description: 'Schedule multi-platform social media posts in real-time',
      category: 'AI Tools',
      icon: <Calendar className="w-4 h-4 text-sky-400" />,
      action: () => {
        setActiveTab('scheduler');
        onClose();
      }
    },
    {
      id: 'cmd_prompt_gallery',
      label: 'AI Prompt & Live Demo Gallery',
      description: 'Explore viral social templates and live executable prompt blueprints',
      category: 'AI Tools',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      action: () => {
        setActiveTab('template_gallery');
        onClose();
      }
    },

    // Navigation
    {
      id: 'cmd_nav_overview',
      label: 'Overview Dashboard',
      description: 'Main metrics, quick actions, and project selector',
      category: 'Navigation',
      icon: <Layout className="w-4 h-4 text-slate-300" />,
      action: () => {
        setActiveTab('overview');
        onClose();
      },
      shortcut: 'Tab 1'
    },
    {
      id: 'cmd_nav_activity',
      label: 'Gemini API & Activity Feed',
      description: 'Live Firestore audit logs of all AI interactions and studio events',
      category: 'Navigation',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setActiveTab('activity_feed');
        onClose();
      }
    },
    {
      id: 'cmd_nav_social_blueprints',
      label: 'Social Post Blueprints',
      description: 'Quick viral templates for TikTok, Instagram, Twitter & LinkedIn',
      category: 'Navigation',
      icon: <Terminal className="w-4 h-4 text-indigo-400" />,
      action: () => {
        setActiveTab('social_templates');
        onClose();
      }
    },

    // Quick Actions
    {
      id: 'cmd_action_new_project',
      label: 'Create New Workspace / Project',
      description: 'Add a new project container to organize your AI assets',
      category: 'Quick Actions',
      icon: <Plus className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setIsCreatingProject(true);
        onClose();
      }
    }
  ];

  // Append user projects dynamically as "Workspaces"
  projects.forEach((proj) => {
    commands.push({
      id: `proj_${proj.id}`,
      label: `Switch to Workspace: ${proj.name}`,
      description: `Active project ID: ${proj.id}`,
      category: 'Workspaces',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />,
      action: () => {
        setSelectedProjectId(proj.id);
        onClose();
      },
      shortcut: selectedProjectId === proj.id ? 'Active' : undefined
    });
  });

  // Filter commands based on query
  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Reset selectedIndex when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation handler inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isAiMode) {
        setIsAiMode(false);
      } else {
        onClose();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isAiMode) {
        handleRunQuickGemini();
      } else if (filteredCommands.length > 0) {
        filteredCommands[selectedIndex]?.action();
      }
    }
  };

  // Run Quick Gemini AI Prompt
  const handleRunQuickGemini = async () => {
    const promptToRun = quickAiPrompt || query;
    if (!promptToRun.trim()) return;

    setQuickAiLoading(true);
    setQuickAiResult(null);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'standard',
          prompt: promptToRun.trim(),
          systemInstruction: 'You are Google Gemini AI in NISAR AI Studio Command Palette. Give a highly actionable, concise, 2-3 sentence answer.',
          temperature: 0.7,
          model: 'gemini-3.5-flash'
        })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setQuickAiResult(data.text);
    } catch (err: any) {
      setQuickAiResult(`Execution Error: ${err.message}`);
    } finally {
      setQuickAiLoading(false);
    }
  };

  if (!isOpen) return null;

  // Group commands by category for neat display
  const groupedCategories = ['AI Tools', 'Navigation', 'Workspaces', 'Quick Actions'].filter(cat => 
    filteredCommands.some(c => c.category === cat)
  );

  let globalItemIndex = -1;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 md:pt-24 px-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#12141c] border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative"
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Bar */}
        <div className="p-4 border-b border-slate-800 bg-[#171a24] flex items-center space-x-3 relative">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={isAiMode ? quickAiPrompt : query}
            onChange={(e) => {
              if (isAiMode) {
                setQuickAiPrompt(e.target.value);
              } else {
                setQuery(e.target.value);
              }
            }}
            placeholder={
              isAiMode 
                ? "Ask Gemini AI anything (e.g. 'Write 3 viral headlines for AI software')..." 
                : "Type a command or search tools, navigation, workspaces (Ctrl+K)..."
            }
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none font-sans"
          />

          {isAiMode && (
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold shrink-0">
              Gemini AI Mode
            </span>
          )}

          <button
            onClick={() => {
              if (isAiMode) setIsAiMode(false);
              else onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Mode Execution View */}
        {isAiMode ? (
          <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">Quick Gemini AI Assistant</span>
              </div>
              <button
                onClick={() => setIsAiMode(false)}
                className="text-[11px] font-mono text-slate-400 hover:text-emerald-400 underline"
              >
                Return to Commands
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRunQuickGemini}
                disabled={quickAiLoading || !(quickAiPrompt || query).trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {quickAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Gemini AI Prompt...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Execute Prompt with Gemini 3.5 Flash</span>
                  </>
                )}
              </button>
            </div>

            {quickAiResult && (
              <div className="p-4 bg-[#181b24] border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-[10px] text-emerald-400 font-bold">
                  <span>Gemini AI Response:</span>
                  <span>gemini-3.5-flash</span>
                </div>
                <p className="text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                  {quickAiResult}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Command List View */
          <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
            {filteredCommands.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <Command className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="font-bold text-slate-400">No matching commands or tools found</p>
                <p className="text-[11px] mt-1 text-slate-500">Try searching "Blog", "Funnel", "Agent", or "Workspace"</p>
              </div>
            ) : (
              groupedCategories.map((category) => {
                const categoryItems = filteredCommands.filter((c) => c.category === category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="space-y-1">
                    <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      {category}
                    </div>
                    {categoryItems.map((item) => {
                      globalItemIndex++;
                      const isSelected = globalItemIndex === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          onClick={() => item.action()}
                          onMouseEnter={() => setSelectedIndex(globalItemIndex)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between group cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-600/20 text-slate-100 border border-emerald-500/40 shadow-sm' 
                              : 'text-slate-300 hover:bg-[#181b24] border border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`p-2 rounded-lg border ${
                              isSelected 
                                ? 'bg-emerald-500/20 border-emerald-500/50' 
                                : 'bg-[#181b24] border-slate-800'
                            }`}>
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                                <span>{item.label}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 ml-3">
                            {item.shortcut && (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1e2230] text-slate-400 rounded border border-slate-700">
                                {item.shortcut}
                              </span>
                            )}
                            {isSelected && (
                              <CornerDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-[#171a24] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="px-1.5 py-0.5 bg-[#12141c] border border-slate-700 rounded text-[10px] text-slate-300 font-bold">↑</span>
              <span className="px-1.5 py-0.5 bg-[#12141c] border border-slate-700 rounded text-[10px] text-slate-300 font-bold">↓</span>
              <span className="text-slate-500">Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="px-1.5 py-0.5 bg-[#12141c] border border-slate-700 rounded text-[10px] text-slate-300 font-bold">↵</span>
              <span className="text-slate-500">Select</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="px-1.5 py-0.5 bg-[#12141c] border border-slate-700 rounded text-[10px] text-slate-300 font-bold">Esc</span>
              <span className="text-slate-500">Close</span>
            </span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400 font-bold">
            <Command className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">Ctrl+K / ⌘K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
