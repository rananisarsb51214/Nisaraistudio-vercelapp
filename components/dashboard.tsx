'use client';

import React, { useState } from 'react';
import { useAuth } from './auth-provider';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { projectService } from '@/lib/services/projectService';
import { userPreferenceService } from '../lib/services/userPreferenceService';
import { auth } from '../lib/firebase';
import { 
  Plus, Trash2, Loader2, Sparkles, BookOpen, Coins, Globe, 
  Share2, LogOut, Database, TrendingUp, Video, Layers, 
  Settings, Clipboard, ExternalLink, RefreshCw, Calendar, 
  CheckCircle, ArrowRight, Brain, UserCheck, AlertCircle, Eye, EyeOff,
  Bot, Cpu, Sliders, Layout, Clock, Zap, Activity, Search, Star, MessageSquare
} from 'lucide-react';
import { addDoc, collection, Timestamp, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import WebsiteBuilder from './website-builder';
import TemplateGallery from './template-gallery';
import CommandPalette from './command-palette';
import { EmpireRedisMonitor } from './empire-redis-monitor';
import { VibeResponding } from './vibe/vibe-responding';
import { SuperAiToolbox } from './ai/super-ai-toolbox';
import { PomelliSheetsConverter } from './ai/pomelli-sheets-converter';
import { AiLinkConverter } from './ai/ai-link-converter';
import { ChatHistorySidebar } from './ai/chat-history-sidebar';

export interface AIToolItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  tabId: 'toolbox' | 'overview' | 'blog' | 'ecom' | 'scheduler' | 'memory' | 'revenue' | 'agents' | 'builder' | 'social_templates' | 'template_gallery' | 'activity_feed' | 'empire' | 'vibe' | 'pomelli_sheets' | 'ai_link_converter' | 'chat_history';
  accentColor: string;
  badgeBg: string;
}

export const AI_TOOLS_CATALOG: AIToolItem[] = [
  {
    id: 'toolbox',
    name: 'Super AI Toolbox (30+ Tools)',
    category: 'Content, Video, Marketing, Biz & Productivity',
    description: 'The flagship modular Super AI Toolbox: 30+ tools powered by Google Gemini 2.5, Firebase Credits, and Firestore generation history.',
    icon: Sparkles,
    badge: 'Flagship Suite',
    tabId: 'toolbox',
    accentColor: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/10',
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'chat_history',
    name: 'Firestore Chat History & Sidebar',
    category: 'Conversational Memory & RAG',
    description: 'Persistent multi-turn chat sidebar with Firestore synchronization, allowing users to revisit past conversations.',
    icon: MessageSquare,
    badge: 'Firestore Memory',
    tabId: 'chat_history',
    accentColor: 'border-purple-500/40 hover:border-purple-400 bg-purple-950/10',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    id: 'ai_link_converter',
    name: 'AI Add Link & URL Converter',
    category: 'AI Intelligence & Grounding',
    description: 'Paste any link, URL, or blob reference to analyze, ground with Google Search, and convert into marketing campaigns or code.',
    icon: Globe,
    badge: 'Search Grounding',
    tabId: 'ai_link_converter',
    accentColor: 'border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/10',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'pomelli_sheets',
    name: 'Pomelli Website & Google Sheets Chat',
    category: 'Workspace & Google Workspace',
    description: 'Embed Pomelli website campaigns (labs.google.com/u/0/pomelli/website/9ov4uKkvJNxaHuCztahkUN) and Google Sheets Gemini Chat with Memory.',
    icon: Globe,
    badge: 'Google Sheets & Pomelli',
    tabId: 'pomelli_sheets',
    accentColor: 'border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/10',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'vibe',
    name: 'Vibe Responding — AI Social Media',
    category: 'Social Automation & Inbox',
    description: 'AI Social Media Automation, Unified Social Inbox, Gemini Response Engine, Brand Voice, and Redis Queues.',
    icon: MessageSquare,
    badge: 'Vibe Responding Engine',
    tabId: 'vibe',
    accentColor: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/10',
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'empire',
    name: 'Empire OS Redis Core',
    category: 'Distributed Orchestration',
    description: 'Redis state coordinator, BullMQ job queues, atomic locks, and multi-agent execution pipeline.',
    icon: Database,
    badge: 'Redis Execution Layer',
    tabId: 'empire',
    accentColor: 'border-rose-500/40 hover:border-rose-400 bg-rose-950/10',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  },
  {
    id: 'blog',
    name: 'SEO Blog Post Factory',

    category: 'Content Generation',
    description: 'Automated SEO article generation, keyword analysis, and complete publishing pipeline.',
    icon: BookOpen,
    badge: 'Gemini 3.5 Flash',
    tabId: 'blog',
    accentColor: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/10',
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'agents',
    name: 'Autonomous Agent Builder',
    category: 'Agents & Workflows',
    description: 'Create custom AI personas, instructions, temperature controls, and test in sandbox.',
    icon: Bot,
    badge: 'Custom Personas',
    tabId: 'agents',
    accentColor: 'border-purple-500/40 hover:border-purple-400 bg-purple-950/10',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    id: 'ecom',
    name: 'Ecom Money Machine',
    category: 'Sales & Copywriting',
    description: 'Product landing page analysis, affiliate sales funnels, and conversion ad copy suites.',
    icon: Sparkles,
    badge: 'Conversion Copy',
    tabId: 'ecom',
    accentColor: 'border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/10',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'builder',
    name: 'Campaign Site Builder',
    category: 'Web Apps & Pages',
    description: 'Drag-and-drop website block builder with export options and 20 full-site gallery templates.',
    icon: Globe,
    badge: '20 Gallery Sites',
    tabId: 'builder',
    accentColor: 'border-sky-500/40 hover:border-sky-400 bg-sky-950/10',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
  },
  {
    id: 'scheduler',
    name: 'Social Media Automation',
    category: 'Marketing & Distribution',
    description: 'Auto-schedule multi-channel social posts with prompt templates and execution queues.',
    icon: Calendar,
    badge: 'Multi-Channel',
    tabId: 'scheduler',
    accentColor: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/10',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 'memory',
    name: 'Semantic Memory Engine',
    category: 'Knowledge & RAG',
    description: 'RAG knowledge base keeping all AI tools synchronized with your brand voice and rules.',
    icon: Brain,
    badge: 'RAG Alignment',
    tabId: 'memory',
    accentColor: 'border-indigo-500/40 hover:border-indigo-400 bg-indigo-950/10',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  },
  {
    id: 'social_templates',
    name: 'Social Live Templates',
    category: 'Prompts & Copy',
    description: 'Ready-to-use social copy templates with instant live variable replacement and copying.',
    icon: Share2,
    badge: 'Instant Prompts',
    tabId: 'social_templates',
    accentColor: 'border-pink-500/40 hover:border-pink-400 bg-pink-950/10',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
  },
  {
    id: 'template_gallery',
    name: 'Blueprint Site Gallery',
    category: 'Templates & Architecture',
    description: 'Browse 20 complete full-stack website blueprints ready for instant workspace load.',
    icon: Layers,
    badge: '20 Full Blueprints',
    tabId: 'template_gallery',
    accentColor: 'border-emerald-500/40 hover:border-emerald-400 bg-teal-950/10',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
  },
  {
    id: 'revenue',
    name: 'Revenue Engine',
    category: 'Financial Analytics',
    description: 'Track campaign revenue, monetization funnels, and workspace ROI statistics.',
    icon: Coins,
    badge: 'ROI Analytics',
    tabId: 'revenue',
    accentColor: 'border-yellow-500/40 hover:border-yellow-400 bg-yellow-950/10',
    badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  }
];

export function Dashboard() {
  const { user } = useAuth();
  
  // State for project selection and navigation
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'toolbox' | 'overview' | 'blog' | 'ecom' | 'scheduler' | 'memory' | 'revenue' | 'agents' | 'builder' | 'social_templates' | 'template_gallery' | 'activity_feed' | 'empire' | 'vibe' | 'pomelli_sheets' | 'ai_link_converter' | 'chat_history'>('toolbox');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // User Preferences from Firestore (Favorite AI Tools)
  const userPrefRef = user ? userPreferenceService.getUserPreferencesRef(user.uid) : null;
  const [userPrefData] = useDocumentData(userPrefRef);
  const favoriteToolIds: string[] = userPrefData?.favoriteTools || ['blog', 'agents', 'ecom'];

  const [favoriteNotification, setFavoriteNotification] = useState<string | null>(null);

  const handleToggleFavorite = async (toolId: string, toolName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    const isFav = favoriteToolIds.includes(toolId);
    await userPreferenceService.toggleFavoriteTool(user.uid, favoriteToolIds, toolId);
    setFavoriteNotification(
      !isFav 
        ? `⭐ "${toolName}" pinned to top preferred tools!` 
        : `Removed "${toolName}" from favorites.`
    );
    setTimeout(() => setFavoriteNotification(null), 3000);
  };

  // States & Presets for Social Live Templates with AI & Auto-Replacement
  const [templateTopic, setTemplateTopic] = useState('');
  const [templatePlatform, setTemplatePlatform] = useState('Twitter/X');
  const [templateLoading, setTemplateLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [liveVariables, setLiveVariables] = useState<Record<string, string>>({
    brand: 'Nisar AI',
    product: 'Cloud Studio Pro',
    discount: '50% OFF',
    headline: 'Scale your business instantly',
    cta: 'Claim your access now',
    link: 'https://nisaraistudiovercel-app.vercel.app/',
    date: 'Today'
  });

  // Form states for Custom Agent Builder
  const [agentName, setAgentName] = useState('');
  const [agentPersona, setAgentPersona] = useState('');
  const [agentInstructions, setAgentInstructions] = useState('');
  const [agentTemperature, setAgentTemperature] = useState(0.7);
  const [agentModel, setAgentModel] = useState('gemini-3.5-flash');
  const [agentLoading, setAgentLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // State for Agent Sandbox test chat
  const [agentSandboxInput, setAgentSandboxInput] = useState('');
  const [sandboxMessages, setSandboxMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  // Form states for AI Blog Generation
  const [blogTopic, setBlogTopic] = useState('');
  const [blogLoading, setBlogLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Form states for E-Com funnel generator
  const [productUrl, setProductUrl] = useState('');
  const [brandName, setBrandName] = useState('');
  const [targetCountry, setTargetCountry] = useState('Global');
  const [ecomLoading, setEcomLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // States for Vector Memory Creator
  const [memoryKey, setMemoryKey] = useState('');
  const [memoryValue, setMemoryValue] = useState('');
  const [memoryCategory, setMemoryCategory] = useState('brand_guidelines');

  // States for Browser Evolver Simulator
  const [evolverInput, setEvolverInput] = useState('');
  const [evolverLoading, setEvolverLoading] = useState(false);

  // States for Social Post Scheduler
  const [socialPlatform, setSocialPlatform] = useState('TikTok');
  const [socialContent, setSocialContent] = useState('');
  const [socialTime, setSocialTime] = useState('');

  // States for Recent Activity Feed
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [activitySearch, setActivitySearch] = useState('');

  // States for Global Dashboard Spotlight Search
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Fetch projects in real-time
  const [projectsSnapshot, projectsLoading, projectsError] = useCollection(
    user ? projectService.getProjectsQuery(user.uid) : null
  );

  const projects = projectsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) || [];

  // Auto-select first project if none is selected
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Fetch jobs for current user (global across projects)
  const [jobsSnapshot, jobsLoading, jobsError] = useCollection(
    user ? query(collection(db, 'jobs'), where('tenantId', '==', user.uid)) : null
  );
  const allJobs = jobsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) || [];
  const jobs = allJobs.filter(j => j.projectId === selectedProjectId);

  // Fetch products for current user (global across projects)
  const [productsSnapshot, productsLoading, productsError] = useCollection(
    user ? query(collection(db, 'products'), where('tenantId', '==', user.uid)) : null
  );
  const allProducts = productsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) || [];
  const products = allProducts.filter(p => p.projectId === selectedProjectId);

  // Fetch vector memory nodes for current user (global across projects)
  const [memoriesSnapshot] = useCollection(
    user ? query(collection(db, 'memory'), where('tenantId', '==', user.uid)) : null
  );
  const allMemories = memoriesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) || [];
  const memories = allMemories.filter(m => m.projectId === selectedProjectId);

  // Fetch social schedules for current user (global across projects)
  const [schedulesSnapshot] = useCollection(
    user ? query(collection(db, 'social_posts'), where('tenantId', '==', user.uid)) : null
  );
  const allSchedules = schedulesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) || [];
  const schedules = allSchedules.filter(s => s.projectId === selectedProjectId);

  // Fetch custom agents for current user (global across projects)
  const [agentsSnapshot, agentsLoading] = useCollection(
    user ? query(collection(db, 'agents'), where('tenantId', '==', user.uid)) : null
  );
  const allAgents = agentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) || [];
  const agents = allAgents.filter(a => a.projectId === selectedProjectId);

  // Fetch social templates for current user
  const [templatesSnapshot] = useCollection(
    user ? query(collection(db, 'social_templates'), where('tenantId', '==', user.uid)) : null
  );
  const allTemplates = templatesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) || [];
  const projectTemplates = allTemplates.filter(t => t.projectId === selectedProjectId);

  const defaultPresets = [
    {
      id: 'preset_1',
      title: '🚀 High-Impact Product Launch',
      platform: 'Twitter/X & LinkedIn',
      template: '🚀 We are thrilled to announce the official launch of {{product}} by {{brand}}!\n\nDesigned to help you scale effortlessly, this breakthrough changes everything.\n\n🔥 Special Launch Offer: Get {{discount}} when you sign up {{date}}.\n\n👉 {{cta}} here: {{link}}\n\n#{{brand}} #ProductLaunch #Innovation',
      variables: ['product', 'brand', 'discount', 'date', 'cta', 'link']
    },
    {
      id: 'preset_2',
      title: '⚡ 24-Hour Flash Sale Urgency',
      platform: 'Instagram & Facebook',
      template: '⚡ 24-HOUR FLASH SALE! ⚡\n\nFor today only, get {{discount}} on our flagship {{product}}.\n\nWhy wait? {{headline}}.\n\n👉 Click the link in bio or visit {{link}} to secure your order before stock runs out!\n\n#FlashSale #{{brand}} #Deals',
      variables: ['discount', 'product', 'headline', 'link', 'brand']
    },
    {
      id: 'preset_3',
      title: '💡 Viral Knowledge Hook',
      platform: 'Twitter/X Thread',
      template: 'Unpopular opinion about {{product}}:\n\nMost people think it takes months of hard work, but {{brand}} proves you can master it in days.\n\nHere is how we achieved {{discount}} growth:\n\n1/4 🧵 Read more at {{link}}',
      variables: ['product', 'brand', 'discount', 'link']
    }
  ];

  const allAvailableTemplates = [...defaultPresets, ...projectTemplates];

  React.useEffect(() => {
    if (!selectedTemplate && allAvailableTemplates.length > 0) {
      setSelectedTemplate(allAvailableTemplates[0]);
    }
  }, [allAvailableTemplates]);

  const handleGenerateSocialTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateTopic.trim() || !selectedProjectId || !user) return;

    setTemplateLoading(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'social_template', topic: templateTopic.trim(), platform: templatePlatform }),
      });

      if (!response.ok) throw new Error(await response.text());
      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);

      const newTemplate = {
        id: 'ai_' + Date.now(),
        title: resData.data.title || 'AI Generated Template',
        platform: resData.data.platform || templatePlatform,
        template: resData.data.template || '',
        variables: resData.data.variables || ['brand', 'product', 'discount', 'cta', 'link'],
        projectId: selectedProjectId,
        tenantId: user.uid,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'social_templates'), newTemplate);
      const savedTemplate = { ...newTemplate, id: docRef.id };
      setSelectedTemplate(savedTemplate);

      await projectService.logActivity(
        `Generated AI social media template: "${savedTemplate.title}"`,
        'social_template_generate',
        selectedProjectId,
        user.uid
      );

      setTemplateTopic('');
    } catch (err: any) {
      console.error(err);
      alert('Failed to generate template: ' + (err.message || err));
    } finally {
      setTemplateLoading(false);
    }
  };

  const renderLiveReplacedText = (templateText: string) => {
    if (!templateText) return '';
    let result = templateText;
    Object.keys(liveVariables).forEach(key => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
      result = result.replace(regex, liveVariables[key] || `{{${key}}}`);
    });
    return result;
  };

  // Fetch chronological activities for recent feed (filtered by user tenant)
  const [activitiesSnapshot, activitiesLoading] = useCollection(
    user ? query(collection(db, 'activities'), where('tenantId', '==', user.uid)) : null
  );
  const activities = activitiesSnapshot?.docs.map(doc => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      createdAtDate: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
    };
  }).sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()) || [];

  // Activity Feed Filter & Quick Gemini API Test States
  const [testGeminiPrompt, setTestGeminiPrompt] = useState('');
  const [testGeminiLoading, setTestGeminiLoading] = useState(false);
  const [testGeminiResult, setTestGeminiResult] = useState<string | null>(null);

  // Clear all recent activity log entries from Firestore
  const handleClearAllActivities = async () => {
    if (!user || activities.length === 0) return;
    if (!confirm('Are you sure you want to clear all recent activity logs from Firestore?')) return;
    try {
      for (const act of activities) {
        await deleteDoc(doc(db, 'activities', act.id));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'activities');
    }
  };

  // Quick Gemini API Interactive Test Handler
  const handleQuickGeminiTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testGeminiPrompt.trim() || !user) return;
    setTestGeminiLoading(true);
    setTestGeminiResult(null);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'standard',
          prompt: testGeminiPrompt.trim(),
          systemInstruction: 'You are Google Gemini AI in NISAR AI Studio. Provide a concise, accurate, and insightful response in 2-3 sentences.',
          temperature: 0.7,
          model: 'gemini-3.5-flash'
        })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setTestGeminiResult(data.text);

      // Log the Gemini API Interaction into Firestore
      const targetProject = selectedProjectId || (projects.length > 0 ? projects[0].id : 'global_workspace');
      await projectService.logActivity(
        `Gemini API Interaction: "${testGeminiPrompt.trim().substring(0, 80)}${testGeminiPrompt.trim().length > 80 ? '...' : ''}"`,
        'gemini_interaction',
        targetProject,
        user.uid
      );

      setTestGeminiPrompt('');
    } catch (err: any) {
      setTestGeminiResult(`Execution Error: ${err.message}`);
    } finally {
      setTestGeminiLoading(false);
    }
  };

  // Handle Project Creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !user) return;
    try {
      const docRef = await projectService.createProject(newProjectName.trim(), user.uid);
      if (docRef) {
        await projectService.logActivity(
          `Created workspace project "${newProjectName.trim()}"`,
          'project_create',
          docRef.id,
          user.uid
        );
        setSelectedProjectId(docRef.id);
      }
      setNewProjectName('');
      setIsCreatingProject(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Project Deletion
  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this workspace and all associated items?')) {
      try {
        await projectService.deleteProject(projectId);
        if (user) {
          await projectService.logActivity(
            'Deleted a workspace project',
            'project_delete',
            projectId,
            user.uid
          );
        }
        if (selectedProjectId === projectId) {
          setSelectedProjectId('');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Execute server-side Gemini generation for Blog & SEO Analysis
  const handleGenerateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTopic.trim() || !selectedProjectId || !user) return;

    setBlogLoading(true);
    let jobId = '';
    try {
      // 1. Create job in Firestore as "Processing"
      const jobRef = await projectService.createJob(blogTopic.trim(), selectedProjectId, user.uid, 'Processing');
      if (!jobRef) throw new Error('Failed to create job record');
      jobId = jobRef.id;
      setSelectedJobId(jobId);

      // 2. Query server-side Gemini endpoint
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'blog', topic: blogTopic.trim() }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);

      // 3. Update Firestore job with full generated data & set status to "Completed"
      const { title, metaDescription, keywords, readTime, content } = resData.data;
      await projectService.updateJob(jobId, {
        status: 'Completed',
        title: title || 'SEO Optimized Post',
        metaDescription: metaDescription || '',
        keywords: keywords || [],
        readTime: readTime || '5 min read',
        content: content || 'Failed to populate content body.',
      });

      // 4. AUTOMATICALLY save memory node for semantic SEO alignment
      try {
        const sanitizedKey = `auto_seo_${(title || 'article').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`.slice(0, 50);
        try {
          await addDoc(collection(db, 'memory'), {
            key: sanitizedKey,
            value: `SEO Keywords: ${(keywords || []).join(', ')}. Meta Description: ${metaDescription || ''}. Focus Topic: "${blogTopic.trim()}"`,
            category: 'seo_rules',
            projectId: selectedProjectId,
            tenantId: user.uid,
            createdAt: Timestamp.now(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'memory');
        }
      } catch (memErr) {
        console.error("Auto-memory save failed:", memErr);
      }

      // Log the generation activity
      await projectService.logActivity(
        `Generated SEO blog post: "${title || 'SEO Optimized Post'}"`,
        'blog_generate',
        selectedProjectId,
        user.uid
      );

      setBlogTopic('');
    } catch (err: any) {
      console.error(err);
      if (jobId) {
        await projectService.updateJob(jobId, {
          status: 'Failed',
          content: `Generation failed: ${err.message || 'Server error occurred'}`,
        });
      }
    } finally {
      setBlogLoading(false);
    }
  };

  // Execute Ecom Money Machine (Super God Prompt link optimizer)
  const handleGenerateEcom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl.trim() || !selectedProjectId || !user) return;

    setEcomLoading(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'ecom',
          url: productUrl.trim(),
          brand: brandName.trim(),
          country: targetCountry
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);

      // Save generated product suite to Firestore
      const docRef = await projectService.createProduct(
        productUrl.trim(),
        brandName.trim() || 'Generic Brand',
        targetCountry,
        selectedProjectId,
        user.uid,
        resData.data
      );

      // AUTOMATICALLY save brand context trigger and demographic info to memory collection!
      try {
        const brandKey = `auto_ecom_${(brandName.trim() || 'Generic').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_suite`.slice(0, 50);
        const audienceInfo = resData.data?.productBreakdown?.audience || 'Affiliate Buyer demographic';
        const primaryHook = resData.data?.productPage?.headline || 'High-converting title';
        try {
          await addDoc(collection(db, 'memory'), {
            key: brandKey,
            value: `Brand: ${brandName.trim() || 'Generic Brand'} (Target: ${targetCountry}). Ideal Demographics: ${audienceInfo}. Top Scroll-Stopping Headline Hook: "${primaryHook}".`,
            category: 'target_audience',
            projectId: selectedProjectId,
            tenantId: user.uid,
            createdAt: Timestamp.now(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'memory');
        }
      } catch (memErr) {
        console.error("Auto-memory save failed:", memErr);
      }

      // Log activity
      await projectService.logActivity(
        `Generated e-commerce marketing suite for "${brandName.trim() || 'Generic Brand'}"`,
        'ecom_generate',
        selectedProjectId,
        user.uid
      );

      if (docRef?.id) setSelectedProductId(docRef.id);
      setProductUrl('');
      setBrandName('');
    } catch (err: any) {
      alert(`Marketing automation engine error: ${err.message}`);
    } finally {
      setEcomLoading(false);
    }
  };

  // Create Vector Memory Node
  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryKey.trim() || !memoryValue.trim() || !selectedProjectId || !user) return;

    try {
      try {
        await addDoc(collection(db, 'memory'), {
          key: memoryKey.trim(),
          value: memoryValue.trim(),
          category: memoryCategory,
          projectId: selectedProjectId,
          tenantId: user.uid,
          createdAt: Timestamp.now(),
        });

        await projectService.logActivity(
          `Created memory rule: "${memoryKey.trim()}"`,
          'memory_create',
          selectedProjectId,
          user.uid
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'memory');
      }
      setMemoryKey('');
      setMemoryValue('');
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate Agent Browser Evolution & auto save memory
  const handleBrowserEvolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evolverInput.trim() || !selectedProjectId || !user) return;

    setEvolverLoading(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'evolve', inputSource: evolverInput.trim() }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);

      const { key, value, category, confidence } = resData.data;

      // Automatically write/save memory to Firestore!
      try {
        await addDoc(collection(db, 'memory'), {
          key: `evolved_${key}`,
          value: `${value} (Extracted with ${confidence} confidence from compatibility feed).`,
          category: category || 'brand_guidelines',
          projectId: selectedProjectId,
          tenantId: user.uid,
          createdAt: Timestamp.now(),
        });

        await projectService.logActivity(
          `Evolved memory rule: "evolved_${key}"`,
          'memory_evolve',
          selectedProjectId,
          user.uid
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'memory');
      }

      setEvolverInput('');
      alert(`🎉 Browser Evolver successful! Auto-saved memory node: evolved_${key}`);
    } catch (err: any) {
      alert(`Browser Evolver error: ${err.message}`);
    } finally {
      setEvolverLoading(false);
    }
  };

  // Schedule Social Post
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialContent.trim() || !socialTime || !selectedProjectId || !user) return;

    try {
      try {
        await addDoc(collection(db, 'social_posts'), {
          platform: socialPlatform,
          content: socialContent.trim(),
          scheduledTime: socialTime,
          status: 'Scheduled',
          projectId: selectedProjectId,
          tenantId: user.uid,
          createdAt: Timestamp.now(),
        });

        await projectService.logActivity(
          `Scheduled social media post for ${socialPlatform}`,
          'social_schedule',
          selectedProjectId,
          user.uid
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'social_posts');
      }
      setSocialContent('');
      setSocialTime('');
    } catch (err) {
      console.error(err);
    }
  };

  // Create Custom Agent
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || !agentPersona.trim() || !agentInstructions.trim() || !selectedProjectId || !user) return;

    setAgentLoading(true);
    try {
      await projectService.createAgent(
        agentName.trim(),
        agentPersona.trim(),
        agentInstructions.trim(),
        agentTemperature,
        agentModel,
        selectedProjectId,
        user.uid
      );

      await projectService.logActivity(
        `Registered custom AI agent: "${agentName.trim()}"`,
        'agent_create',
        selectedProjectId,
        user.uid
      );

      setAgentName('');
      setAgentPersona('');
      setAgentInstructions('');
      setAgentTemperature(0.7);
      setAgentModel('gemini-3.5-flash');
    } catch (err: any) {
      alert(`Failed to save agent: ${err.message}`);
    } finally {
      setAgentLoading(false);
    }
  };

  // Chat with Selected Agent inside the Sandbox
  const handleAgentChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentSandboxInput.trim() || !selectedAgentId || !selectedProjectId) return;

    const currentAgent = agents.find(a => a.id === selectedAgentId);
    if (!currentAgent) return;

    const userMessage = agentSandboxInput.trim();
    setAgentSandboxInput('');

    // Append user message immediately
    const updatedMessages = [...sandboxMessages, { role: 'user' as const, text: userMessage }];
    setSandboxMessages(updatedMessages);
    setSandboxLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'agent_chat',
          prompt: userMessage,
          history: sandboxMessages,
          systemInstruction: `Persona: ${currentAgent.persona}\n\nInstructions: ${currentAgent.instructions}`,
          temperature: currentAgent.temperature,
          model: currentAgent.model
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);

      setSandboxMessages([...updatedMessages, { role: 'model', text: resData.text }]);

      // Log Gemini API Interaction to Firestore
      if (user) {
        const targetProj = selectedProjectId || (projects.length > 0 ? projects[0].id : 'global_workspace');
        await projectService.logActivity(
          `Gemini API Interaction (${currentAgent.name}): "${userMessage.substring(0, 60)}${userMessage.length > 60 ? '...' : ''}"`,
          'gemini_interaction',
          targetProj,
          user.uid
        );
      }
    } catch (err: any) {
      setSandboxMessages([...updatedMessages, { role: 'model', text: `⚠️ Agent execution error: ${err.message}` }]);
    } finally {
      setSandboxLoading(false);
    }
  };

  // Delete a specific activity log entry
  const handleDeleteActivity = async (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this activity log entry?')) return;
    try {
      await deleteDoc(doc(db, 'activities', activityId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `activities/${activityId}`);
    }
  };

  // Global search filtering
  const searchResults = React.useMemo(() => {
    const queryStr = globalSearchQuery.trim().toLowerCase();
    if (!queryStr) return { projects: [], agents: [], templates: [], automation: [], activities: [] };

    const matchedProjects = projects.filter(p => 
      p.name?.toLowerCase().includes(queryStr)
    );

    const matchedAgents = allAgents.filter(a => 
      a.name?.toLowerCase().includes(queryStr) ||
      a.persona?.toLowerCase().includes(queryStr) ||
      a.instructions?.toLowerCase().includes(queryStr)
    );

    const matchedTemplates = allAvailableTemplates.filter(t => 
      t.title?.toLowerCase().includes(queryStr) ||
      t.template?.toLowerCase().includes(queryStr) ||
      t.platform?.toLowerCase().includes(queryStr)
    ).map(t => ({
      id: t.id,
      title: t.title || 'Untitled Template',
      subtitle: `AI Template • ${t.platform || 'Cross-Platform'}`,
      type: 'template',
      projectId: t.projectId || selectedProjectId || (projects[0] ? projects[0].id : ''),
      raw: t
    }));

    // Combine jobs (SEO Factory), products (Ecom funnel), and schedules (social posts) into Automation items
    const matchedJobs = allJobs.filter(j => 
      j.topic?.toLowerCase().includes(queryStr) ||
      j.title?.toLowerCase().includes(queryStr) ||
      j.status?.toLowerCase().includes(queryStr)
    ).map(j => ({
      id: j.id,
      title: j.topic || j.title || 'Untitled Blog Job',
      subtitle: `SEO Blog • ${j.status || 'Queued'}`,
      type: 'blog',
      projectId: j.projectId,
      raw: j
    }));

    const matchedProducts = allProducts.filter(p => 
      p.brand?.toLowerCase().includes(queryStr) ||
      p.url?.toLowerCase().includes(queryStr) ||
      p.country?.toLowerCase().includes(queryStr)
    ).map(p => ({
      id: p.id,
      title: p.brand || 'Unnamed Funnel',
      subtitle: `Ecom Funnel • Target: ${p.country || 'Global'}`,
      type: 'ecom',
      projectId: p.projectId,
      raw: p
    }));

    const matchedSchedules = allSchedules.filter(s => 
      s.platform?.toLowerCase().includes(queryStr) ||
      s.content?.toLowerCase().includes(queryStr)
    ).map(s => ({
      id: s.id,
      title: s.content || 'Scheduled social post',
      subtitle: `Social Post • Platform: ${s.platform}`,
      type: 'social',
      projectId: s.projectId,
      raw: s
    }));

    const matchedMemories = allMemories.filter(m => 
      m.key?.toLowerCase().includes(queryStr) ||
      m.value?.toLowerCase().includes(queryStr) ||
      m.category?.toLowerCase().includes(queryStr)
    ).map(m => ({
      id: m.id,
      title: m.key || 'Memory Node',
      subtitle: `AI Memory • Category: ${m.category?.replace('_', ' ')}`,
      type: 'memory',
      projectId: m.projectId,
      raw: m
    }));

    const matchedActivities = activities.filter(act => 
      act.description?.toLowerCase().includes(queryStr) ||
      act.type?.toLowerCase().includes(queryStr)
    ).slice(0, 8); // Keep activity logs capped so they don't dominate search

    return {
      projects: matchedProjects,
      agents: matchedAgents,
      templates: matchedTemplates,
      automation: [...matchedJobs, ...matchedProducts, ...matchedSchedules, ...matchedMemories],
      activities: matchedActivities
    };
  }, [globalSearchQuery, projects, allAgents, allAvailableTemplates, allJobs, allProducts, allSchedules, allMemories, activities]);

  // Handle escape key and Ctrl+K command palette shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectProjectResult = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('overview');
    setGlobalSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleSelectAgentResult = (agent: any) => {
    setSelectedProjectId(agent.projectId);
    setSelectedAgentId(agent.id);
    setActiveTab('agents');
    setGlobalSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleSelectTemplateResult = (item: any) => {
    if (item.projectId) {
      setSelectedProjectId(item.projectId);
    }
    setSelectedTemplate(item.raw);
    const vars = item.raw.variables || ['brand', 'product', 'discount', 'cta', 'link'];
    const newVars: Record<string, string> = { ...liveVariables };
    vars.forEach((v: string) => {
      if (!newVars[v]) newVars[v] = `[${v}]`;
    });
    setLiveVariables(newVars);
    setActiveTab('social_templates');
    setGlobalSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleSelectAutomationResult = (item: any) => {
    setSelectedProjectId(item.projectId);
    if (item.type === 'blog') {
      setSelectedJobId(item.id);
      setActiveTab('blog');
    } else if (item.type === 'ecom') {
      setSelectedProductId(item.id);
      setActiveTab('ecom');
    } else if (item.type === 'social') {
      setActiveTab('scheduler');
    } else if (item.type === 'memory') {
      setActiveTab('memory');
    }
    setGlobalSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleSelectActivityResult = (activity: any) => {
    if (activity.projectId) {
      setSelectedProjectId(activity.projectId);
    }
    setActiveTab('overview');
    setGlobalSearchQuery('');
    setIsSearchFocused(false);
    setTimeout(() => {
      const el = document.getElementById('recent-activities-feed');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex flex-col min-h-screen text-slate-100 bg-[#0b0c10]">
      {/* Dynamic Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#12141c]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-600 rounded-lg text-white font-black tracking-wider text-xl shadow-md">
            NST
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              NISAR AI Studio
            </h1>
            <p className="text-xs text-slate-400 font-mono">Super AI Toolbox</p>
          </div>
        </div>

        {/* Global Search & Command Palette Trigger (Ctrl+K) */}
        <div className="hidden md:block flex-1 max-w-md mx-6 relative">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full bg-[#171a24] border border-slate-700 hover:border-emerald-500/50 rounded-xl px-4 py-2 pl-10 pr-12 text-sm text-slate-300 hover:text-slate-100 flex items-center justify-between text-left transition duration-150 group shadow-inner cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
              <span className="text-xs font-sans">Search tools, AI models, commands...</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-[#1e2230] text-[10px] text-slate-400 group-hover:text-emerald-400 border border-slate-700 group-hover:border-emerald-500/40 px-2.5 py-1 rounded-lg font-mono font-bold select-none transition">
              <span className="text-[10px]">Ctrl+K</span>
            </div>
          </button>
        </div>

        {/* User profile, workspace select & logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-[#1e2230] rounded-lg px-3 py-1.5 border border-slate-700">
            <span className="text-xs text-slate-400 mr-2 font-semibold font-mono">Workspace:</span>
            {projectsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <select
                className="bg-transparent text-sm text-slate-200 font-bold focus:outline-none cursor-pointer"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#1e2230] text-slate-200">
                    {p.name}
                  </option>
                ))}
                {projects.length === 0 && (
                  <option value="" disabled>No workspaces available</option>
                )}
              </select>
            )}
            <button 
              onClick={() => setIsCreatingProject(true)} 
              className="ml-3 p-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white transition"
              title="Create Workspace"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden md:flex flex-col items-end text-xs font-mono">
            <span className="text-slate-300 font-bold">{user?.displayName || user?.email}</span>
            <span className="text-emerald-400 text-[10px]">Tier: Premium Enterprise</span>
          </div>

          <a
            href="https://nisaraistudiovercel-app.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-lg transition font-semibold shadow-sm"
            title="Open Live NISAR AI Studio Deployment"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Live App</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          <button
            onClick={() => auth.signOut()}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs text-rose-400 border border-rose-950 bg-rose-950/20 hover:bg-rose-950/50 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-64 bg-[#12141c] border-r border-slate-800 p-4 space-y-1.5 hidden md:block overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500 font-bold pl-2 pb-1">
            Navigation
          </div>
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'overview' 
                ? 'bg-[#1e2230] text-emerald-400 border-l-2 border-emerald-500 font-bold' 
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Workspace Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('activity_feed')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'activity_feed' 
                ? 'bg-[#1e2230] text-emerald-400 border-l-2 border-emerald-500 font-bold' 
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Activity Feed</span>
            </div>
            {activities.length > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                {activities.length}
              </span>
            )}
          </button>

          {/* ⭐ Pinned Preferred Tools Section */}
          {favoriteToolIds.length > 0 && (
            <div className="pt-3 pb-1 border-t border-slate-800/80 my-2">
              <div className="flex items-center justify-between pl-2 pr-1 pb-1.5 text-[10px] font-mono tracking-wider uppercase text-amber-400 font-bold">
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>Pinned Tools ({favoriteToolIds.length})</span>
                </span>
              </div>
              <div className="space-y-1">
                {AI_TOOLS_CATALOG.filter(tool => favoriteToolIds.includes(tool.id)).map(tool => {
                  const ToolIcon = tool.icon;
                  return (
                    <button
                      key={`fav_side_${tool.id}`}
                      onClick={() => setActiveTab(tool.tabId)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition group ${
                        activeTab === tool.tabId
                          ? 'bg-amber-500/15 text-amber-300 border-l-2 border-amber-400 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate min-w-0 pr-1">
                        <ToolIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{tool.name}</span>
                      </div>
                      <span 
                        onClick={(e) => handleToggleFavorite(tool.id, tool.name, e)}
                        className="p-1 text-amber-400 hover:text-rose-400 transition"
                        title="Unpin from preferred suite"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-3 pb-1 border-t border-slate-800/80 my-2 text-[10px] font-mono tracking-wider uppercase text-slate-500 font-bold pl-2">
            All AI Studio Tools
          </div>

          <div className="space-y-1">
            {AI_TOOLS_CATALOG.map(tool => {
              const ToolIcon = tool.icon;
              const isFav = favoriteToolIds.includes(tool.id);
              return (
                <div key={`side_tool_${tool.id}`} className="group relative flex items-center">
                  <button
                    onClick={() => setActiveTab(tool.tabId)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      activeTab === tool.tabId
                        ? 'bg-[#1e2230] text-emerald-400 border-l-2 border-emerald-500 font-bold'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate min-w-0 pr-1">
                      <ToolIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tool.name}</span>
                    </div>
                    <span
                      onClick={(e) => handleToggleFavorite(tool.id, tool.name, e)}
                      className={`p-1 rounded transition ${
                        isFav 
                          ? 'text-amber-400 opacity-100' 
                          : 'text-slate-600 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                      }`}
                      title={isFav ? "Unfavorite tool" : "Favorite tool"}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-8 text-[10px] font-mono tracking-wider uppercase text-slate-500 font-bold pl-2 pb-2">
            System Stats
          </div>
          <div className="p-3 bg-[#171a24] rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>DB Connection:</span>
              <span className="text-emerald-400 font-bold">Online</span>
            </div>
            <div className="flex justify-between">
              <span>Sync Protocol:</span>
              <span className="text-cyan-400">gRPC Realtime</span>
            </div>
            <div className="flex justify-between">
              <span>Workspace ID:</span>
              <span className="text-slate-500 truncate max-w-[80px]">{selectedProjectId || 'None'}</span>
            </div>
          </div>
        </nav>

        {/* Workspace Display Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0d0f14]">
          {/* Mobile Global Search Spotlight */}
          <div className="block md:hidden mb-4 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search workspaces, agents, automation..."
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full bg-[#171a24] border border-slate-700 rounded-lg px-4 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
            </div>

            {isSearchFocused && (globalSearchQuery.trim().length > 0) && (
              <div className="absolute left-0 right-0 mt-2 bg-[#12141c] border border-slate-800 rounded-xl shadow-2xl z-50 max-h-[350px] overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
                
                {/* Category: Projects */}
                {searchResults.projects.length > 0 && (
                  <div className="p-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">
                      Projects ({searchResults.projects.length})
                    </div>
                    <div className="space-y-0.5">
                      {searchResults.projects.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProjectResult(p.id)}
                          className="w-full text-left flex items-center justify-between p-1.5 hover:bg-[#1e2230]/80 rounded-md group transition"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-200 truncate">{p.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category: Custom Agents */}
                {searchResults.agents.length > 0 && (
                  <div className="p-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">
                      AI Agents ({searchResults.agents.length})
                    </div>
                    <div className="space-y-0.5">
                      {searchResults.agents.map(a => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleSelectAgentResult(a)}
                          className="w-full text-left flex items-center justify-between p-1.5 hover:bg-[#1e2230]/80 rounded-md group transition"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <Bot className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-200 truncate">{a.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category: AI Templates */}
                {searchResults.templates.length > 0 && (
                  <div className="p-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">
                      AI Templates ({searchResults.templates.length})
                    </div>
                    <div className="space-y-0.5">
                      {searchResults.templates.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTemplateResult(t)}
                          className="w-full text-left flex items-center justify-between p-1.5 hover:bg-[#1e2230]/80 rounded-md group transition"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-slate-200 truncate block">{t.title}</span>
                              <span className="text-[10px] text-slate-400 truncate block">{t.subtitle}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category: Automation History */}
                {searchResults.automation.length > 0 && (
                  <div className="p-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">
                      Automation ({searchResults.automation.length})
                    </div>
                    <div className="space-y-0.5">
                      {searchResults.automation.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectAutomationResult(item)}
                          className="w-full text-left flex items-center justify-between p-1.5 hover:bg-[#1e2230]/80 rounded-md group transition"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-xs font-semibold text-slate-200 truncate">{item.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category: Activities */}
                {searchResults.activities.length > 0 && (
                  <div className="p-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">
                      Activities ({searchResults.activities.length})
                    </div>
                    <div className="space-y-0.5">
                      {searchResults.activities.map(act => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleSelectActivityResult(act)}
                          className="w-full text-left flex items-center justify-between p-1.5 hover:bg-[#1e2230]/80 rounded-md group transition"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-xs text-slate-300 truncate">{act.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty case */}
                {searchResults.projects.length === 0 &&
                 searchResults.agents.length === 0 &&
                 searchResults.templates.length === 0 &&
                 searchResults.automation.length === 0 &&
                 searchResults.activities.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-xs font-bold text-slate-400">No results found</p>
                  </div>
                )}
              </div>
            )}

            {isSearchFocused && (
              <div 
                className="fixed inset-0 bg-transparent z-40" 
                onClick={() => setIsSearchFocused(false)} 
              />
            )}
          </div>
          {/* Mobile Tab Swapper */}
          <div className="flex md:hidden overflow-x-auto space-x-2 pb-4 mb-4 border-b border-slate-800 font-mono text-xs">
            <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Overview</button>
            <button onClick={() => setActiveTab('activity_feed')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'activity_feed' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Activity Feed</button>
            <button onClick={() => setActiveTab('blog')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'blog' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Blog</button>
            <button onClick={() => setActiveTab('ecom')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'ecom' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Ecom</button>
            <button onClick={() => setActiveTab('scheduler')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'scheduler' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Social</button>
            <button onClick={() => setActiveTab('memory')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'memory' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Memory</button>
            <button onClick={() => setActiveTab('revenue')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'revenue' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Revenue</button>
            <button onClick={() => setActiveTab('agents')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'agents' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Agents</button>
            <button onClick={() => setActiveTab('builder')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'builder' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Builder</button>
          </div>

          {/* Modal / Dialog for creating a project */}
          {isCreatingProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center space-x-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <span>Create Workspace Folder</span>
                </h3>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-2">Workspace Name</label>
                    <input
                      type="text"
                      className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g. Health & Fitness Blog"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingProject(false)}
                      className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Standalone Global Tools (Super AI Toolbox, Vibe, Empire) available with or without a workspace */}
          {activeTab === 'toolbox' && (
            <div className="space-y-6">
              <SuperAiToolbox />
            </div>
          )}

          {activeTab === 'vibe' && (!currentProject || projects.length === 0) && (
            <div className="space-y-6">
              <VibeResponding />
            </div>
          )}

          {activeTab === 'empire' && (!currentProject || projects.length === 0) && (
            <div className="space-y-6">
              <EmpireRedisMonitor />
            </div>
          )}

          {/* If there are no workspaces created yet and on workspace-dependent tab */}
          {projects.length === 0 && !projectsLoading && activeTab !== 'toolbox' && activeTab !== 'vibe' && activeTab !== 'empire' && (
            <div className="flex flex-col items-center justify-center text-center py-20 bg-[#12141c] border border-slate-800 rounded-2xl max-w-2xl mx-auto p-8 shadow-xl">
              <Database className="w-16 h-16 text-emerald-500/30 mb-4 animate-pulse" />
              <h2 className="text-2xl font-black mb-2 text-slate-200">Initialize Your First Workspace</h2>
              <p className="text-sm text-slate-400 max-w-md mb-8">
                Create a project workspace first. This container stores your blog production queues, e-commerce affiliate funnels, memories, and automations.
              </p>
              <button
                onClick={() => setIsCreatingProject(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 px-6 rounded-xl font-bold transition duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Create Workspace</span>
              </button>
            </div>
          )}

          {/* Render Active Workspace Content */}
          {projects.length > 0 && currentProject && (
            <div className="space-y-6">
              
              {/* Active Project Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-[#12141c] border border-slate-800 rounded-xl">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="p-1 bg-emerald-600/15 text-emerald-400 rounded text-[10px] uppercase font-bold tracking-wider font-mono">
                      Active Workspace
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: {currentProject.id}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-100 mt-1">{currentProject.name}</h2>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  {/* Active Tool Preferred Pin Quick Action */}
                  {activeTab !== 'overview' && activeTab !== 'activity_feed' && (
                    (() => {
                      const activeTool = AI_TOOLS_CATALOG.find(t => t.tabId === activeTab);
                      if (!activeTool) return null;
                      const isFav = favoriteToolIds.includes(activeTool.id);
                      return (
                        <button
                          onClick={(e) => handleToggleFavorite(activeTool.id, activeTool.name, e)}
                          className={`flex items-center space-x-1.5 px-3 py-2 text-xs rounded-lg font-bold border transition ${
                            isFav 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-amber-300 hover:border-amber-500/40'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span>{isFav ? 'Pinned to Favorites' : 'Pin to Preferred Tools'}</span>
                        </button>
                      );
                    })()
                  )}
                  <button
                    onClick={() => handleDeleteProject(currentProject.id)}
                    className="flex items-center space-x-1 px-3 py-2 text-xs bg-rose-950/20 text-rose-400 border border-rose-950 hover:bg-rose-950/40 rounded-lg transition"
                    title="Delete Workspace"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Workspace</span>
                  </button>
                </div>
              </div>

              {/* ==================== TAB: OVERVIEW ==================== */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* ⭐ Preferred AI Tools - Stored in Firestore */}
                  <div className="p-6 bg-gradient-to-r from-[#141824] via-[#12141c] to-[#171424] border border-amber-500/30 rounded-2xl shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="p-1 bg-amber-500/20 text-amber-400 rounded text-[10px] uppercase font-bold tracking-wider font-mono border border-amber-500/30 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>Personalized Suite</span>
                          </span>
                          <span className="text-xs text-slate-400 font-mono">Synced with Firestore</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-100 mt-1 flex items-center space-x-2">
                          <span>⭐ Your Preferred AI Tools</span>
                          <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono border border-amber-500/30 font-bold">
                            {favoriteToolIds.length} Pinned
                          </span>
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Click the star icon on any tool card below or in the sidebar to pin your preferred tools at the top of your workstation interface.
                      </p>
                    </div>

                    {/* Preferred Cards Grid */}
                    {favoriteToolIds.length === 0 ? (
                      <div className="text-center py-8 bg-[#171a24]/50 border border-dashed border-slate-800 rounded-xl p-4">
                        <Star className="w-8 h-8 text-amber-500/40 mx-auto mb-2 animate-bounce" />
                        <p className="text-sm font-bold text-slate-300">No tools pinned to your preferred suite yet</p>
                        <p className="text-xs text-slate-500 mt-1">Star any tool in the directory below or in the navigation sidebar to surface it here.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {AI_TOOLS_CATALOG.filter(tool => favoriteToolIds.includes(tool.id)).map(tool => {
                          const ToolIcon = tool.icon;
                          return (
                            <div
                              key={`pref_card_${tool.id}`}
                              onClick={() => setActiveTab(tool.tabId)}
                              className={`p-4 rounded-xl border transition duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${tool.accentColor} shadow-lg hover:shadow-amber-950/20`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="p-2.5 bg-[#171a24] rounded-lg border border-slate-700 text-slate-100 group-hover:scale-105 transition">
                                    <ToolIcon className="w-5 h-5 text-amber-400" />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${tool.badgeBg}`}>
                                      {tool.badge}
                                    </span>
                                    <button
                                      onClick={(e) => handleToggleFavorite(tool.id, tool.name, e)}
                                      className="p-1 text-amber-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition"
                                      title="Unpin tool"
                                    >
                                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    </button>
                                  </div>
                                </div>
                                <h4 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition flex items-center space-x-1">
                                  <span>{tool.name}</span>
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono block mb-2">{tool.category}</span>
                                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{tool.description}</p>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                                <span>Launch Preferred Tool</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Workspace Analytics Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl relative overflow-hidden">
                      <div className="text-slate-500 text-xs font-bold font-mono uppercase">AI Blog Posts</div>
                      <div className="text-3xl font-black text-slate-100 mt-2">{jobs.length}</div>
                      <div className="text-xs text-emerald-400 font-mono mt-1 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{jobs.filter(j => j.status === 'Completed').length} Published successfully</span>
                      </div>
                    </div>

                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl">
                      <div className="text-slate-500 text-xs font-bold font-mono uppercase">Affiliate Products</div>
                      <div className="text-3xl font-black text-slate-100 mt-2">{products.length}</div>
                      <div className="text-xs text-cyan-400 font-mono mt-1">Ecom Money funnels loaded</div>
                    </div>

                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl">
                      <div className="text-slate-500 text-xs font-bold font-mono uppercase">Knowledge Nodes</div>
                      <div className="text-3xl font-black text-slate-100 mt-2">{memories.length}</div>
                      <div className="text-xs text-indigo-400 font-mono mt-1">SaaS semantic alignment memory</div>
                    </div>

                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl">
                      <div className="text-slate-500 text-xs font-bold font-mono uppercase">Schedules Queued</div>
                      <div className="text-3xl font-black text-slate-100 mt-2">{schedules.length}</div>
                      <div className="text-xs text-amber-400 font-mono mt-1">Social postings automation</div>
                    </div>

                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl">
                      <div className="text-slate-500 text-xs font-bold font-mono uppercase">Custom AI Agents</div>
                      <div className="text-3xl font-black text-slate-100 mt-2">{agents.length}</div>
                      <div className="text-xs text-teal-400 font-mono mt-1">Intelligent custom persona agents</div>
                    </div>
                  </div>

                  {/* Dual Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Jobs pipeline */}
                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <h3 className="font-bold text-slate-200 flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          <span>Blog Production Pipeline</span>
                        </h3>
                        <button onClick={() => setActiveTab('blog')} className="text-xs text-emerald-400 font-bold hover:underline">
                          Go to Factory &rarr;
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {jobsLoading && <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />}
                        {jobs.length === 0 && !jobsLoading && (
                          <p className="text-slate-500 text-sm py-4 text-center">No blog production tasks initiated yet.</p>
                        )}
                        {jobs.map(job => (
                          <div key={job.id} className="flex justify-between items-center p-3 bg-[#171a24] rounded-lg border border-slate-800">
                            <div>
                              <p className="text-sm font-bold text-slate-200 line-clamp-1">{job.topic}</p>
                              <span className="text-[10px] font-mono text-slate-500">Created {job.createdAt?.toDate().toLocaleTimeString()}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              job.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                              job.status === 'Processing' ? 'bg-amber-950 text-amber-400 border border-amber-900 animate-pulse' :
                              job.status === 'Failed' ? 'bg-rose-950 text-rose-400 border border-rose-900' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {job.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ecom Affiliates pipeline */}
                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <h3 className="font-bold text-slate-200 flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span>Affiliate Landing Copy suites</span>
                        </h3>
                        <button onClick={() => setActiveTab('ecom')} className="text-xs text-emerald-400 font-bold hover:underline">
                          Go to Funnels &rarr;
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {productsLoading && <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />}
                        {products.length === 0 && !productsLoading && (
                          <p className="text-slate-500 text-sm py-4 text-center">No affiliate marketing links analyzed yet.</p>
                        )}
                        {products.map(p => (
                          <div key={p.id} className="flex justify-between items-center p-3 bg-[#171a24] rounded-lg border border-slate-800">
                            <div className="min-w-0 flex-1 pr-4">
                              <p className="text-sm font-bold text-slate-200 truncate">{p.url}</p>
                              <span className="text-[10px] font-mono text-slate-500">Brand: {p.brand} | Region: {p.country}</span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setActiveTab('ecom');
                              }}
                              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded"
                            >
                              Open suite
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Feed */}
                  <div id="recent-activities-feed" className="p-5 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
                            <span>Recent Studio Activity</span>
                            <button
                              onClick={() => setActiveTab('activity_feed')}
                              className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 pl-2 hover:underline"
                            >
                              <span>Full Activity Feed</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </h3>
                          <p className="text-xs text-slate-400">Chronological history of your workspace actions</p>
                        </div>
                      </div>
                      
                      {/* Search Bar */}
                      <div className="relative max-w-xs w-full">
                        <input
                          type="text"
                          placeholder="Search actions..."
                          value={activitySearch}
                          onChange={(e) => setActivitySearch(e.target.value)}
                          className="w-full bg-[#171a24] border border-slate-700 rounded-lg px-3 py-1.5 pl-8 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                        />
                        <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        { id: 'all', label: 'All Activity' },
                        { id: 'projects', label: 'Projects' },
                        { id: 'agents', label: 'AI Agents' },
                        { id: 'campaigns', label: 'Campaigns' },
                        { id: 'memories', label: 'Memories' },
                        { id: 'social', label: 'Social' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActivityFilter(tab.id as any)}
                          className={`px-3 py-1 rounded-full transition font-semibold ${
                            activityFilter === tab.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#181b24] text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Timeline list */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {activitiesLoading && (
                        <div className="py-8 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                          <p className="text-xs text-slate-500 mt-2">Loading activity logs...</p>
                        </div>
                      )}

                      {!activitiesLoading && activities.length === 0 && (
                        <div className="py-12 text-center border border-dashed border-slate-800 rounded-lg">
                          <Activity className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-40" />
                          <p className="text-slate-400 text-sm font-semibold">Activity log is empty</p>
                          <p className="text-slate-500 text-xs mt-1">Actions you take in the Studio will show up here automatically.</p>
                        </div>
                      )}

                      {!activitiesLoading && activities.length > 0 && (() => {
                        const filtered = activities.filter(act => {
                          if (activitySearch.trim() !== '') {
                            const term = activitySearch.toLowerCase();
                            if (!act.description?.toLowerCase().includes(term) && !act.type?.toLowerCase().includes(term)) {
                              return false;
                            }
                          }
                          if (activityFilter === 'agents') return act.type === 'agent_create';
                          if (activityFilter === 'projects') return act.type === 'project_create' || act.type === 'project_delete';
                          if (activityFilter === 'campaigns') return act.type === 'blog_generate' || act.type === 'ecom_generate' || act.type === 'page_create' || act.type === 'page_update' || act.type === 'page_delete';
                          if (activityFilter === 'memories') return act.type === 'memory_create' || act.type === 'memory_evolve';
                          if (activityFilter === 'social') return act.type === 'social_schedule';
                          return true;
                        });

                        if (filtered.length === 0) {
                          return (
                            <p className="text-slate-500 text-sm py-8 text-center">
                              No activity logs match your filter criteria or search query.
                            </p>
                          );
                        }

                        const getActivityIcon = (type: string) => {
                          switch (type) {
                            case 'project_create': return <Database className="w-4 h-4 text-indigo-400" />;
                            case 'project_delete': return <Trash2 className="w-4 h-4 text-rose-400" />;
                            case 'blog_generate': return <BookOpen className="w-4 h-4 text-emerald-400" />;
                            case 'ecom_generate': return <Sparkles className="w-4 h-4 text-cyan-400" />;
                            case 'memory_create': return <Brain className="w-4 h-4 text-purple-400" />;
                            case 'memory_evolve': return <Zap className="w-4 h-4 text-amber-400" />;
                            case 'social_schedule': return <Calendar className="w-4 h-4 text-sky-400" />;
                            case 'agent_create': return <Bot className="w-4 h-4 text-violet-400" />;
                            case 'page_create': return <Layout className="w-4 h-4 text-pink-400" />;
                            case 'page_update': return <RefreshCw className="w-4 h-4 text-blue-400" />;
                            case 'page_delete': return <Trash2 className="w-4 h-4 text-rose-400" />;
                            default: return <Activity className="w-4 h-4 text-slate-400" />;
                          }
                        };

                        const getActivityBg = (type: string) => {
                          switch (type) {
                            case 'project_create': return 'bg-indigo-950/20 border-indigo-900/40';
                            case 'project_delete': return 'bg-rose-950/20 border-rose-900/40';
                            case 'blog_generate': return 'bg-emerald-950/20 border-emerald-900/40';
                            case 'ecom_generate': return 'bg-cyan-950/20 border-cyan-900/40';
                            case 'memory_create': return 'bg-purple-950/20 border-purple-900/40';
                            case 'memory_evolve': return 'bg-amber-950/20 border-amber-900/40';
                            case 'social_schedule': return 'bg-sky-950/20 border-sky-900/40';
                            case 'agent_create': return 'bg-violet-950/20 border-violet-900/40';
                            case 'page_create': return 'bg-pink-950/20 border-pink-900/40';
                            case 'page_update': return 'bg-blue-950/20 border-blue-900/40';
                            case 'page_delete': return 'bg-rose-950/20 border-rose-900/40';
                            default: return 'bg-slate-950/20 border-slate-900/40';
                          }
                        };

                        return filtered.map((act) => {
                          const proj = projects.find(p => p.id === act.projectId);
                          const workspaceLabel = proj ? proj.name : 'Studio Level';
                          
                          return (
                            <div
                              key={act.id}
                              className="group flex items-center justify-between p-3 bg-[#171a24]/60 hover:bg-[#171a24] rounded-lg border border-slate-800 transition duration-150"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className={`p-2 rounded-lg border ${getActivityBg(act.type)} flex items-center justify-center shrink-0`}>
                                  {getActivityIcon(act.type)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-200 line-clamp-1">{act.description}</p>
                                  <div className="flex items-center space-x-2 mt-0.5 text-[10px] font-mono text-slate-500">
                                    <span className="uppercase tracking-wider font-bold text-slate-400">{act.type?.replace('_', ' ')}</span>
                                    <span>&bull;</span>
                                    <span className="text-emerald-500 font-bold">{workspaceLabel}</span>
                                    <span>&bull;</span>
                                    <span>{act.createdAtDate.toLocaleTimeString()} {act.createdAtDate.toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => handleDeleteActivity(act.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-transparent hover:border-rose-900 rounded-md transition shrink-0 ml-2"
                                title="Delete log entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB: RECENT ACTIVITY FEED & GEMINI LOGS ==================== */}
              {activeTab === 'activity_feed' && (
                <div className="space-y-6">
                  {/* Top Header Card */}
                  <div className="p-6 bg-[#12141c] border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                          <Activity className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                            <span>Gemini API & Activity Feed</span>
                            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>Firestore Live Sync</span>
                            </span>
                          </h2>
                          <p className="text-xs text-slate-400">
                            Real-time audit log of all interactions with Google Gemini API, agent sandboxes, and studio workflows stored persistently in Firestore.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <button
                        onClick={handleClearAllActivities}
                        disabled={activities.length === 0}
                        className="px-3.5 py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/50 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge Activity Log</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Gemini API Interactive Logger */}
                  <div className="p-5 bg-[#12141c] border border-slate-800 rounded-2xl space-y-4 shadow-md">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-slate-200 text-sm">Interactive Gemini API Request Logger</h3>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 bg-slate-800/80 text-slate-300 rounded-md border border-slate-700">
                        Model: gemini-3.5-flash
                      </span>
                    </div>

                    <form onSubmit={handleQuickGeminiTest} className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 font-bold mb-1.5">
                          Execute Gemini Prompt (Logs directly to Firestore activities)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Write 3 viral hook titles for a modern AI software product..."
                            value={testGeminiPrompt}
                            onChange={(e) => setTestGeminiPrompt(e.target.value)}
                            className="flex-1 bg-[#171a24] border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="submit"
                            disabled={testGeminiLoading || !testGeminiPrompt.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-2 shrink-0"
                          >
                            {testGeminiLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Calling Gemini...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5" />
                                <span>Send Gemini Prompt</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Prompt Suggestions */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">Preset Prompts:</span>
                        {[
                          "Summarize 3 growth strategies for e-commerce stores",
                          "Generate 3 catchy blog headlines about AI automation",
                          "Write a 1-sentence tech joke for developers"
                        ].map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTestGeminiPrompt(suggestion)}
                            className="text-[10px] bg-[#181b24] hover:bg-[#202534] text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-lg px-2.5 py-1 transition"
                          >
                            "{suggestion}"
                          </button>
                        ))}
                      </div>
                    </form>

                    {testGeminiResult && (
                      <div className="p-3.5 bg-[#171a24] border border-emerald-900/40 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-bold">
                          <span>Gemini API Output Snippet:</span>
                          <span className="text-slate-500">✅ Saved to Firestore</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed font-sans">{testGeminiResult}</p>
                      </div>
                    )}
                  </div>

                  {/* Main Activity Feed Container */}
                  <div className="p-5 bg-[#12141c] border border-slate-800 rounded-2xl space-y-4">
                    {/* Filter & Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      {/* Search Bar */}
                      <div className="relative max-w-sm w-full">
                        <input
                          type="text"
                          placeholder="Search logs by keyword, prompt or model..."
                          value={activitySearch}
                          onChange={(e) => setActivitySearch(e.target.value)}
                          className="w-full bg-[#171a24] border border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      </div>

                      <div className="text-xs text-slate-400 font-mono">
                        Showing <span className="text-emerald-400 font-bold">{activities.filter(act => {
                          if (activitySearch.trim() !== '') {
                            const term = activitySearch.toLowerCase();
                            if (!act.description?.toLowerCase().includes(term) && !act.type?.toLowerCase().includes(term)) {
                              return false;
                            }
                          }
                          if (activityFilter === 'gemini_interaction') return act.type === 'gemini_interaction';
                          if (activityFilter === 'blog_generate') return act.type === 'blog_generate';
                          if (activityFilter === 'ecom_generate') return act.type === 'ecom_generate';
                          if (activityFilter === 'agent_create') return act.type === 'agent_create';
                          if (activityFilter === 'memory_evolve') return act.type === 'memory_evolve' || act.type === 'memory_create';
                          if (activityFilter === 'social_schedule') return act.type === 'social_schedule';
                          if (activityFilter === 'page_create') return act.type === 'page_create' || act.type === 'page_update';
                          return true;
                        }).length}</span> of <span className="text-slate-300 font-bold">{activities.length}</span> entries
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        { id: 'all', label: 'All Logs' },
                        { id: 'gemini_interaction', label: '⚡ Gemini API' },
                        { id: 'blog_generate', label: 'SEO Blogs' },
                        { id: 'ecom_generate', label: 'Ecom Funnels' },
                        { id: 'agent_create', label: 'AI Agents' },
                        { id: 'memory_evolve', label: 'AI Memory' },
                        { id: 'social_schedule', label: 'Social Auto' },
                        { id: 'page_create', label: 'Website Builder' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActivityFilter(tab.id as any)}
                          className={`px-3.5 py-1.5 rounded-full transition font-semibold text-xs ${
                            activityFilter === tab.id
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-[#181b24] text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Activities Timeline List */}
                    <div className="space-y-3 min-h-[300px]">
                      {activitiesLoading && (
                        <div className="py-16 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                          <p className="text-xs text-slate-500 mt-3 font-mono">Syncing real-time activity logs from Firestore...</p>
                        </div>
                      )}

                      {!activitiesLoading && activities.length === 0 && (
                        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-[#171a24]/30">
                          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-40" />
                          <p className="text-slate-300 font-bold text-base">No activity logged yet</p>
                          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                            Interactions with Gemini API, AI blog generations, agent executions, and studio actions will log here automatically in real time.
                          </p>
                        </div>
                      )}

                      {!activitiesLoading && activities.length > 0 && (() => {
                        const filtered = activities.filter(act => {
                          if (activitySearch.trim() !== '') {
                            const term = activitySearch.toLowerCase();
                            if (!act.description?.toLowerCase().includes(term) && !act.type?.toLowerCase().includes(term)) {
                              return false;
                            }
                          }
                          if (activityFilter === 'gemini_interaction') return act.type === 'gemini_interaction';
                          if (activityFilter === 'blog_generate') return act.type === 'blog_generate';
                          if (activityFilter === 'ecom_generate') return act.type === 'ecom_generate';
                          if (activityFilter === 'agent_create') return act.type === 'agent_create';
                          if (activityFilter === 'memory_evolve') return act.type === 'memory_evolve' || act.type === 'memory_create';
                          if (activityFilter === 'social_schedule') return act.type === 'social_schedule';
                          if (activityFilter === 'page_create') return act.type === 'page_create' || act.type === 'page_update';
                          return true;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="py-12 text-center text-slate-500 text-sm">
                              No activity logs match your filter criteria or search query.
                            </div>
                          );
                        }

                        const getActivityIcon = (type: string) => {
                          switch (type) {
                            case 'gemini_interaction': return <Sparkles className="w-4 h-4 text-emerald-400" />;
                            case 'project_create': return <Database className="w-4 h-4 text-indigo-400" />;
                            case 'project_delete': return <Trash2 className="w-4 h-4 text-rose-400" />;
                            case 'blog_generate': return <BookOpen className="w-4 h-4 text-teal-400" />;
                            case 'ecom_generate': return <Zap className="w-4 h-4 text-cyan-400" />;
                            case 'memory_create': return <Brain className="w-4 h-4 text-purple-400" />;
                            case 'memory_evolve': return <Zap className="w-4 h-4 text-amber-400" />;
                            case 'social_schedule': return <Calendar className="w-4 h-4 text-sky-400" />;
                            case 'agent_create': return <Bot className="w-4 h-4 text-violet-400" />;
                            case 'page_create': return <Globe className="w-4 h-4 text-pink-400" />;
                            case 'page_update': return <RefreshCw className="w-4 h-4 text-blue-400" />;
                            default: return <Activity className="w-4 h-4 text-slate-400" />;
                          }
                        };

                        const getActivityBadgeClass = (type: string) => {
                          switch (type) {
                            case 'gemini_interaction': return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
                            case 'blog_generate': return 'bg-teal-950/60 text-teal-400 border-teal-800/60';
                            case 'ecom_generate': return 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60';
                            case 'agent_create': return 'bg-violet-950/60 text-violet-400 border-violet-800/60';
                            case 'memory_evolve':
                            case 'memory_create': return 'bg-purple-950/60 text-purple-400 border-purple-800/60';
                            case 'social_schedule': return 'bg-sky-950/60 text-sky-400 border-sky-800/60';
                            case 'page_create':
                            case 'page_update': return 'bg-pink-950/60 text-pink-400 border-pink-800/60';
                            default: return 'bg-slate-900 text-slate-300 border-slate-700';
                          }
                        };

                        return filtered.map((act) => {
                          const proj = projects.find(p => p.id === act.projectId);
                          const workspaceLabel = proj ? proj.name : 'Studio Workspace';
                          
                          // Calculate relative time string
                          const now = new Date();
                          const diffMs = now.getTime() - act.createdAtDate.getTime();
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMins / 60);
                          let relativeTime = 'Just now';
                          if (diffMins > 0 && diffMins < 60) relativeTime = `${diffMins}m ago`;
                          else if (diffHours > 0 && diffHours < 24) relativeTime = `${diffHours}h ago`;
                          else if (diffHours >= 24) relativeTime = act.createdAtDate.toLocaleDateString();

                          return (
                            <div
                              key={act.id}
                              className="group flex items-center justify-between p-4 bg-[#171a24]/80 hover:bg-[#1c202d] rounded-xl border border-slate-800 hover:border-slate-700 transition duration-150 shadow-sm"
                            >
                              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                                <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${getActivityBadgeClass(act.type)}`}>
                                  {getActivityIcon(act.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${getActivityBadgeClass(act.type)}`}>
                                      {act.type?.replace('_', ' ')}
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                                      {relativeTime}
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-slate-100 mt-1 line-clamp-2 leading-snug">
                                    {act.description}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1.5 text-[10px] font-mono text-slate-500">
                                    <span className="text-emerald-400 font-bold">{workspaceLabel}</span>
                                    <span>&bull;</span>
                                    <span>{act.createdAtDate.toLocaleTimeString()} ({act.createdAtDate.toLocaleDateString()})</span>
                                    <span>&bull;</span>
                                    <span className="text-slate-600 truncate max-w-[120px]">Doc: {act.id}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => handleDeleteActivity(act.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-2 bg-rose-950/20 hover:bg-rose-900/50 text-rose-400 border border-transparent hover:border-rose-800 rounded-lg transition shrink-0 ml-3"
                                title="Delete this log entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB: SEO BLOG FACTORY ==================== */}
              {activeTab === 'blog' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Controls */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                      <h3 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                        <span>AI SEO Article Generator</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Input a topic, title ideas, or general niche keywords. The Gemini-powered Content Suite will draft an SEO-optimized article complete with search meta-tags, structural heading markdown, and keyword density mapping.
                      </p>

                      <form onSubmit={handleGenerateBlog} className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-2">Topic / Niche Phrase</label>
                          <textarea
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none h-24 resize-none"
                            placeholder="e.g. Next.js 15 App Router Best Practices, Healthy keto recipes, Artificial Intelligence trends in 2026"
                            value={blogTopic}
                            onChange={(e) => setBlogTopic(e.target.value)}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={blogLoading || !blogTopic.trim()}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold transition duration-200 shadow-md text-sm"
                        >
                          {blogLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Generating SEO Article...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Execute Production Pipeline</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Jobs List */}
                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                      <h3 className="font-bold text-slate-200">Active Production List</h3>
                      <div className="space-y-2 max-h-[350px] overflow-y-auto">
                        {jobs.map(job => (
                          <div
                            key={job.id}
                            onClick={() => setSelectedJobId(job.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${
                              selectedJobId === job.id 
                                ? 'bg-emerald-950/20 border-emerald-500' 
                                : 'bg-[#181b24] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <p className="text-sm font-bold text-slate-200 truncate">{job.topic}</p>
                              <p className="text-[10px] font-mono text-slate-500">Status: {job.status}</p>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Delete this article?')) {
                                  await projectService.deleteJob(job.id);
                                  if (selectedJobId === job.id) setSelectedJobId(null);
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {jobs.length === 0 && (
                          <p className="text-slate-500 text-xs text-center py-6">No articles created yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Preview Panel */}
                  <div className="lg:col-span-2">
                    <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 min-h-[500px] flex flex-col justify-between">
                      {selectedJobId ? (
                        (() => {
                          const job = jobs.find(j => j.id === selectedJobId);
                          if (!job) return <p className="text-slate-500 text-center my-auto">Select a blog post from the sidebar to view details</p>;

                          return (
                            <div className="space-y-6">
                              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-900">
                                      {job.status}
                                    </span>
                                    {job.readTime && (
                                      <span className="text-xs text-slate-500 font-mono">{job.readTime}</span>
                                    )}
                                  </div>
                                  <h3 className="text-xl font-extrabold text-slate-100 mt-2">{job.title || job.topic}</h3>
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(job, null, 2));
                                    alert('Copied full JSON article data to clipboard!');
                                  }}
                                  className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-[#1e2230] text-slate-200 border border-slate-700 rounded hover:bg-slate-700 transition"
                                >
                                  <Clipboard className="w-3.5 h-3.5" />
                                  <span>Copy JSON</span>
                                </button>
                              </div>

                              {job.status === 'Processing' && (
                                <div className="flex flex-col items-center justify-center py-20">
                                  <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
                                  <p className="text-sm text-slate-400 font-mono">Gemini AI is crafting and optimizing your article...</p>
                                </div>
                              )}

                              {job.status === 'Failed' && (
                                <div className="flex flex-col items-center justify-center py-20 text-rose-400">
                                  <AlertCircle className="w-10 h-10 mb-4" />
                                  <p className="text-sm font-mono text-center max-w-md">{job.content || 'Generation failed due to API limitations.'}</p>
                                </div>
                              )}

                              {job.status === 'Completed' && (
                                <div className="space-y-6">
                                  {/* Meta & SEO Specs */}
                                  <div className="p-4 bg-[#181b24] rounded-xl border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                                    <div>
                                      <span className="text-slate-500 font-bold uppercase block text-[10px]">Meta Description</span>
                                      <p className="mt-1">{job.metaDescription}</p>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 font-bold uppercase block text-[10px]">Keywords Layer</span>
                                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {job.keywords?.map((k: string, i: number) => (
                                          <span key={i} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                            {k}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Content markdown body */}
                                  <div className="prose prose-invert max-w-none text-slate-300 space-y-4">
                                    <span className="text-slate-500 font-bold uppercase block text-[10px] font-mono">Article Content (Markdown)</span>
                                    <div className="p-4 bg-[#0d0f14] border border-slate-800 rounded-xl max-h-[300px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed font-sans">
                                      {job.content}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center my-auto">
                          <Eye className="w-12 h-12 text-slate-600 mb-3" />
                          <p className="text-slate-400 font-bold text-sm">Select an article task</p>
                          <p className="text-xs text-slate-500 max-w-xs mt-1">
                            Choose an existing AI blog post or execute a new production pipeline to inspect formatted output and SEO metadata details.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB: ECOM MONEY MACHINE ==================== */}
              {activeTab === 'ecom' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left submit product URL */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                      <h3 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        <span>Link Optimizer Suite</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Input any product link (Amazon, ClickBank, Shopify, Yoovic, etc.) and run our specialized **Super God Prompt** to instantly compile a multi-channel affiliate sales structure.
                      </p>

                      <form onSubmit={handleGenerateEcom} className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Product Link / URL</label>
                          <input
                            type="url"
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            placeholder="https://amazon.com/dp/B0D12..."
                            value={productUrl}
                            onChange={(e) => setProductUrl(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Brand Name (Optional)</label>
                          <input
                            type="text"
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            placeholder="e.g. FitTrack, UltraClean"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Target Country</label>
                          <input
                            type="text"
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            placeholder="e.g. USA, UK, Global"
                            value={targetCountry}
                            onChange={(e) => setTargetCountry(e.target.value)}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={ecomLoading || !productUrl.trim()}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold transition duration-200 shadow-md text-sm"
                        >
                          {ecomLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Bootstrapping AI Empire...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Compile Ecom AI Machine</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Historical Links analyzed */}
                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                      <h3 className="font-bold text-slate-200">Analyzed Products</h3>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {products.map(p => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedProductId(p.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${
                              selectedProductId === p.id
                                ? 'bg-emerald-950/20 border-emerald-500'
                                : 'bg-[#181b24] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <p className="text-xs font-bold text-slate-200 truncate">{p.url}</p>
                              <p className="text-[10px] font-mono text-slate-500">Brand: {p.brand}</p>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Delete this product suite?')) {
                                  await projectService.deleteProduct(p.id);
                                  if (selectedProductId === p.id) setSelectedProductId(null);
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {products.length === 0 && (
                          <p className="text-slate-500 text-xs text-center py-6">No links submitted yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right preview suite info */}
                  <div className="lg:col-span-2">
                    <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 min-h-[500px]">
                      {selectedProductId ? (
                        (() => {
                          const p = products.find(prod => prod.id === selectedProductId);
                          if (!p) return <p className="text-slate-500 text-center py-20">Select a product suite to view</p>;

                          const data = p.generatedData || {};

                          return (
                            <div className="space-y-6">
                              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                                <div>
                                  <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-900 px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                                    7-Figure Funnel Suite
                                  </span>
                                  <h3 className="text-lg font-bold text-slate-200 mt-2 line-clamp-1">{p.url}</h3>
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                                    alert('Copied 10-Step Ecom Machine JSON to clipboard!');
                                  }}
                                  className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-[#1e2230] text-slate-200 border border-slate-700 rounded hover:bg-slate-700 transition"
                                >
                                  <Clipboard className="w-3.5 h-3.5" />
                                  <span>Export Copy</span>
                                </button>
                              </div>

                              {/* Accordion / Tab structure for the 10 steps */}
                              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {/* 1. Breakdown */}
                                <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg">
                                  <h4 className="text-emerald-400 font-bold text-sm flex items-center space-x-2">
                                    <span className="bg-emerald-950 px-1.5 py-0.5 rounded text-xs text-emerald-400 font-mono mr-1">1</span>
                                    <span>Product Breakdown & Triggers</span>
                                  </h4>
                                  <div className="mt-3 text-xs text-slate-300 space-y-2">
                                    <p><strong className="text-slate-400">Analysis:</strong> {data.productBreakdown?.summary}</p>
                                    <p><strong className="text-slate-400">Niche Audience:</strong> {data.productBreakdown?.audience}</p>
                                    <div>
                                      <strong className="text-slate-400">Emotional Pain Points:</strong>
                                      <ul className="list-disc list-inside pl-1 mt-1 space-y-0.5">
                                        {data.productBreakdown?.painPoints?.map((item: string, i: number) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>

                                {/* 2. Irresistible offer */}
                                <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg">
                                  <h4 className="text-cyan-400 font-bold text-sm flex items-center space-x-2">
                                    <span className="bg-cyan-950 px-1.5 py-0.5 rounded text-xs text-cyan-400 font-mono mr-1">2</span>
                                    <span>Offer & Buying Logic</span>
                                  </h4>
                                  <div className="mt-3 text-xs text-slate-300 space-y-2">
                                    <p><strong className="text-slate-400">Bundle Ideas:</strong></p>
                                    <ul className="list-disc list-inside pl-1 space-y-0.5">
                                      {data.offerCreation?.bundleIdeas?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                    </ul>
                                    <p><strong className="text-slate-400">Urgency:</strong> {data.offerCreation?.buyNowLogic}</p>
                                  </div>
                                </div>

                                {/* 3. Product page Copy */}
                                <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg">
                                  <h4 className="text-indigo-400 font-bold text-sm flex items-center space-x-2">
                                    <span className="bg-indigo-950 px-1.5 py-0.5 rounded text-xs text-indigo-400 font-mono mr-1">3</span>
                                    <span>Scroll-Stopping Landing Headline</span>
                                  </h4>
                                  <div className="mt-3 text-xs text-slate-300 space-y-2 font-mono bg-slate-950 p-3 rounded">
                                    <p className="text-emerald-400 text-sm font-bold">“ {data.productPage?.headline} ”</p>
                                    <p className="text-slate-400 text-xs mt-1">{data.productPage?.subheadline}</p>
                                  </div>
                                </div>

                                {/* 4. Social Media Scripts */}
                                <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg">
                                  <h4 className="text-purple-400 font-bold text-sm flex items-center space-x-2">
                                    <span className="bg-purple-950 px-1.5 py-0.5 rounded text-xs text-purple-400 font-mono mr-1">4</span>
                                    <span>Viral TikTok/Reels Copy & Hooks</span>
                                  </h4>
                                  <div className="mt-3 text-xs text-slate-300 space-y-2">
                                    <p className="font-bold text-slate-400">Hooks:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {data.socialMedia?.hooks?.map((h: string, i: number) => (
                                        <span key={i} className="bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">{h}</span>
                                      ))}
                                    </div>
                                    <div className="mt-2 bg-slate-950 p-2.5 rounded font-mono text-[11px] leading-relaxed max-h-[150px] overflow-y-auto">
                                      {data.socialMedia?.scripts?.map((s: string, i: number) => (
                                        <p key={i} className="mb-2 whitespace-pre-wrap">{s}</p>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* 5. Paid ads */}
                                <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg">
                                  <h4 className="text-amber-400 font-bold text-sm flex items-center space-x-2">
                                    <span className="bg-amber-950 px-1.5 py-0.5 rounded text-xs text-amber-400 font-mono mr-1">5</span>
                                    <span>Paid Ad Systems (Meta + Google)</span>
                                  </h4>
                                  <div className="mt-3 text-xs text-slate-300 space-y-3">
                                    <div>
                                      <p className="font-bold text-slate-400 mb-1">Facebook/Instagram ad copy:</p>
                                      {data.paidAds?.metaAds?.map((copy: string, i: number) => (
                                        <div key={i} className="bg-slate-950 p-2 rounded mb-1 border border-slate-800 text-[11px] font-mono">{copy}</div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* 6. Automation tool stack */}
                                <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg">
                                  <h4 className="text-teal-400 font-bold text-sm flex items-center space-x-2">
                                    <span className="bg-teal-950 px-1.5 py-0.5 rounded text-xs text-teal-400 font-mono mr-1">6</span>
                                    <span>AI Workflow & Automations</span>
                                  </h4>
                                  <ul className="list-disc list-inside mt-2 text-xs text-slate-300 space-y-1">
                                    {data.automations?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                  </ul>
                                </div>

                                {/* 7. Comment conversions */}
                                <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg">
                                  <h4 className="text-rose-400 font-bold text-sm flex items-center space-x-2">
                                    <span className="bg-rose-950 px-1.5 py-0.5 rounded text-xs text-rose-400 font-mono mr-1">7</span>
                                    <span>Comment/Objection closing script</span>
                                  </h4>
                                  <ul className="list-disc list-inside mt-2 text-xs text-slate-300 space-y-1 font-mono">
                                    {data.commentConversion?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                  </ul>
                                </div>

                                {/* 8. Traffic plan */}
                                <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg">
                                  <h4 className="text-emerald-400 font-bold text-sm flex items-center space-x-2">
                                    <span className="bg-emerald-950 px-1.5 py-0.5 rounded text-xs text-emerald-400 font-mono mr-1">8</span>
                                    <span>Target Traffic Strategy</span>
                                  </h4>
                                  <ul className="list-disc list-inside mt-2 text-xs text-slate-300 space-y-1">
                                    {data.trafficStrategy?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                  </ul>
                                </div>

                                {/* 9. Monetization expansion */}
                                <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg">
                                  <h4 className="text-cyan-400 font-bold text-sm flex items-center space-x-2">
                                    <span className="bg-cyan-950 px-1.5 py-0.5 rounded text-xs text-cyan-400 font-mono mr-1">9</span>
                                    <span>Upsell / Cross-Sell</span>
                                  </h4>
                                  <ul className="list-disc list-inside mt-2 text-xs text-slate-300 space-y-1">
                                    {data.monetization?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                  </ul>
                                </div>

                                {/* 10. Bonus Plan */}
                                <div className="p-4 bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border border-emerald-800 rounded-lg">
                                  <h4 className="text-emerald-300 font-bold text-sm flex items-center space-x-2">
                                    <span className="bg-emerald-900 px-1.5 py-0.5 rounded text-xs text-emerald-300 font-mono mr-1">10</span>
                                    <span>Empire Bonus Mode</span>
                                  </h4>
                                  <div className="mt-3 text-xs text-slate-300 space-y-2">
                                    <p>🔥 <strong className="text-slate-400">Viral content idea:</strong> {data.bonus?.viralIdea}</p>
                                    <p>💼 <strong className="text-slate-400">High income skill:</strong> {data.bonus?.highIncomeSkill}</p>
                                    <p>📅 <strong className="text-slate-400">Daily plan:</strong> {data.bonus?.dailyPlan}</p>
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center my-auto">
                          <Eye className="w-12 h-12 text-slate-600 mb-3" />
                          <p className="text-slate-400 font-bold text-sm">Select an analyzed product</p>
                          <p className="text-xs text-slate-500 max-w-xs mt-1">
                            Choose an existing compiled link funnel or execute a new Link Optimizer Suite task to inspect complete copy structures.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB: SOCIAL AUTOMATION ==================== */}
              {activeTab === 'scheduler' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Schedule Controller */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                      <h3 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        <span>Schedule Posting</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Queue and synchronize social content directly with multi-platform publishers.
                      </p>

                      <form onSubmit={handleCreateSchedule} className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Social Platform</label>
                          <select
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            value={socialPlatform}
                            onChange={(e) => setSocialPlatform(e.target.value)}
                          >
                            <option value="TikTok">TikTok / Reels</option>
                            <option value="Facebook">Facebook page</option>
                            <option value="Instagram">Instagram feed</option>
                            <option value="X">X (Twitter)</option>
                            <option value="LinkedIn">LinkedIn Business</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Post Content / Captions</label>
                          <textarea
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none h-24 resize-none"
                            placeholder="Type caption and #hashtags..."
                            value={socialContent}
                            onChange={(e) => setSocialContent(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Post Date/Time</label>
                          <input
                            type="datetime-local"
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            value={socialTime}
                            onChange={(e) => setSocialTime(e.target.value)}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm transition"
                        >
                          Queue for Auto-Posting
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right schedule lists */}
                  <div className="lg:col-span-2">
                    <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 min-h-[400px]">
                      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center space-x-2">
                        <Share2 className="w-5 h-5 text-emerald-400" />
                        <span>Active Multi-Platform Queue</span>
                      </h3>

                      <div className="space-y-3">
                        {schedules.map(post => (
                          <div key={post.id} className="p-4 bg-[#181b24] border border-slate-800 rounded-xl flex items-start justify-between">
                            <div className="space-y-1.5">
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-800 text-slate-300 font-mono">
                                  {post.platform}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  <span>{post.status}</span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans">{post.content}</p>
                              <p className="text-[10px] text-slate-500 font-mono">Scheduled: {new Date(post.scheduledTime).toLocaleString()}</p>
                            </div>
                            <button
                              onClick={async () => {
                                if (confirm('Delete this scheduled post?')) {
                                  try {
                                    await deleteDoc(doc(db, 'social_posts', post.id));
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.DELETE, `social_posts/${post.id}`);
                                  }
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {schedules.length === 0 && (
                          <div className="text-center py-20 text-slate-500">
                            <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                            <p className="text-sm font-bold">No social posts scheduled</p>
                            <p className="text-xs max-w-xs mx-auto mt-1">Use the control form to write copy and coordinate automatic publication schedules.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB: MEMORY CENTER ==================== */}
              {activeTab === 'memory' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left node writer */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                      <h3 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-emerald-400" />
                        <span>Semantic Context</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Add knowledge notes to real-time vector memories. The Gemini core agent queries these rules to ensure content is brand-aligned.
                      </p>

                      <form onSubmit={handleCreateMemory} className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Context Category</label>
                          <select
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            value={memoryCategory}
                            onChange={(e) => setMemoryCategory(e.target.value)}
                          >
                            <option value="brand_guidelines">Brand & Tone Rules</option>
                            <option value="target_audience">Target Demographic</option>
                            <option value="seo_rules">SEO & Keyword Requirements</option>
                            <option value="promotional_links">Affiliate Tracking Link rules</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Context Label (Key)</label>
                          <input
                            type="text"
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            placeholder="e.g. active_voice_preference"
                            value={memoryKey}
                            onChange={(e) => setMemoryKey(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Knowledge Details (Value)</label>
                          <textarea
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none h-24 resize-none"
                            placeholder="e.g. Always write in an engaging active voice, avoiding corporate jargon or fluff words."
                            value={memoryValue}
                            onChange={(e) => setMemoryValue(e.target.value)}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm transition"
                        >
                          Sync Context Node
                        </button>
                      </form>
                    </div>

                    {/* Gemini Agent Browser Evolver Block */}
                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                      <h3 className="text-lg font-bold text-sky-400 flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-sky-400 animate-pulse" />
                        <span>Agent Browser Evolver</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Input any raw competitor URL, blog link, or raw data feed. Gemini will simulate web crawling, compatibility-match the content, and auto-save structured memories.
                      </p>

                      <form onSubmit={handleBrowserEvolve} className="space-y-4 pt-1">
                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Source URL / Raw Feed Input</label>
                          <textarea
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-sky-500 focus:outline-none h-20 resize-none font-mono"
                            placeholder="https://competitor-blog.com/seo-trends-2026 or raw text..."
                            value={evolverInput}
                            onChange={(e) => setEvolverInput(e.target.value)}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={evolverLoading || !evolverInput.trim()}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg font-bold transition duration-200 shadow-md text-sm cursor-pointer"
                        >
                          {evolverLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Simulating Browsing & Extraction...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              <span>Execute Auto-Memory Feed</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right Nodes view */}
                  <div className="lg:col-span-2">
                    <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 min-h-[400px]">
                      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center space-x-2">
                        <Database className="w-5 h-5 text-emerald-400" />
                        <span>Active Memory Nodes</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {memories.map(m => (
                          <div key={m.id} className="p-4 bg-[#181b24] border border-slate-800 rounded-xl space-y-2 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-slate-800 text-slate-300 font-bold uppercase font-mono px-2 py-0.5 rounded border border-slate-700">
                                  {m.category?.replace('_', ' ')}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold font-mono text-emerald-400 mt-2 truncate">{m.key}</h4>
                              <p className="text-xs text-slate-300 leading-relaxed mt-1 line-clamp-3">{m.value}</p>
                            </div>
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={async () => {
                                  if (confirm('Delete this memory node?')) {
                                    try {
                                      await deleteDoc(doc(db, 'memory', m.id));
                                    } catch (err) {
                                      handleFirestoreError(err, OperationType.DELETE, `memory/${m.id}`);
                                    }
                                  }
                                }}
                                className="text-slate-500 hover:text-rose-400 text-xs font-mono"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}

                        {memories.length === 0 && (
                          <div className="md:col-span-2 text-center py-20 text-slate-500">
                            <Brain className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                            <p className="text-sm font-bold">No custom memory synced</p>
                            <p className="text-xs max-w-xs mx-auto mt-1">Add client/brand personas or custom SEO rules to contextually steer AI generations.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB: REVENUE & MRR ENGINE ==================== */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  {/* Revenue metrics cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-gradient-to-br from-[#12141c] to-[#1a1e2b] border border-slate-800 rounded-xl">
                      <div className="text-slate-500 text-xs font-bold font-mono uppercase">Monthly Recurring Revenue (MRR)</div>
                      <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mt-2">$14,850.00</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-2 block">Premium active subscribers</span>
                    </div>

                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl">
                      <div className="text-slate-500 text-xs font-bold font-mono uppercase">Affiliate Conversion Rate</div>
                      <div className="text-3xl font-black text-slate-100 mt-2">4.82%</div>
                      <span className="text-[10px] text-emerald-400 font-mono mt-2 block">&#9650; +0.4% from last week</span>
                    </div>

                    <div className="p-5 bg-[#12141c] border border-slate-800 rounded-xl">
                      <div className="text-slate-500 text-xs font-bold font-mono uppercase">AI Generation Tokens / Credits</div>
                      <div className="text-3xl font-black text-slate-100 mt-2">1,540 / 10,000</div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[15.4%]" />
                      </div>
                    </div>
                  </div>

                  {/* Funnel simulation analytics */}
                  <div className="p-6 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
                    <h3 className="text-lg font-bold text-slate-200">SaaS Plan & Subscription Limits</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      You are currently subscribed to the **Enterprise Multi-Agent Orchestration Package**. Enjoy unlimited workspaces, full-funnel affiliate templates, and gRPC sync streaming.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg">
                        <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Active Plan</span>
                        <h4 className="text-sm font-bold text-slate-100 mt-1">NISARA PRO UNLIMITED</h4>
                        <ul className="list-disc list-inside mt-2 text-xs text-slate-400 space-y-1">
                          <li>Unlimited AI blog production runs</li>
                          <li>Full "Super God Prompt" ecom pipelines</li>
                          <li>gRPC dynamic database synchronization</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-[#181b24] border border-slate-800 rounded-lg font-mono text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Next Renewal Date:</span>
                          <span className="text-slate-200">July 28, 2026</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Payment Gateway:</span>
                          <span className="text-slate-200">Stripe Secure Connect</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Subscription Status:</span>
                          <span className="text-emerald-400 font-bold">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB: AGENT BUILDER WORKSPACE ==================== */}
              {activeTab === 'agents' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Create Custom Agent Form */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 shadow-xl">
                      <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center space-x-2">
                        <Cpu className="w-5 h-5 text-emerald-400" />
                        <span>Define Custom Agent Persona</span>
                      </h3>
                      <p className="text-xs text-slate-400 mb-6">
                        Configure a persistent AI specialist with tailored behavioral guidelines, domain-specific background persona, and precise model temperature.
                      </p>

                      <form onSubmit={handleCreateAgent} className="space-y-4">
                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Agent Name</label>
                          <input
                            type="text"
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            placeholder="e.g. Tech Support Specialist"
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Background Persona / Role</label>
                          <textarea
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none h-20 resize-none"
                            placeholder="e.g. You are a highly professional customer support specialist for NISAR. Your tone is warm, polite, and technical..."
                            value={agentPersona}
                            onChange={(e) => setAgentPersona(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Specific Instructions & Limits</label>
                          <textarea
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none h-24 resize-none"
                            placeholder="e.g. 1. Always prioritize user safety. 2. Keep answers brief (under 3 sentences). 3. Avoid making claims about delivery dates."
                            value={agentInstructions}
                            onChange={(e) => setAgentInstructions(e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-400 font-bold mb-1.5 flex items-center justify-between">
                              <span>Temperature</span>
                              <span className="text-emerald-400 font-mono font-bold">{agentTemperature}</span>
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                              value={agentTemperature}
                              onChange={(e) => setAgentTemperature(parseFloat(e.target.value))}
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-slate-400 font-bold mb-1.5">Core Foundation Model</label>
                            <select
                              className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                              value={agentModel}
                              onChange={(e) => setAgentModel(e.target.value)}
                            >
                              <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                              <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite</option>
                              <option value="gemini-3.5-pro">Gemini 3.5 Pro</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={agentLoading}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-lg font-bold transition duration-200 shadow-md text-xs cursor-pointer disabled:opacity-50"
                        >
                          {agentLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Registering Agent Persona...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Register Custom AI Agent</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right Column: Registered Agents list & Chat Sandbox */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Active Agents Directory */}
                    <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 shadow-xl">
                      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-emerald-400" />
                        <span>Registered AI Agent Registry</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agents.map(agent => (
                          <div 
                            key={agent.id} 
                            className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-4 ${
                              selectedAgentId === agent.id 
                                ? 'bg-[#1a2e25]/30 border-emerald-500/50' 
                                : 'bg-[#181b24] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="text-sm font-black text-slate-100 flex items-center space-x-1.5">
                                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{agent.name}</span>
                                </h4>
                                <span className="text-[9px] bg-slate-800 text-slate-300 font-bold uppercase font-mono px-2 py-0.5 rounded border border-slate-700 text-center truncate max-w-[120px]">
                                  {agent.model}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-2 font-mono line-clamp-2">
                                <span className="text-slate-500 font-semibold">Persona:</span> {agent.persona}
                              </p>
                              <p className="text-xs text-slate-400 mt-1 font-mono line-clamp-2">
                                <span className="text-slate-500 font-semibold">Instructions:</span> {agent.instructions}
                              </p>
                              <div className="flex items-center space-x-1 mt-3 font-mono text-[10px] text-slate-500">
                                <Sliders className="w-3 h-3 text-emerald-400" />
                                <span>Temp: {agent.temperature}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                              <button
                                onClick={async () => {
                                  if (confirm('Delete this AI agent?')) {
                                    try {
                                      await projectService.deleteAgent(agent.id);
                                      if (selectedAgentId === agent.id) {
                                        setSelectedAgentId(null);
                                        setSandboxMessages([]);
                                      }
                                    } catch (err) {
                                      handleFirestoreError(err, OperationType.DELETE, `agents/${agent.id}`);
                                    }
                                  }
                                }}
                                className="text-slate-500 hover:text-rose-400 text-xs font-mono transition"
                              >
                                Delete
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedAgentId(agent.id);
                                  setSandboxMessages([]);
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition ${
                                  selectedAgentId === agent.id
                                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                }`}
                              >
                                {selectedAgentId === agent.id ? 'Sandbox Active' : 'Launch Sandbox'}
                              </button>
                            </div>
                          </div>
                        ))}

                        {agents.length === 0 && (
                          <div className="md:col-span-2 text-center py-12 text-slate-500">
                            <Bot className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                            <p className="text-sm font-bold">No custom agent personas created yet</p>
                            <p className="text-xs max-w-xs mx-auto mt-1">Configure your first custom specialist using the form on the left.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat Sandbox Testing Arena */}
                    {selectedAgentId && (
                      <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                          <div>
                            <h4 className="font-bold text-slate-100 flex items-center space-x-2">
                              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                              <span>Live Agent Sandbox Chat</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 font-mono">
                              Active Agent: {agents.find(a => a.id === selectedAgentId)?.name || 'Custom Persona'}
                            </p>
                          </div>
                          <button
                            onClick={() => setSandboxMessages([])}
                            className="text-xs text-slate-500 hover:text-slate-300 font-mono border border-slate-800 bg-[#181b24] px-2.5 py-1 rounded-lg transition"
                          >
                            Clear Conversation
                          </button>
                        </div>

                        {/* Message log */}
                        <div className="h-[280px] overflow-y-auto bg-[#181b24] border border-slate-800 rounded-xl p-4 space-y-4 font-sans text-xs">
                          {sandboxMessages.map((msg, i) => (
                            <div 
                              key={i} 
                              className={`flex flex-col space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[10px] font-mono text-slate-500">
                                {msg.role === 'user' ? 'You' : 'Agent'}
                              </span>
                              <div 
                                className={`p-3 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                                  msg.role === 'user' 
                                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                                    : 'bg-[#12141c] text-slate-200 border border-slate-800 rounded-tl-none'
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          ))}

                          {sandboxMessages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10">
                              <Bot className="w-10 h-10 text-slate-700 mb-2" />
                              <p className="text-xs font-bold">Sandbox Testing Arena Ready</p>
                              <p className="text-[10px] max-w-xs mt-1">Send a message to start communicating with your agent persona using their specialized rules.</p>
                            </div>
                          )}

                          {sandboxLoading && (
                            <div className="flex flex-col space-y-1 items-start">
                              <span className="text-[10px] font-mono text-slate-500">Agent</span>
                              <div className="p-3 rounded-xl bg-[#12141c] text-slate-400 border border-slate-800 rounded-tl-none flex items-center space-x-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                                <span className="italic font-mono text-[10px]">Thinking...</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Input form */}
                        <form onSubmit={handleAgentChat} className="flex space-x-2">
                          <input
                            type="text"
                            className="flex-1 bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            placeholder="Type a message to test your custom agent..."
                            value={agentSandboxInput}
                            onChange={(e) => setAgentSandboxInput(e.target.value)}
                            disabled={sandboxLoading}
                            required
                          />
                          <button
                            type="submit"
                            disabled={sandboxLoading || !agentSandboxInput.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold font-mono transition flex items-center space-x-1.5 cursor-pointer"
                          >
                            <span>Send</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== TAB: SOCIAL LIVE TEMPLATES ==================== */}
              {activeTab === 'social_templates' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: AI Generator & Templates Library */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* AI Template Creator */}
                    <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                      <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        <span>AI Create Template</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {`Prompt Gemini to instantly generate viral social media templates with dynamic curly-bracket variables ({{brand}}, {{product}}, {{discount}}, {{cta}}, {{link}}).`}
                      </p>

                      <form onSubmit={handleGenerateSocialTemplate} className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Template Topic / Prompt</label>
                          <input
                            type="text"
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            placeholder="e.g. AI SaaS launch with 50% early bird discount"
                            value={templateTopic}
                            onChange={(e) => setTemplateTopic(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 font-bold mb-1.5">Target Platform</label>
                          <select
                            className="w-full bg-[#181b24] border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                            value={templatePlatform}
                            onChange={(e) => setTemplatePlatform(e.target.value)}
                          >
                            <option value="Twitter/X">Twitter / X</option>
                            <option value="Instagram">Instagram</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="TikTok">TikTok / Reels</option>
                            <option value="Facebook">Facebook</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={templateLoading || !templateTopic.trim()}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold transition duration-200 shadow-md text-xs cursor-pointer"
                        >
                          {templateLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Gemini Generating Template...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Generate AI Social Template</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Templates Library List */}
                    <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                          <Share2 className="w-4 h-4 text-emerald-400" />
                          <span>Template Library ({allAvailableTemplates.length})</span>
                        </h3>
                      </div>

                      <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar">
                        {allAvailableTemplates.map((t: any) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedTemplate(t);
                              const vars = t.variables || ['brand', 'product', 'discount', 'cta', 'link'];
                              const newVars: Record<string, string> = { ...liveVariables };
                              vars.forEach((v: string) => {
                                if (!newVars[v]) newVars[v] = `[${v}]`;
                              });
                              setLiveVariables(newVars);
                            }}
                            className={`p-3.5 rounded-xl border transition cursor-pointer ${
                              selectedTemplate?.id === t.id
                                ? 'bg-[#1a2e25]/30 border-emerald-500/50'
                                : 'bg-[#181b24] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-slate-100">{t.title}</h4>
                              <span className="text-[9px] font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                                {t.platform || 'Cross-Platform'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2 font-mono line-clamp-2">
                              {t.template}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Auto-Replacement Studio */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                        <div>
                          <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-emerald-400" />
                            <span>Live Auto-Replacement Studio</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Edit live variables below to instantly auto-replace template placeholders in real-time
                          </p>
                        </div>
                        {selectedTemplate && (
                          <span className="text-xs font-mono bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded border border-emerald-900">
                            Active: {selectedTemplate.title}
                          </span>
                        )}
                      </div>

                      {selectedTemplate ? (
                        <div className="space-y-6">
                          {/* Variable Inputs */}
                          <div className="p-4 bg-[#181b24] rounded-xl border border-slate-800 space-y-4">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                              Dynamic Variables Editor
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {['brand', 'product', 'discount', 'headline', 'cta', 'link', 'date'].map((varKey) => (
                                <div key={varKey}>
                                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                                    {'{{' + varKey + '}}'}
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full bg-[#12141c] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                                    value={liveVariables[varKey] !== undefined ? liveVariables[varKey] : ''}
                                    onChange={(e) => setLiveVariables({ ...liveVariables, [varKey]: e.target.value })}
                                    placeholder={`Value for {{${varKey}}}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Raw Template Editor */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-300">Raw Template Source (with {'{{variables}}'})</label>
                            <textarea
                              rows={5}
                              className="w-full bg-[#181b24] border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono leading-relaxed"
                              value={selectedTemplate.template}
                              onChange={(e) => setSelectedTemplate({ ...selectedTemplate, template: e.target.value })}
                            />
                          </div>

                          {/* Live Replaced Preview Box */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="block text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Live Auto-Replaced Output Preview</span>
                              </label>
                              <span className="text-[10px] font-mono text-slate-500">
                                {renderLiveReplacedText(selectedTemplate.template).length} chars
                              </span>
                            </div>

                            <div className="p-4 bg-[#0d0f14] border border-emerald-500/40 rounded-xl text-slate-100 font-sans text-sm whitespace-pre-wrap leading-relaxed shadow-inner min-h-[140px]">
                              {renderLiveReplacedText(selectedTemplate.template)}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3 pt-2">
                            <button
                              onClick={() => {
                                const rendered = renderLiveReplacedText(selectedTemplate.template);
                                navigator.clipboard.writeText(rendered);
                                alert('Live auto-replaced template copied to clipboard!');
                              }}
                              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition shadow-md cursor-pointer"
                            >
                              <Clipboard className="w-3.5 h-3.5" />
                              <span>Copy Live Replaced Text</span>
                            </button>

                            <button
                              onClick={async () => {
                                if (!selectedProjectId || !user) return;
                                const rendered = renderLiveReplacedText(selectedTemplate.template);
                                try {
                                  await addDoc(collection(db, 'social_posts'), {
                                    platform: selectedTemplate.platform || 'Twitter/X',
                                    content: rendered,
                                    status: 'Scheduled',
                                    scheduledFor: Timestamp.now(),
                                    projectId: selectedProjectId,
                                    tenantId: user.uid,
                                    createdAt: Timestamp.now()
                                  });
                                  await projectService.logActivity(
                                    `Dispatched social template to automation: "${selectedTemplate.title}"`,
                                    'social_dispatch',
                                    selectedProjectId,
                                    user.uid
                                  );
                                  alert('Successfully dispatched live auto-replaced post to Social Automation!');
                                  setActiveTab('scheduler');
                                } catch (err: any) {
                                  alert('Failed to dispatch: ' + err.message);
                                }
                              }}
                              className="flex items-center space-x-2 bg-[#1e2230] hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Dispatch to Social Automation</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                          <Share2 className="w-12 h-12 text-slate-600 mb-3" />
                          <p className="text-slate-300 font-bold text-sm">Select a template from the library</p>
                          <p className="text-xs text-slate-500 max-w-sm mt-1">
                            Choose an existing preset or generate a new AI template using the prompt builder on the left to experience live auto-replacement.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB: TEMPLATE GALLERY ==================== */}
              {activeTab === 'template_gallery' && (
                <div className="space-y-6">
                  <TemplateGallery
                    selectedProjectId={selectedProjectId}
                    onSelectTemplate={(t) => {
                      setSelectedTemplate(t);
                      const vars = t.variables || ['brand', 'product', 'discount', 'cta', 'link'];
                      const newVars: Record<string, string> = { ...liveVariables };
                      vars.forEach((v: string) => {
                        if (!newVars[v]) newVars[v] = `[${v}]`;
                      });
                      setLiveVariables(newVars);
                      setActiveTab('social_templates');
                    }}
                  />
                </div>
              )}

              {/* ==================== TAB: WEBSITE BUILDER ==================== */}
              {activeTab === 'builder' && (
                <div className="space-y-6">
                  <WebsiteBuilder selectedProjectId={selectedProjectId} />
                </div>
              )}

              {/* ==================== TAB: EMPIRE OS REDIS CORE ==================== */}
              {activeTab === 'empire' && (
                <div className="space-y-6">
                  <EmpireRedisMonitor />
                </div>
              )}

              {/* ==================== TAB: SUPER AI TOOLBOX ==================== */}
              {activeTab === 'toolbox' && (
                <div className="space-y-6">
                  <SuperAiToolbox />
                </div>
              )}

              {/* ==================== TAB: VIBE RESPONDING AI SOCIAL MEDIA ==================== */}
              {activeTab === 'vibe' && (
                <div className="space-y-6">
                  <VibeResponding />
                </div>
              )}

              {/* ==================== TAB: POMELLI & GOOGLE SHEETS CHAT ==================== */}
              {activeTab === 'pomelli_sheets' && (
                <div className="space-y-6">
                  <PomelliSheetsConverter />
                </div>
              )}

              {/* ==================== TAB: AI LINK & URL CONVERTER ==================== */}
              {activeTab === 'ai_link_converter' && (
                <div className="space-y-6">
                  <AiLinkConverter />
                </div>
              )}

              {/* ==================== TAB: CHAT HISTORY SIDEBAR ==================== */}
              {activeTab === 'chat_history' && (
                <div className="space-y-6">
                  <ChatHistorySidebar selectedProjectId={selectedProjectId} />
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* Floating Preference Toast Notification */}
      {favoriteNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-[#1e2230] border border-amber-500/50 text-slate-100 px-4 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
          <span className="text-xs font-bold font-sans">{favoriteNotification}</span>
        </div>
      )}

      {/* Global Keyboard Command Palette Modal (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpen={() => setIsCommandPaletteOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        setIsCreatingProject={setIsCreatingProject}
        onClearActivities={handleClearAllActivities}
      />
    </div>
  );
}
