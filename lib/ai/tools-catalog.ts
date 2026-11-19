import type React from 'react';
import {
  Sparkles,
  Bot,
  Search,
  Tag,
  MessageSquare,
  Globe,
  Database,
  BookOpen,
  Calendar,
  Brain,
  Share2,
  Layers,
  Coins,
  Cpu,
  CreditCard,
  BarChart3,
} from 'lucide-react';

export type DashboardTab =
  | 'overview'
  | 'search_collect'
  | 'agent_evolver'
  | 'billing'
  | 'analytics'
  | 'admin'
  | 'toolbox'
  | 'chatbot_lab'
  | 'backlink_detect'
  | 'affiliate_converter'
  | 'blog'
  | 'ecom'
  | 'scheduler'
  | 'memory'
  | 'revenue'
  | 'agents'
  | 'builder'
  | 'social_templates'
  | 'template_gallery'
  | 'activity_feed'
  | 'empire'
  | 'vibe'
  | 'pomelli_sheets'
  | 'ai_link_converter'
  | 'chat_history';

export interface AIToolItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  tabId: DashboardTab;
  accentColor: string;
  badgeBg: string;
}

export const AI_TOOLS_CATALOG: AIToolItem[] = [
  {
    id: 'search_collect',
    name: 'Search & Auto-Collect Agent',
    category: 'Google Search Grounding & CSV/JSON Export',
    description:
      'Collect live web intelligence with Gemini Google Search grounding, auto-sync to Firestore, and export as CSV or JSON.',
    icon: Globe,
    badge: 'Live Grounding',
    tabId: 'search_collect',
    accentColor:
      'border-slate-200 dark:border-[#00D9FF]/30 hover:border-[#00D9FF] bg-white dark:bg-[#0B0F19]',
    badgeBg: 'text-indigo-700 dark:text-[#00D9FF]',
  },
  {
    id: 'agent_evolver',
    name: 'Agent Evolver Control',
    category: 'Multi-Model Router (Gemini + Claude AI)',
    description:
      'Run Niche SaaS, Chrome Extension, Programmatic SEO, and Self-Optimizer agents up to 10,000 characters with Gemini & Claude.',
    icon: Cpu,
    badge: 'Gemini + Claude',
    tabId: 'agent_evolver',
    accentColor:
      'border-slate-200 dark:border-[#6366F1]/35 hover:border-[#00D9FF] bg-white dark:bg-[#0B0F19]',
    badgeBg: 'text-indigo-700 dark:text-[#22D3EE]',
  },
  {
    id: 'billing',
    name: 'Billing & Credits Hub',
    category: 'JazzCash / Easypaisa & Stripe Checkout',
    description:
      'Manage 10 daily free credits, submit JazzCash/Easypaisa 0323-5052148 TID verification, or purchase Stripe credit packs.',
    icon: CreditCard,
    badge: 'PKR & USD Billing',
    tabId: 'billing',
    accentColor:
      'border-slate-200 dark:border-emerald-500/30 hover:border-[#00D9FF] bg-white dark:bg-[#0B0F19]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'analytics',
    name: 'Live Data Analytics & Sync Hub',
    category: 'Firebase Telemetry & GitHub Auto-Sync',
    description:
      'Monitor real-time Firestore collection metrics, tracked Firebase Analytics events, and automated GitHub-to-Vercel deployment sync.',
    icon: BarChart3,
    badge: 'Live Telemetry',
    tabId: 'analytics',
    accentColor:
      'border-slate-200 dark:border-[#8B5CF6]/35 hover:border-[#00D9FF] bg-white dark:bg-[#0B0F19]',
    badgeBg: 'text-violet-700 dark:text-violet-300',
  },
  {
    id: 'toolbox',
    name: 'Super AI Toolbox (30+ Tools)',
    category: 'Content, Video, Marketing & Productivity',
    description:
      'Modular 30+ tool suite powered by Google Gemini, Firestore credits, and saved generation history.',
    icon: Sparkles,
    badge: 'Flagship Suite',
    tabId: 'toolbox',
    accentColor:
      'border-slate-200 dark:border-[#00D9FF]/25 hover:border-[#00D9FF] bg-white dark:bg-[#0B0F19]',
    badgeBg: 'text-indigo-700 dark:text-[#00D9FF]',
  },
  {
    id: 'chatbot_lab',
    name: 'Chatbot Basics Lab (Rule vs LLM)',
    category: 'Interactive Sandbox & Inspector',
    description:
      'Compare keyword rule-matching against live Gemini language models with JSON payload & token inspection.',
    icon: Bot,
    badge: 'Rule vs LLM Lab',
    tabId: 'chatbot_lab',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'backlink_detect',
    name: 'Backlink Auto-Detect',
    category: 'SEO Intelligence & Link Audit',
    description:
      'Crawl live webpages for dofollow, nofollow, sponsored, and affiliate links with CSV export and outreach.',
    icon: Search,
    badge: 'Live HTML Audit',
    tabId: 'backlink_detect',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'affiliate_converter',
    name: 'Real-Time Affiliate Converter',
    category: 'Monetization & Link Vault',
    description:
      'Single and bulk URL monetization for major affiliate networks with UTM parameters and FTC disclosures.',
    icon: Tag,
    badge: 'Instant Vault',
    tabId: 'affiliate_converter',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'chat_history',
    name: 'Save-Memory Gemini Agent Chatbot',
    category: 'Persistent Memory & Gemini Chat',
    description:
      'Linked to Google Gemini with persistent Firestore Memory Vault, auto-injected brand context, and saved chat threads.',
    icon: MessageSquare,
    badge: 'Save-Memory Chatbot',
    tabId: 'chat_history',
    accentColor:
      'border-slate-200 dark:border-indigo-500/30 hover:border-[#00D9FF] bg-white dark:bg-[#0D1322]',
    badgeBg: 'text-indigo-700 dark:text-[#00D9FF]',
  },
  {
    id: 'ai_link_converter',
    name: 'AI Add Link & URL Converter',
    category: 'AI Intelligence & Grounding',
    description:
      'Analyze and convert any URL into marketing campaigns or structured assets grounded with Search.',
    icon: Globe,
    badge: 'Search Grounding',
    tabId: 'ai_link_converter',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'pomelli_sheets',
    name: 'Pomelli Website & Google Sheets Chat',
    category: 'Google Workspace Integration',
    description:
      'Connect Pomelli campaigns and Google Sheets Gemini Chat with persistent workspace memory.',
    icon: Globe,
    badge: 'Google Sheets & Pomelli',
    tabId: 'pomelli_sheets',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'vibe',
    name: 'Vibe Responding — AI Social Media',
    category: 'Social Automation & Inbox',
    description:
      'Unified social inbox, automated customer replies, brand voice alignment, and response rules.',
    icon: MessageSquare,
    badge: 'Social Automation',
    tabId: 'vibe',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'empire',
    name: 'Empire OS Redis Core',
    category: 'Distributed Orchestration',
    description:
      'Monitor job queues, distributed state coordination, and multi-agent execution pipelines.',
    icon: Database,
    badge: 'Queue Monitor',
    tabId: 'empire',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'blog',
    name: 'SEO Blog Post Factory',
    category: 'Content Generation',
    description:
      'Automated SEO article generation, keyword clustering, and complete publishing pipeline.',
    icon: BookOpen,
    badge: 'SEO Factory',
    tabId: 'blog',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'agents',
    name: 'Autonomous Agent Builder',
    category: 'Agents & Workflows',
    description:
      'Create custom AI personas with system instructions and test conversations live in sandbox.',
    icon: Bot,
    badge: 'Custom Personas',
    tabId: 'agents',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'ecom',
    name: 'Ecom Money Machine',
    category: 'Sales & Copywriting',
    description:
      'Product landing page analysis, affiliate sales funnels, and conversion ad copy suites.',
    icon: Sparkles,
    badge: 'Conversion Copy',
    tabId: 'ecom',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'builder',
    name: 'Campaign Site Builder',
    category: 'Web Apps & Pages',
    description:
      'Block-based website builder with export options and 20 full-site gallery templates.',
    icon: Globe,
    badge: 'Site Builder',
    tabId: 'builder',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'scheduler',
    name: 'Social Media Automation',
    category: 'Marketing & Distribution',
    description:
      'Schedule multi-channel social posts with prompt templates and publishing queues.',
    icon: Calendar,
    badge: 'Multi-Channel',
    tabId: 'scheduler',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'memory',
    name: 'Semantic Memory Engine',
    category: 'Knowledge & RAG',
    description:
      'Brand knowledge nodes keeping all AI workflows aligned with your guidelines and rules.',
    icon: Brain,
    badge: 'Knowledge Base',
    tabId: 'memory',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'social_templates',
    name: 'Social Live Templates',
    category: 'Prompts & Copy',
    description:
      'Ready-to-use social copy templates with instant variable replacement and one-click dispatch.',
    icon: Share2,
    badge: 'Live Variables',
    tabId: 'social_templates',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'template_gallery',
    name: 'Blueprint Site Gallery',
    category: 'Templates & Architecture',
    description:
      'Browse 20 complete full-stack website blueprints ready for instant workspace deployment.',
    icon: Layers,
    badge: '20 Blueprints',
    tabId: 'template_gallery',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'revenue',
    name: 'Revenue Engine',
    category: 'Financial Analytics',
    description:
      'Track campaign revenue, monetization funnels, and workspace ROI performance metrics.',
    icon: Coins,
    badge: 'ROI Analytics',
    tabId: 'revenue',
    accentColor:
      'border-slate-200 dark:border-emerald-950/70 hover:border-emerald-500/50 bg-white dark:bg-[#0e1318]',
    badgeBg: 'text-emerald-700 dark:text-emerald-400',
  },
];
