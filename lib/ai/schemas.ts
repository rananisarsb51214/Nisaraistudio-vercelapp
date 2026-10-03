import { ToolDefinition, ToolCategory } from '@/types/ai';

export const AI_TOOL_CATEGORIES: { id: ToolCategory; label: string; urduLabel: string; icon: string; description: string; color: string }[] = [
  {
    id: 'content',
    label: 'AI Content',
    urduLabel: 'مواد تخلیق کار',
    icon: 'FileText',
    description: 'Create high-converting social posts, viral hooks, articles, blogs, captions & ad copy.',
    color: 'emerald',
  },
  {
    id: 'video',
    label: 'AI Video',
    urduLabel: 'ویڈیو اسکرپٹس',
    icon: 'Video',
    description: 'Generate viral YouTube scripts, TikTok/Shorts scripts, Reels, storyboards & video concepts.',
    color: 'rose',
  },
  {
    id: 'marketing',
    label: 'AI Marketing',
    urduLabel: 'مارکیٹنگ و ایس ای او',
    icon: 'TrendingUp',
    description: 'Data-driven SEO strategies, keyword research, meta descriptions, campaigns & growth plans.',
    color: 'amber',
  },
  {
    id: 'business',
    label: 'AI Business',
    urduLabel: 'کاروباری منصوبہ بندی',
    icon: 'Briefcase',
    description: 'Profitable startup ideas, brand name generators, market validation & execution blueprints.',
    color: 'cyan',
  },
  {
    id: 'productivity',
    label: 'AI Productivity',
    urduLabel: 'پیداواری صلاحیت',
    icon: 'Zap',
    description: 'Instant summarizers, tone rewriters, multi-language translators, emails & prompt engineers.',
    color: 'purple',
  },
];

export const AI_TOOLS_REGISTRY: Record<string, ToolDefinition> = {
  // ==================== 1. AI CONTENT ====================
  'social-post': {
    id: 'social-post',
    name: 'Social Media Post',
    urduName: 'سوشل میڈیا پوسٹ',
    category: 'content',
    description: 'Craft engaging, high-reach posts optimized for LinkedIn, X/Twitter, Facebook, or Instagram.',
    iconName: 'Share2',
    badge: 'Popular',
    creditCost: 2,
    systemPrompt: 'You are an elite social media copywriter who crafts viral, high-engagement social media posts with strong hooks, readable pacing, authentic storytelling, and clear calls to action.',
    fields: [
      { name: 'topic', label: 'Topic or Core Message', type: 'textarea', placeholder: 'e.g., Why AI automation is essential for small agencies in 2026', required: true },
      { name: 'platform', label: 'Target Platform', type: 'select', options: [
        { label: 'LinkedIn (Thought Leadership)', value: 'linkedin' },
        { label: 'Twitter / X (Thread or Single Post)', value: 'twitter' },
        { label: 'Facebook (Community / Storytelling)', value: 'facebook' },
        { label: 'Instagram (Engaging Caption)', value: 'instagram' },
      ], defaultValue: 'linkedin' },
      { name: 'tone', label: 'Tone of Voice', type: 'select', options: [
        { label: 'Professional & Authoritative', value: 'professional' },
        { label: 'Conversational & Relatable', value: 'conversational' },
        { label: 'Bold & Provocative', value: 'bold' },
        { label: 'Inspiring & Visionary', value: 'inspiring' },
        { label: 'Humorous & Witty', value: 'humorous' },
      ], defaultValue: 'professional' },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Startup Founders, Freelancers, Digital Marketers' },
      { name: 'includeEmojis', label: 'Include Emojis & Formatting', type: 'select', options: [
        { label: 'Tasteful & Moderate', value: 'moderate' },
        { label: 'Minimal / Clean', value: 'minimal' },
        { label: 'Vibrant & Expressive', value: 'vibrant' },
      ], defaultValue: 'moderate' },
    ],
  },

  'caption': {
    id: 'caption',
    name: 'Social Caption Generator',
    urduName: 'کیپشن جنریٹر',
    category: 'content',
    description: 'Create punchy, engaging captions with matching hashtags for Reels, Shorts, and Photos.',
    iconName: 'Smile',
    creditCost: 1,
    systemPrompt: 'You are an Instagram & TikTok caption specialist who writes ultra-engaging captions that boost comment rates and shares.',
    fields: [
      { name: 'mediaDescription', label: 'What is shown in the image or video?', type: 'textarea', placeholder: 'e.g., Behind-the-scenes building our new AI software launch', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'YouTube Shorts', value: 'shorts' },
      ], defaultValue: 'instagram' },
      { name: 'goal', label: 'Goal of the Post', type: 'select', options: [
        { label: 'Drive Comments & Debate', value: 'engagement' },
        { label: 'Get DMs / Lead Generation', value: 'leads' },
        { label: 'Save / Share Resource', value: 'value' },
        { label: 'Entertain / Relate', value: 'entertainment' },
      ], defaultValue: 'engagement' },
    ],
  },

  'hook-generator': {
    id: 'hook-generator',
    name: 'Viral Hook Generator',
    urduName: 'وائرل ہک جنریٹر',
    category: 'content',
    description: 'Generate 10 psychologically irresistible first 3-second hooks and headline opening lines.',
    iconName: 'Anchor',
    badge: 'High Impact',
    creditCost: 2,
    systemPrompt: 'You are a master of audience retention and viral psychology. You generate high-converting first 3-second hooks that stop the scroll instantly using curiosity gaps, pattern interrupts, and contrarian insights.',
    fields: [
      { name: 'topic', label: 'Video or Post Subject', type: 'textarea', placeholder: 'e.g., 5 free tools that replace a $5,000 monthly marketing team', required: true },
      { name: 'style', label: 'Hook Style', type: 'select', options: [
        { label: 'All Styles (Diverse mix of 10 hooks)', value: 'mixed' },
        { label: 'Contrarian / Controversial ("Stop doing X...")', value: 'contrarian' },
        { label: 'Curiosity Gap ("The secret method no one talks about")', value: 'curiosity' },
        { label: 'Negative Frame ("The biggest mistake costing you money")', value: 'negative' },
        { label: 'Direct ROI / Value ("How to achieve X in Y minutes")', value: 'direct' },
      ], defaultValue: 'mixed' },
    ],
  },

  'cta-generator': {
    id: 'cta-generator',
    name: 'Call To Action (CTA) Studio',
    urduName: 'کال ٹو ایکشن جنریٹر',
    category: 'content',
    description: 'High-converting call to actions tailored for newsletters, sales pages, DMs, and social bios.',
    iconName: 'MousePointerClick',
    creditCost: 1,
    systemPrompt: 'You are a direct-response conversion rate optimizer who writes irresistible CTAs with urgency, value framing, and low friction.',
    fields: [
      { name: 'offer', label: 'Offer or What You Want Users To Do', type: 'textarea', placeholder: 'e.g., Download our free 2026 AI Toolbox PDF guide', required: true },
      { name: 'channel', label: 'Context / Placement', type: 'select', options: [
        { label: 'Social Media Post Ending', value: 'social' },
        { label: 'Landing Page Button & Subtext', value: 'landing_page' },
        { label: 'Email Newsletter Bottom CTA', value: 'email' },
        { label: 'YouTube Video Sign-off', value: 'video' },
      ], defaultValue: 'social' },
    ],
  },

  'hashtag-generator': {
    id: 'hashtag-generator',
    name: 'Smart Hashtag Research',
    urduName: 'ہیش ٹیگ ریسرچ',
    category: 'content',
    description: 'Generate categorized low, medium, and high-competition hashtags for maximum algorithm reach.',
    iconName: 'Hash',
    creditCost: 1,
    systemPrompt: 'You are an SEO & social algorithm specialist who clusters hashtags into High Reach, Niche Specific, and Community targeted groups.',
    fields: [
      { name: 'niche', label: 'Niche or Content Topic', type: 'text', placeholder: 'e.g., E-commerce dropshipping AI tools', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'YouTube', value: 'youtube' },
      ], defaultValue: 'instagram' },
    ],
  },

  'blog-writer': {
    id: 'blog-writer',
    name: 'Long-Form Blog Post',
    urduName: 'بلاگ پوسٹ رائٹر',
    category: 'content',
    description: 'Comprehensive, SEO-optimized blog posts complete with H2/H3 headers, intros, bullet points, and conclusions.',
    iconName: 'BookOpen',
    badge: 'Pro',
    creditCost: 4,
    systemPrompt: 'You are an expert senior content strategist and SEO writer. You write deeply researched, engaging, formatted blog articles with clear headings, structured takeaways, and original perspective.',
    fields: [
      { name: 'blogTitle', label: 'Blog Title or Topic', type: 'text', placeholder: 'e.g., Complete Guide to Building AI SaaS with Next.js and Firebase in 2026', required: true },
      { name: 'primaryKeyword', label: 'Primary Target Keyword', type: 'text', placeholder: 'e.g., AI SaaS builder Next.js' },
      { name: 'wordCount', label: 'Target Word Count', type: 'select', options: [
        { label: 'Standard (~800 - 1000 words)', value: '800' },
        { label: 'Comprehensive (~1200 - 1500 words)', value: '1400' },
        { label: 'In-Depth Pillar Guide (~2000+ words)', value: '2000' },
      ], defaultValue: '800' },
      { name: 'outline', label: 'Custom Outline / Specific Points (Optional)', type: 'textarea', placeholder: 'Leave blank for AI-generated outline or specify your subheadings' },
    ],
  },

  'article-writer': {
    id: 'article-writer',
    name: 'Authoritative Article',
    urduName: 'مضمون نگار',
    category: 'content',
    description: 'Write journalistic, analytical, or educational articles suitable for Medium, Substack, or industry press.',
    iconName: 'FileSpreadsheet',
    creditCost: 3,
    systemPrompt: 'You are an authoritative essayist and industry analyst. You write articulate, well-structured articles with logical flow, compelling narrative arcs, and evidence-based framing.',
    fields: [
      { name: 'topic', label: 'Article Topic & Premise', type: 'textarea', placeholder: 'e.g., The shift from single AI prompts to agentic multi-step tool ecosystems', required: true },
      { name: 'publicationStyle', label: 'Publication Style', type: 'select', options: [
        { label: 'Medium / Substack Tech & Business', value: 'tech_editorial' },
        { label: 'Forbes / Harvard Business Review Style', value: 'executive' },
        { label: 'Educational / Tutorial Deep-Dive', value: 'educational' },
      ], defaultValue: 'tech_editorial' },
    ],
  },

  'product-description': {
    id: 'product-description',
    name: 'E-commerce Product Description',
    urduName: 'پروڈکٹ ڈسکرپشن',
    category: 'content',
    description: 'Convert browsers into buyers with benefit-driven e-commerce descriptions for Shopify, Amazon, or Daraz.',
    iconName: 'ShoppingBag',
    creditCost: 2,
    systemPrompt: 'You are an e-commerce copywriting expert who writes compelling product descriptions highlighting unique selling points (USPs), emotional triggers, technical specifications, and purchase urgency.',
    fields: [
      { name: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g., Ultra-Ergonomic Wireless Mechanical Keyboard', required: true },
      { name: 'features', label: 'Key Features / Specs', type: 'textarea', placeholder: 'e.g., Hot-swappable switches, 200hr battery life, Bluetooth 5.3 + 2.4Ghz, CNC aluminum body', required: true },
      { name: 'targetMarket', label: 'Ideal Customer', type: 'text', placeholder: 'e.g., Remote developers, creative professionals, minimal desk setups' },
    ],
  },

  'ad-copy': {
    id: 'ad-copy',
    name: 'High-Converting Ad Copy',
    urduName: 'اشتہاری کاپی',
    category: 'content',
    description: 'Create multi-variation ad copy for Meta (Facebook/Instagram), Google Search Ads, and TikTok Ads.',
    iconName: 'Megaphone',
    badge: 'ROI Booster',
    creditCost: 3,
    systemPrompt: 'You are a high-performance media buyer and direct-response copywriter. You produce 3 distinct ad angles: Pain-Point Focus, Social Proof / Aspiration Focus, and Logical ROI / Fast Solution Focus.',
    fields: [
      { name: 'productOrService', label: 'Product / Service Description', type: 'textarea', placeholder: 'e.g., Nisar AI Studio Super AI Toolbox - 30+ AI tools in one subscription for creators', required: true },
      { name: 'adPlatform', label: 'Ad Platform', type: 'select', options: [
        { label: 'Meta Ads (Facebook & Instagram Feed/Stories)', value: 'meta' },
        { label: 'Google Search Ads (Headlines + Descriptions)', value: 'google' },
        { label: 'TikTok Ads (Fast-paced script & text overlays)', value: 'tiktok' },
      ], defaultValue: 'meta' },
      { name: 'offerDiscount', label: 'Special Offer / Guarantee (Optional)', type: 'text', placeholder: 'e.g., 50% discount for first 100 subscribers or 14-day refund guarantee' },
    ],
  },

  'content-repurposer': {
    id: 'content-repurposer',
    name: 'Content Repurposer 360°',
    urduName: 'مواد کی ملٹی فارمیٹنگ',
    category: 'content',
    description: 'Transform 1 blog or video transcript into a LinkedIn post, Twitter thread, newsletter summary, and 3 Shorts scripts.',
    iconName: 'Repeat',
    badge: 'Multi-Format',
    creditCost: 4,
    systemPrompt: 'You are a master content repurposing engine. You take a source piece of text and extract its core insights into 4 distinct distribution formats ready for publishing.',
    fields: [
      { name: 'sourceContent', label: 'Source Content (Blog, Video Transcript, or Notes)', type: 'textarea', placeholder: 'Paste your raw text, transcript, or article here...', required: true },
    ],
  },

  // ==================== 2. AI VIDEO ====================
  'youtube-script': {
    id: 'youtube-script',
    name: 'Full YouTube Video Script',
    urduName: 'یوٹیوب ویڈیو اسکرپٹ',
    category: 'video',
    description: 'Complete video script with visual cues, retention hooks, narrative pacing, timestamps, and call-to-action.',
    iconName: 'Youtube',
    badge: 'Full Script',
    creditCost: 4,
    systemPrompt: 'You are a top YouTube producer and scriptwriter with experience writing scripts for 1M+ subscriber channels. You format scripts with Visual Direction [VISUAL] and Audio Dialogue [AUDIO] for high watch-time.',
    fields: [
      { name: 'videoTitle', label: 'Video Title or Concept', type: 'text', placeholder: 'e.g., How to Build a $10,000/mo AI Agency with Zero Coding', required: true },
      { name: 'videoLength', label: 'Target Video Length', type: 'select', options: [
        { label: '5 to 8 Minutes (Fast paced, dense value)', value: '5-8' },
        { label: '8 to 12 Minutes (Deep dive, YouTube algorithm sweet spot)', value: '8-12' },
        { label: '15+ Minutes (Masterclass / Complete Guide)', value: '15+' },
      ], defaultValue: '8-12' },
      { name: 'keyPoints', label: 'Key Points to Cover', type: 'textarea', placeholder: 'e.g., Step 1: Picking niche, Step 2: Setting up Super AI Toolbox, Step 3: Outreach script' },
    ],
  },

  'shorts-script': {
    id: 'shorts-script',
    name: 'YouTube Shorts Script',
    urduName: 'شارٹس اسکرپٹ',
    category: 'video',
    description: '30-60 second rapid-fire YouTube Shorts script with word-for-word voiceover and screen overlay instructions.',
    iconName: 'Smartphone',
    creditCost: 2,
    systemPrompt: 'You write viral 45-second YouTube Shorts scripts engineered for 100%+ average percentage viewed. Include [HOOK 0-3s], [CORE RETENTION 4-35s], and [LOOP/CTA 36-45s].',
    fields: [
      { name: 'topic', label: 'Shorts Topic', type: 'text', placeholder: 'e.g., 3 hidden Google tools you did not know existed', required: true },
      { name: 'style', label: 'Style', type: 'select', options: [
        { label: 'Fast Tool Showcase / Screen Recording', value: 'showcase' },
        { label: 'Talking Head Story / Fact', value: 'story' },
        { label: 'Problem vs Solution Skit', value: 'problem_solution' },
      ], defaultValue: 'showcase' },
    ],
  },

  'reel-script': {
    id: 'reel-script',
    name: 'Instagram Reel & TikTok Script',
    urduName: 'انسٹاگرام ریل و ٹک ٹاک',
    category: 'video',
    description: 'Trendy TikTok/Reel scripts with trending audio suggestions, caption hooks, and b-roll direction.',
    iconName: 'Film',
    creditCost: 2,
    systemPrompt: 'You write high-energy Instagram Reels and TikTok scripts that leverage pattern interrupts and relatable creator humor or crisp educational hacks.',
    fields: [
      { name: 'concept', label: 'Reel Concept or Trend Idea', type: 'textarea', placeholder: 'e.g., Showing my workflow before AI vs after NISAR Super AI Toolbox', required: true },
      { name: 'vibe', label: 'Vibe & Aesthetic', type: 'select', options: [
        { label: 'Dark Mode Tech / Aesthetic Coding', value: 'tech_aesthetic' },
        { label: 'Casual / Relatable Creator', value: 'casual' },
        { label: 'High Energy / Motivation', value: 'high_energy' },
      ], defaultValue: 'tech_aesthetic' },
    ],
  },

  'story-generator': {
    id: 'story-generator',
    name: 'Story & Narrative Generator',
    urduName: 'کہانی و بیانیہ جنریٹر',
    category: 'video',
    description: 'Generate gripping stories, narrative arcs, and case studies for video documentaries or personal branding.',
    iconName: 'Clapperboard',
    creditCost: 3,
    systemPrompt: 'You are a master storyteller utilizing the Hero’s Journey and dramatic tension arcs. You construct gripping narratives with emotional resonance.',
    fields: [
      { name: 'premise', label: 'Story Premise or Protagonist Goal', type: 'textarea', placeholder: 'e.g., A student with $10 in Pakistan who built an automated freelance empire using AI', required: true },
      { name: 'tone', label: 'Tone', type: 'select', options: [
        { label: 'Cinematic & Inspiring', value: 'cinematic' },
        { label: 'Mystery / Suspenseful Investigation', value: 'mystery' },
        { label: 'Raw & Authentic Personal Diary', value: 'authentic' },
      ], defaultValue: 'cinematic' },
    ],
  },

  'video-ideas': {
    id: 'video-ideas',
    name: 'Viral Video Ideator & Titles',
    urduName: 'وائرل ویڈیو آئیڈیاز',
    category: 'video',
    description: 'Generate 15 high-CTR YouTube video concepts with title variations and clickable thumbnail ideas.',
    iconName: 'Lightbulb',
    creditCost: 2,
    systemPrompt: 'You are a YouTube algorithm strategist who creates concepts with high search volume, curiosity triggers, and thumbnail visual concepts.',
    fields: [
      { name: 'channelNiche', label: 'Your Channel Niche / Audience', type: 'text', placeholder: 'e.g., AI Coding, Web Development, Tech Career in Urdu/English', required: true },
      { name: 'recentTrendingTopic', label: 'Focus Area or Trend', type: 'text', placeholder: 'e.g., Next.js 15, Gemini 2.5, Vibe Coding, Cloud SaaS' },
    ],
  },

  // ==================== 3. AI MARKETING ====================
  'seo-strategy': {
    id: 'seo-strategy',
    name: 'Full SEO Strategy Blueprint',
    urduName: 'ایس ای او حکمت عملی',
    category: 'marketing',
    description: 'Complete on-page, programmatic SEO, and content cluster architecture for high Google rankings.',
    iconName: 'Search',
    badge: 'Deep Search',
    creditCost: 3,
    systemPrompt: 'You are a senior technical SEO consultant who builds search-engine optimized topic clusters, entity mappings, internal linking plans, and user search-intent strategies.',
    fields: [
      { name: 'businessOrDomain', label: 'Your Website / Business Domain', type: 'text', placeholder: 'e.g., Online AI tools directory for digital freelancers', required: true },
      { name: 'targetLocation', label: 'Target Geography', type: 'select', options: [
        { label: 'Global / English', value: 'global' },
        { label: 'USA / North America', value: 'usa' },
        { label: 'Pakistan / South Asia (English & Urdu context)', value: 'pakistan' },
        { label: 'Middle East / UAE', value: 'middle_east' },
      ], defaultValue: 'global' },
    ],
  },

  'keyword-research': {
    id: 'keyword-research',
    name: 'Keyword Opportunity Finder',
    urduName: 'کلیدی الفاظ کی تلاش',
    category: 'marketing',
    description: 'Identify high-intent long-tail keywords, search volume intent, search difficulty tier, and content angles.',
    iconName: 'KeyRound',
    creditCost: 2,
    systemPrompt: 'You are an SEM & Keyword Researcher. You categorize keywords into Informational, Commercial, and Transactional intents with suggested title ideas.',
    fields: [
      { name: 'seedTopic', label: 'Seed Topic / Product', type: 'text', placeholder: 'e.g., AI video script generator', required: true },
    ],
  },

  'meta-description': {
    id: 'meta-description',
    name: 'Meta Tag & SERP Optimizer',
    urduName: 'میٹا ٹیگز جنریٹر',
    category: 'marketing',
    description: 'Generate perfectly bounded 155-character meta descriptions and 60-character title tags that maximize search CTR.',
    iconName: 'Tag',
    creditCost: 1,
    systemPrompt: 'You write character-compliant, high-CTR meta titles (<60 chars) and meta descriptions (<155 chars) containing target keywords and compelling search snippets.',
    fields: [
      { name: 'pageContent', label: 'Page Purpose or Summary', type: 'textarea', placeholder: 'e.g., Pricing and feature comparison page for NISAR Super AI Toolbox', required: true },
      { name: 'primaryKeyword', label: 'Target Keyword', type: 'text', placeholder: 'e.g., AI Toolbox pricing plans' },
    ],
  },

  'marketing-plan': {
    id: 'marketing-plan',
    name: '90-Day Go-To-Market Plan',
    urduName: '۹۰ روزہ مارکیٹنگ پلان',
    category: 'marketing',
    description: 'Actionable week-by-week marketing plan covering organic social, email funnels, paid ads, and partnerships.',
    iconName: 'Target',
    badge: 'Strategy',
    creditCost: 4,
    systemPrompt: 'You are a Chief Marketing Officer (CMO) building a hyper-tactical 90-day growth engine covering Product-Led Growth, Content Funnels, Cold Outreach, and Conversion Optimization.',
    fields: [
      { name: 'productDescription', label: 'Product / SaaS / Service Details', type: 'textarea', placeholder: 'e.g., AI subscription toolbox for content creators and software developers', required: true },
      { name: 'monthlyBudget', label: 'Estimated Monthly Marketing Budget', type: 'select', options: [
        { label: '$0 - Organic & Hustle Only', value: 'zero' },
        { label: '$500 - $2,000 (Lean paid + organic)', value: 'lean' },
        { label: '$5,000+ (Aggressive growth)', value: 'aggressive' },
      ], defaultValue: 'zero' },
    ],
  },

  'campaign-ideas': {
    id: 'campaign-ideas',
    name: 'Creative Campaign Generator',
    urduName: 'تخلیقی تشہیری مہم',
    category: 'marketing',
    description: 'Generate 3 out-of-the-box marketing campaign themes, stunt ideas, and viral activation concepts.',
    iconName: 'Sparkles',
    creditCost: 2,
    systemPrompt: 'You are a creative marketing director who devises memorable guerrilla, social, and digital activation campaigns.',
    fields: [
      { name: 'brandGoal', label: 'Brand & Campaign Objective', type: 'textarea', placeholder: 'e.g., Launching a new AI tool and gaining 5,000 registered users in 30 days', required: true },
    ],
  },

  // ==================== 4. AI BUSINESS ====================
  'business-ideas': {
    id: 'business-ideas',
    name: 'Profitable Business Ideas',
    urduName: 'کاروباری آئیڈیاز',
    category: 'business',
    description: 'Discover validated micro-SaaS, digital agency, and service business ideas with low startup friction.',
    iconName: 'Rocket',
    badge: 'Founder',
    creditCost: 2,
    systemPrompt: 'You are a serial entrepreneur and venture scout. You propose high-margin, viable business opportunities with clear monetization paths and target customer personas.',
    fields: [
      { name: 'skillsOrInterests', label: 'Your Skills, Capital, or Interest Areas', type: 'textarea', placeholder: 'e.g., Web development, Next.js, social media management, $200 initial budget', required: true },
    ],
  },

  'startup-ideas': {
    id: 'startup-ideas',
    name: 'AI Startup & Micro-SaaS Matrix',
    urduName: 'اے آئی اسٹارٹ اپ آئیڈیاز',
    category: 'business',
    description: 'Analyze market gaps for AI wrappers, automation tools, and niche vertical software solutions.',
    iconName: 'Cpu',
    creditCost: 3,
    systemPrompt: 'You are a Techstars/Y Combinator style startup analyst who breaks down problem spaces, unfair advantages, tech stack suggestions, and MVP scopes.',
    fields: [
      { name: 'industry', label: 'Target Industry / Niche', type: 'text', placeholder: 'e.g., Real Estate, Digital Freelancing, E-commerce Logistics', required: true },
    ],
  },

  'product-ideas': {
    id: 'product-ideas',
    name: 'Digital Product Roadmap',
    urduName: 'ڈیجیٹل پروڈکٹ روڈ میپ',
    category: 'business',
    description: 'Brainstorm ebooks, templates, APIs, and digital product bundles that generate passive revenue.',
    iconName: 'Boxes',
    creditCost: 2,
    systemPrompt: 'You design profitable digital products with fast time-to-market and high perceived value.',
    fields: [
      { name: 'audience', label: 'Target Audience / Community', type: 'text', placeholder: 'e.g., Next.js developers, Figma UI designers, YouTube video editors', required: true },
    ],
  },

  'brand-name-generator': {
    id: 'brand-name-generator',
    name: 'Brand & SaaS Name Studio',
    urduName: 'برانڈ نام جنریٹر',
    category: 'business',
    description: 'Generate memorable, punchy, modern brand and software names with domain availability tips.',
    iconName: 'Crown',
    creditCost: 1,
    systemPrompt: 'You are a master brand naming specialist who creates modern, catchy, phonetic, and international brand names across Modern/Minimalist, Compound/Clever, and Tech/Evocative categories.',
    fields: [
      { name: 'productDescription', label: 'What does your brand or product do?', type: 'textarea', placeholder: 'e.g., Fast AI engine that generates marketing copy and social media automation', required: true },
      { name: 'stylePreference', label: 'Naming Style', type: 'select', options: [
        { label: 'All Styles (Diverse mix of 15 names)', value: 'mixed' },
        { label: 'Modern & Short (e.g., Vibe, Pulse, Apex)', value: 'modern' },
        { label: 'Compound / Descriptive (e.g., CopyCraft, ToolBase)', value: 'compound' },
        { label: 'Futuristic / Tech (e.g., NectarAI, NovaCode)', value: 'tech' },
      ], defaultValue: 'mixed' },
    ],
  },

  'business-plan': {
    id: 'business-plan',
    name: 'Executive Business Plan',
    urduName: 'بزنس پلان جنریٹر',
    category: 'business',
    description: 'Structured business blueprint with Executive Summary, Revenue Model, Cost Structure, and Risk Analysis.',
    iconName: 'PieChart',
    badge: 'Pro Blueprint',
    creditCost: 4,
    systemPrompt: 'You are an experienced business strategist who generates formal executive business plans with clear financial models, SWOT analysis, customer acquisition channels, and scalability milestones.',
    fields: [
      { name: 'businessConcept', label: 'Business Concept & Value Proposition', type: 'textarea', placeholder: 'e.g., An all-in-one AI platform providing specialized copywriting, scripting, and marketing automation for agencies in South Asia and Global markets', required: true },
      { name: 'monetizationModel', label: 'Primary Monetization Model', type: 'select', options: [
        { label: 'Monthly / Annual SaaS Subscription (Freemium)', value: 'saas' },
        { label: 'Pay-per-credit / Usage Based', value: 'credits' },
        { label: 'Service Retainer + AI Automation Tool', value: 'agency' },
      ], defaultValue: 'saas' },
    ],
  },

  // ==================== 5. AI PRODUCTIVITY ====================
  'summarizer': {
    id: 'summarizer',
    name: 'Executive Text Summarizer',
    urduName: 'خلاصہ نگار',
    category: 'productivity',
    description: 'Distill long articles, meeting notes, PDFs, and reports into bullet points and key executive takeaways.',
    iconName: 'FileText',
    creditCost: 1,
    systemPrompt: 'You are an executive summary assistant. You distill complex text into: 1. One-Sentence TL;DR, 2. Key Takeaways & Action Items, 3. Critical Data Points.',
    fields: [
      { name: 'inputText', label: 'Text to Summarize', type: 'textarea', placeholder: 'Paste your long text, meeting notes, or article here...', required: true },
      { name: 'format', label: 'Summary Format', type: 'select', options: [
        { label: 'Bullet Points & Key Takeaways', value: 'bullets' },
        { label: 'One Paragraph Executive TL;DR', value: 'paragraph' },
        { label: 'Action Items & Next Steps Only', value: 'action_items' },
      ], defaultValue: 'bullets' },
    ],
  },

  'rewriter': {
    id: 'rewriter',
    name: 'Content & Tone Rewriter',
    urduName: 'مواد ری رائٹر',
    category: 'productivity',
    description: 'Rewrite, polish, or transform any paragraph into persuasive, professional, casual, or punchy text.',
    iconName: 'PenTool',
    creditCost: 1,
    systemPrompt: 'You are a master editor and tone transformer. You improve clarity, flow, syntax, and vocabulary while preserving the original core meaning.',
    fields: [
      { name: 'inputText', label: 'Original Text', type: 'textarea', placeholder: 'Paste text you want to rewrite...', required: true },
      { name: 'targetTone', label: 'Desired Tone', type: 'select', options: [
        { label: 'More Professional & Corporate', value: 'professional' },
        { label: 'Simple, Clear & Easy to Read (Grade 7 reading level)', value: 'simplified' },
        { label: 'Persuasive & High Energy', value: 'persuasive' },
        { label: 'Casual & Friendly', value: 'casual' },
        { label: 'Academic & Formal', value: 'academic' },
      ], defaultValue: 'professional' },
    ],
  },

  'translator': {
    id: 'translator',
    name: 'Multi-Language AI Translator',
    urduName: 'کثیر لسانی مترجم',
    category: 'productivity',
    description: 'Context-aware translation preserving cultural idioms between Urdu, Roman Urdu, English, Arabic, and Hindi.',
    iconName: 'Languages',
    creditCost: 1,
    systemPrompt: 'You are an expert multi-lingual localization linguist who translates with native nuance, natural flow, and accurate cultural idioms.',
    fields: [
      { name: 'text', label: 'Text to Translate', type: 'textarea', placeholder: 'Enter text here...', required: true },
      { name: 'targetLanguage', label: 'Target Language', type: 'select', options: [
        { label: 'Urdu (اردو)', value: 'urdu' },
        { label: 'Roman Urdu (Easy Urdu in English alphabet)', value: 'roman_urdu' },
        { label: 'English (US / UK Professional)', value: 'english' },
        { label: 'Arabic (العربية)', value: 'arabic' },
        { label: 'Hindi (हिन्दी)', value: 'hindi' },
      ], defaultValue: 'urdu' },
    ],
  },

  'email-writer': {
    id: 'email-writer',
    name: 'Professional Email Composer',
    urduName: 'ای میل کمپوزر',
    category: 'productivity',
    description: 'Write high-response cold outreach, client proposals, follow-ups, and customer support emails.',
    iconName: 'Mail',
    creditCost: 2,
    systemPrompt: 'You are an executive email communication specialist who crafts crisp, polite, high-response rate emails with clear subject lines.',
    fields: [
      { name: 'purpose', label: 'Purpose of Email', type: 'textarea', placeholder: 'e.g., Pitching our software development services to an e-commerce brand owner', required: true },
      { name: 'emailType', label: 'Email Type', type: 'select', options: [
        { label: 'Cold Sales Pitch / Outreach', value: 'cold_outreach' },
        { label: 'Follow-up Email (Polite & Value-Add)', value: 'follow_up' },
        { label: 'Client Proposal / Quote Delivery', value: 'proposal' },
        { label: 'Apology / Resolution for Delay', value: 'support' },
      ], defaultValue: 'cold_outreach' },
    ],
  },

  'whatsapp-reply': {
    id: 'whatsapp-reply',
    name: 'WhatsApp & DM Quick Responder',
    urduName: 'واٹس ایپ اور ڈی ایم جوابات',
    category: 'productivity',
    description: 'Instant polite, professional, or closing replies for customer queries on WhatsApp and Instagram DMs.',
    iconName: 'MessageSquareText',
    creditCost: 1,
    systemPrompt: 'You are a conversational sales and customer care expert for WhatsApp and DMs. You provide clear, concise, friendly responses with gentle sales nudges when appropriate.',
    fields: [
      { name: 'customerMessage', label: 'Customer Message / Inquiry', type: 'textarea', placeholder: 'e.g., "Assalam o Alaikum! What is the price and how long does delivery take?"', required: true },
      { name: 'businessContext', label: 'Your Business & Price Info', type: 'text', placeholder: 'e.g., Price is 2,999 PKR, delivery takes 2 business days across Pakistan', required: true },
      { name: 'language', label: 'Language Style', type: 'select', options: [
        { label: 'Roman Urdu (Friendly & Natural)', value: 'roman_urdu' },
        { label: 'Urdu Script (اردو)', value: 'urdu' },
        { label: 'Professional English', value: 'english' },
      ], defaultValue: 'roman_urdu' },
    ],
  },

  'prompt-generator': {
    id: 'prompt-generator',
    name: 'Master Prompt Engineer',
    urduName: 'ماسٹر پرامپٹ انجینئر',
    category: 'productivity',
    description: 'Transform simple ideas into structured, high-accuracy Mega-Prompts for Gemini, ChatGPT, and Claude.',
    iconName: 'Sparkle',
    creditCost: 1,
    systemPrompt: 'You are an elite Prompt Engineer who crafts role-based, context-rich, few-shot mega-prompts with clear constraints, delimiters, and formatted output schemas.',
    fields: [
      { name: 'taskGoal', label: 'What task do you want the AI to do?', type: 'textarea', placeholder: 'e.g., Analyze competitor pricing and create a discount strategy', required: true },
      { name: 'targetModel', label: 'Target AI Model', type: 'select', options: [
        { label: 'Google Gemini 2.5 / Flash', value: 'gemini' },
        { label: 'General LLMs (Claude / ChatGPT / Gemini)', value: 'universal' },
      ], defaultValue: 'gemini' },
    ],
  },
};
