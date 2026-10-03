'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Search, Layers, Copy, Play, Eye, X, Zap, Loader2, Calendar, Send, BookOpen, Globe } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { projectService } from '../lib/services/projectService';
import { useAuth } from './auth-provider';
import PageGalleryModal, { SiteTemplate } from './page-gallery-modal';

interface TemplateGalleryProps {
  onSelectTemplate: (template: any) => void;
  selectedProjectId: string;
}

export default function TemplateGallery({ onSelectTemplate, selectedProjectId }: TemplateGalleryProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPageGalleryOpen, setIsPageGalleryOpen] = useState(false);

  // Live Demo Modal State
  const [liveDemoTemplate, setLiveDemoTemplate] = useState<any | null>(null);
  const [demoVariables, setDemoVariables] = useState<Record<string, string>>({});
  const [aiGeneratedOutput, setAiGeneratedOutput] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const templates = [
    {
      id: 'gallery_1',
      title: '🚀 High-Impact Product Launch',
      category: 'Marketing',
      platform: 'Twitter/X & LinkedIn',
      description: 'Announce a major product launch with excitement, special discount, and clear CTA.',
      template: '🚀 We are thrilled to announce the official launch of {{product}} by {{brand}}!\n\nDesigned to help you scale effortlessly, this breakthrough changes everything.\n\n🔥 Special Launch Offer: Get {{discount}} when you sign up {{date}}.\n\n👉 {{cta}} here: {{link}}\n\n#{{brand}} #ProductLaunch #Innovation',
      variables: ['product', 'brand', 'discount', 'date', 'cta', 'link'],
      presetValues: {
        product: 'NISAR AI Studio Pro',
        brand: 'NISAR AI',
        discount: '40% OFF Lifetime',
        date: 'by Friday Midnight',
        cta: 'Claim Your Early Access',
        link: 'https://nisaraistudiovercel-app.vercel.app/'
      }
    },
    {
      id: 'gallery_2',
      title: '⚡ 24-Hour Flash Sale Urgency',
      category: 'E-commerce',
      platform: 'Instagram & Facebook',
      description: 'Drive immediate purchases with time-sensitive scarcity and high-converting hooks.',
      template: '⚡ 24-HOUR FLASH SALE! ⚡\n\nFor today only, get {{discount}} on our flagship {{product}}.\n\nWhy wait? {{headline}}.\n\n👉 Click the link in bio or visit {{link}} to secure your order before stock runs out!\n\n#FlashSale #{{brand}} #Deals',
      variables: ['discount', 'product', 'headline', 'link', 'brand'],
      presetValues: {
        discount: '50% OFF Limited Bundle',
        product: 'AI Ecom Empire Toolkit',
        headline: 'Transform your single link into a 7-figure sales funnel in 5 minutes',
        link: 'https://nisaraistudiovercel-app.vercel.app/',
        brand: 'NISAR AI'
      }
    },
    {
      id: 'gallery_3',
      title: '💡 Viral Knowledge Hook',
      category: 'Growth',
      platform: 'Twitter/X Thread',
      description: 'Share contrarian insights and actionable growth secrets to build audience engagement.',
      template: 'Unpopular opinion about {{product}}:\n\nMost people think it takes months of hard work, but {{brand}} proves you can master it in days.\n\nHere is how we achieved {{discount}} growth:\n\n1/4 🧵 Read the full breakdown at {{link}}',
      variables: ['product', 'brand', 'discount', 'link'],
      presetValues: {
        product: 'AI Content Automation',
        brand: 'NISAR Studio',
        discount: '10x Faster',
        link: 'https://nisaraistudiovercel-app.vercel.app/'
      }
    },
    {
      id: 'gallery_4',
      title: '🌟 Customer Success Story & Testimonial',
      category: 'Social Proof',
      platform: 'LinkedIn & Twitter/X',
      description: 'Highlight transformative customer results and build instant trust with your audience.',
      template: 'How {{brand}} helped our client scale their workflow by 300% using {{product}}.\n\n"The results exceeded all expectations in less than 7 days."\n\nReady to transform your results? {{cta}} at {{link}}\n\n#CaseStudy #{{brand}} #Growth',
      variables: ['brand', 'product', 'cta', 'link'],
      presetValues: {
        brand: 'NISAR AI Empire',
        product: 'Automated SEO Blog Engine',
        cta: 'Book your free demo',
        link: 'https://nisaraistudiovercel-app.vercel.app/'
      }
    },
    {
      id: 'gallery_5',
      title: '👑 Super God Ecom Sales Funnel Prompt',
      category: 'AI Prompts',
      platform: 'Google Gemini API / ChatGPT',
      description: 'All-in-one super prompt that converts any product link into a complete 10-step sales ecosystem.',
      template: 'Act as an Elite AI E-Commerce Empire Builder for {{brand}}.\nProduct: {{product}}\nDiscount Angle: {{discount}}\n\nGenerate:\n1. 5 Scroll-stopping TikTok hooks\n2. High-converting landing page headline: {{headline}}\n3. 3 Facebook ad copy variations\n4. Direct closing CTA link: {{link}}\n5. Scarcity trigger: {{date}}',
      variables: ['brand', 'product', 'discount', 'headline', 'link', 'date'],
      presetValues: {
        brand: 'Yoovic Store',
        product: 'Smart Wireless Ergonomic Keyboard',
        discount: 'Buy 1 Get 1 Free',
        headline: 'Say Goodbye to Wrist Fatigue Forever',
        link: 'https://nisaraistudiovercel-app.vercel.app/',
        date: 'Offer Ends Tonight'
      }
    },
    {
      id: 'gallery_6',
      title: '🎁 Lead Magnet Announcement',
      category: 'Lead Gen',
      platform: 'Cross-Platform',
      description: 'Offer a free resource or guide in exchange for email signups and engagement.',
      template: '🎁 FREE GUIDE: The exact blueprint we used to achieve {{discount}} efficiency with {{product}}.\n\nInside you will discover:\n- Secret #1: {{headline}}\n- Secret #2: Instant scaling\n\nGrab your free copy here: {{link}}\n\n#Freebie #{{brand}} #Marketing',
      variables: ['discount', 'product', 'headline', 'link', 'brand'],
      presetValues: {
        discount: '100% Free Access',
        product: 'The 2026 AI Growth Playbook',
        headline: 'Automating 90% of Social Media Workflow',
        link: 'https://nisaraistudiovercel-app.vercel.app/',
        brand: 'NISAR AI'
      }
    },
    {
      id: 'gallery_7',
      title: '🔮 Behind the Scenes Vision',
      category: 'Branding',
      platform: 'Instagram & LinkedIn',
      description: 'Share your company mission, team updates, and upcoming roadmap milestones.',
      template: 'Behind the scenes at {{brand}} 🛠️\n\nWe are building the future of {{product}}. Our goal is simple: {{headline}}.\n\nJoin us on this journey. Check out what is coming next at {{link}}.\n\n#Startup #{{brand}} #Tech',
      variables: ['brand', 'product', 'headline', 'link'],
      presetValues: {
        brand: 'NISAR AI Labs',
        product: 'Autonomous Growth Agents',
        headline: 'Empower creators to run 7-figure businesses with zero extra effort',
        link: 'https://nisaraistudiovercel-app.vercel.app/'
      }
    },
    {
      id: 'gallery_8',
      title: '📧 High-Converting Cold Outreach Email',
      category: 'Lead Gen',
      platform: 'Direct Email',
      description: 'B2B sales pitch template designed to get replies from busy founders and executives.',
      template: 'Subject: Quick question regarding {{product}} at {{brand}}\n\nHi [Name],\n\nI noticed {{brand}} is focusing on {{headline}}.\n\nWe helped a similar team achieve {{discount}} performance boost using {{product}}.\n\nWould you be open to a 5-minute preview? Check out {{link}} or reply to this email.\n\nBest regards,\nNISAR AI Team',
      variables: ['product', 'brand', 'headline', 'discount', 'link'],
      presetValues: {
        product: 'AI Marketing Suite',
        brand: 'Acme Corp',
        headline: 'scaling organic customer acquisition',
        discount: '3x conversion rate',
        link: 'https://nisaraistudiovercel-app.vercel.app/'
      }
    },
    {
      id: 'gallery_9',
      title: '✨ Google Labs Pomelli Website to NISAR AI Studio Converter',
      category: 'Pomelli / Google Labs',
      platform: 'NISAR AI Studio Web App',
      description: 'Convert Google Labs Pomelli website links (9ov4uKkvJNxaHuCztahkUN) into high-performance NISAR AI Studio workspaces, web apps, and automated marketing funnels.',
      template: '✨ CONVERTED FROM GOOGLE LABS POMELLI WEBSITE:\nSource Link: https://labs.google.com/pomelli/website/9ov4uKkvJNxaHuCztahkUN\n\nConverted Project: {{product}}\nCreated by: {{brand}}\nLive Vercel Hub: {{link}}\n\nCore Features Generated:\n- AI SEO Content Funnel\n- Automated Social Media Campaign\n- Real-time Redis Analytics & Mission Queue\n- Secure Firebase Firestore Cloud Synchronization',
      variables: ['product', 'brand', 'link'],
      presetValues: {
        product: 'Pomelli Imported Website & AI Workspace',
        brand: 'NISAR AI Labs',
        link: 'https://nisaraistudiovercel-app.vercel.app/'
      }
    }
  ];

  const categories = ['All', 'Pomelli / Google Labs', 'Marketing', 'E-commerce', 'Growth', 'AI Prompts', 'Social Proof', 'Lead Gen', 'Branding'];

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.platform.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (t: any) => {
    navigator.clipboard.writeText(t.template);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Live Demo Mode
  const handleOpenLiveDemo = (template: any) => {
    setLiveDemoTemplate(template);
    setDemoVariables(template.presetValues || {});
    setAiGeneratedOutput(null);
    setDispatchSuccess(false);
  };

  // Replace placeholders live
  const getRenderedText = () => {
    if (!liveDemoTemplate) return '';
    let text = liveDemoTemplate.template;
    Object.keys(demoVariables).forEach((key) => {
      const val = demoVariables[key] !== undefined ? demoVariables[key] : `[${key}]`;
      text = text.replaceAll(`{{${key}}}`, val);
    });
    return text;
  };

  // Run Gemini AI generation with current live demo template
  const handleRunAiDemo = async () => {
    if (!liveDemoTemplate) return;
    setAiLoading(true);
    setAiGeneratedOutput(null);

    const renderedPrompt = getRenderedText();
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'standard',
          prompt: `Using the following marketing template structure:\n\n${renderedPrompt}\n\nEnhance this into a super polished, high-converting live post version. Keep emojis, formatted line breaks, and add 3 ultra-relevant trending hashtags.`,
          systemInstruction: 'You are Google Gemini AI in NISAR AI Studio. Output only the final expanded post text cleanly.',
          temperature: 0.7,
          model: 'gemini-3.5-flash'
        })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAiGeneratedOutput(data.text);

      // Log to Firestore
      if (user) {
        await projectService.logActivity(
          `Generated AI enhanced template: "${liveDemoTemplate.title}"`,
          'gemini_interaction',
          selectedProjectId || 'global_workspace',
          user.uid
        );
      }
    } catch (err: any) {
      setAiGeneratedOutput(`Error generating AI text: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Dispatch to Firestore Social Automation
  const handleDispatchSocial = async () => {
    if (!user || !liveDemoTemplate) return;
    const finalContent = aiGeneratedOutput || getRenderedText();

    try {
      await addDoc(collection(db, 'social_posts'), {
        platform: liveDemoTemplate.platform || 'Twitter/X',
        content: finalContent,
        status: 'Scheduled',
        scheduledFor: Timestamp.now(),
        projectId: selectedProjectId || 'global_workspace',
        tenantId: user.uid,
        createdAt: Timestamp.now()
      });

      await projectService.logActivity(
        `Dispatched live demo template to Social Scheduler: "${liveDemoTemplate.title}"`,
        'social_dispatch',
        selectedProjectId || 'global_workspace',
        user.uid
      );

      setDispatchSuccess(true);
      setTimeout(() => setDispatchSuccess(false), 3000);
    } catch (err: any) {
      alert('Dispatch Error: ' + err.message);
    }
  };

  return (
    <div className="bg-[#12141c] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            <span>AI Prompt & Live Demo Template Gallery</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explore battle-tested viral templates. Click <strong className="text-emerald-400">"Live Demo & AI Test"</strong> on any template to customize variables and execute real-time Gemini AI prompts.
          </p>
        </div>

        <div className="flex flex-wrap items-center space-x-3 w-full md:w-auto">
          <button
            onClick={() => setIsPageGalleryOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <Globe className="w-4 h-4 fill-slate-950" />
            <span>20 Full Site Templates</span>
          </button>

          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              className="w-full bg-[#181b24] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-500"
              placeholder="Search live templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#181b24] text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((t) => (
          <div
            key={t.id}
            className="bg-[#181b24] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-900/50 font-bold">
                  {t.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded font-semibold">
                  {t.platform}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition">
                {t.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {t.description}
              </p>

              <div className="p-3 bg-[#0d0f14] rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                {t.template}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleCopy(t)}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition font-mono cursor-pointer"
              >
                {copiedId === t.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Raw</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenLiveDemo(t)}
                  className="flex items-center space-x-1.5 bg-[#1f2937] hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Demo</span>
                </button>

                <button
                  onClick={() => onSelectTemplate(t)}
                  className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                >
                  <span>Load</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-bold text-sm">No templates found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for another keyword or category.</p>
          </div>
        )}
      </div>

      {/* ==================== INTERACTIVE LIVE DEMO MODAL ==================== */}
      {liveDemoTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#12141c] border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-100 flex items-center space-x-2">
                    <span>{liveDemoTemplate.title}</span>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                      Interactive Live Demo
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Test live auto-replacements and execute Gemini AI enhancements in real time.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLiveDemoTemplate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Input Variables */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center space-x-1">
                <span>1. Customize Live Preset Variables</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {liveDemoTemplate.variables?.map((v: string) => (
                  <div key={v}>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                      {'{{' + v + '}}'}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#171a24] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                      value={demoVariables[v] !== undefined ? demoVariables[v] : ''}
                      onChange={(e) => setDemoVariables({ ...demoVariables, [v]: e.target.value })}
                      placeholder={`Value for {{${v}}}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Live Output Box */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-mono uppercase font-bold text-slate-300">
                  2. Live Auto-Replaced Output
                </h4>
                <span className="text-[10px] font-mono text-slate-500">
                  {getRenderedText().length} Chars
                </span>
              </div>
              <div className="p-4 bg-[#0d0f14] border border-slate-800 rounded-xl text-slate-200 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                {getRenderedText()}
              </div>
            </div>

            {/* Gemini AI Enhancement Box */}
            {aiGeneratedOutput && (
              <div className="space-y-2 pt-2 border-t border-slate-800 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>3. Gemini AI Enhanced Version</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">gemini-3.5-flash</span>
                </div>
                <div className="p-4 bg-[#0c1813] border border-emerald-500/40 rounded-xl text-emerald-100 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                  {aiGeneratedOutput}
                </div>
              </div>
            )}

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunAiDemo}
                  disabled={aiLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini AI Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Run Gemini AI Enhance</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDispatchSocial}
                  className="bg-[#1e2230] hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Dispatch to Automation</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {dispatchSuccess && (
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Dispatched to Firestore!</span>
                  </span>
                )}

                <button
                  onClick={() => {
                    onSelectTemplate({
                      ...liveDemoTemplate,
                      template: getRenderedText()
                    });
                    setLiveDemoTemplate(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Open in Workspace</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 20 Full Website Templates Page Gallery Modal */}
      <PageGalleryModal
        isOpen={isPageGalleryOpen}
        onClose={() => setIsPageGalleryOpen(false)}
        onSelectSite={(site) => {
          onSelectTemplate({
            title: site.name,
            category: site.category,
            description: site.description,
            template: `Full Website Blueprint: ${site.name}\n\nBlocks:\n` + site.blocks.map(b => `- [${b.type.toUpperCase()}]: ${JSON.stringify(b.content)}`).join('\n')
          });
          setIsPageGalleryOpen(false);
        }}
      />
    </div>
  );
}

