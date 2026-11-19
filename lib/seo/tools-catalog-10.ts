export type ToolStatus = 'Operational' | 'Pending Integration';

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolHowToStep {
  title: string;
  description: string;
}

export interface SeoToolDefinition {
  slug: string;
  name: string;
  tagline: string;
  endpoint: string;
  model: string;
  runtimeModel: string;
  status: ToolStatus;
  category: string;
  seoTitle: string;
  metaDescription: string;
  placeholder: string;
  samplePrompt: string;
  howToSteps: [ToolHowToStep, ToolHowToStep, ToolHowToStep];
  faqs: ToolFaqItem[];
  relatedSlugs: string[];
}

export const TOOLS_CATALOG_10: SeoToolDefinition[] = [
  {
    slug: 'ai-article-writer',
    name: 'AI Article Writer',
    tagline: 'Generate structured, search-ready long-form articles and blog guides in seconds.',
    endpoint: '/api/ai/article',
    model: 'Gemini 4 Hydrogen',
    runtimeModel: 'gemini-4-hydrogen',
    status: 'Operational',
    category: 'Content & Blogging',
    seoTitle: 'AI Article Writer Free — SEO Blog Generator',
    metaDescription:
      'Generate long-form, SEO-optimized articles and blog posts in seconds with our AI Article Writer. Fast, human-like drafts built for ranking.',
    placeholder: 'Enter your article topic, target keywords, audience, and preferred word count...',
    samplePrompt:
      'Write a comprehensive SEO article on "How Small Businesses in Pakistan Can Automate Customer Support with AI Agents in 2026". Include H2 headings, bullet takeaways, and an FAQ.',
    howToSteps: [
      {
        title: 'Enter Topic & Keywords',
        description: 'Provide your main blog title, target search keyword, and reader persona.',
      },
      {
        title: 'Stream Gemini Draft',
        description: 'Click Run Tool to stream an H1-H3 structured article with actionable sections.',
      },
      {
        title: 'Copy & Publish',
        description: 'Use one-click Copy to paste the draft straight into WordPress, Ghost, or Next.js.',
      },
    ],
    faqs: [
      {
        question: 'Does AI Article Writer optimize headings for Google Search?',
        answer:
          'Yes. Every draft automatically organizes sections using scannable H2/H3 headings, concise summaries, and natural keyword placement.',
      },
      {
        question: 'How many free runs do I get per day?',
        answer:
          'Nisar AI Studio includes 10 daily free AI credits across the Super AI Tool Box, automatically resetting every 24 hours.',
      },
      {
        question: 'Can I pair the article with SEO metadata?',
        answer:
          'Yes, run your finished headline through the SEO Title & Metadata tool to generate high-CTR search snippets.',
      },
    ],
    relatedSlugs: ['seo-title-metadata', 'autonomous-blog-factory', 'social-copy-synthesizer'],
  },
  {
    slug: 'seo-title-metadata',
    name: 'SEO Title & Metadata',
    tagline: 'Craft click-worthy title tags, meta descriptions, and OpenGraph snippets tuned for SERP CTR.',
    endpoint: '/api/ai/seo',
    model: 'Gemini 4 Hydrogen',
    runtimeModel: 'gemini-4-hydrogen',
    status: 'Operational',
    category: 'Search Optimization',
    seoTitle: 'Free AI SEO Title & Meta Description Generator',
    metaDescription:
      'Boost your Google CTR with high-converting SEO titles and meta descriptions. Instant SERP-ready metadata powered by Gemini AI.',
    placeholder: 'Paste your page URL, primary keyword, and a brief summary of your page...',
    samplePrompt:
      'Target keyword: "AI Automation Agency Pakistan". Page offers WhatsApp bots, Next.js dashboards, and SEO workflows for ecommerce brands.',
    howToSteps: [
      {
        title: 'Provide Keyword & Topic',
        description: 'Enter your focus keyword and what makes the page valuable to searchers.',
      },
      {
        title: 'Generate SERP Variations',
        description: 'Gemini streams title options under 60 chars and meta descriptions under 160 chars.',
      },
      {
        title: 'Apply Canonical Tags',
        description: 'Copy your preferred snippet directly into your Next.js Metadata or CMS.',
      },
    ],
    faqs: [
      {
        question: 'Are character limits respected for Google snippets?',
        answer:
          'Yes, titles are framed between 45–60 characters and meta descriptions between 130–158 characters to prevent truncation.',
      },
      {
        question: 'Does it include OpenGraph and social headline ideas?',
        answer:
          'Every output delivers primary SERP tags alongside social-ready OpenGraph title and description variations.',
      },
    ],
    relatedSlugs: ['ai-article-writer', 'backlink-auto-detect', 'autonomous-blog-factory'],
  },
  {
    slug: 'hashtag-generator',
    name: 'Hashtag Generator',
    tagline: 'Discover balanced high-reach, niche, and community hashtags for TikTok, Instagram, and Shorts.',
    endpoint: '/api/ai/hashtag',
    model: 'Gemini 4 Hydrogen',
    runtimeModel: 'gemini-4-hydrogen',
    status: 'Operational',
    category: 'Social Growth',
    seoTitle: 'AI Hashtag Generator for TikTok, Instagram & YouTube',
    metaDescription:
      'Find trending, high-reach hashtags for Instagram, TikTok, YouTube Shorts, and LinkedIn in one click using our free AI Hashtag Generator.',
    placeholder: 'Describe your video, reel, product, or niche and specify platform...',
    samplePrompt:
      'TikTok & Instagram Reel showcasing a 60-second AI coding workflow in Next.js 15 for web developers and indie founders.',
    howToSteps: [
      {
        title: 'Describe Your Post',
        description: 'Share the topic, target platform, and audience language or region.',
      },
      {
        title: 'Get Tiered Hashtag Sets',
        description: 'Receive grouped High-Volume, Mid-Competition, and Hyper-Niche hashtags.',
      },
      {
        title: 'Paste Into Caption',
        description: 'Copy the curated hashtag block cleanly into your reel, short, or post.',
      },
    ],
    faqs: [
      {
        question: 'Why group hashtags by reach tier?',
        answer:
          'Mixing broad discovery tags with targeted niche hashtags helps algorithms match your content to engaged viewers first.',
      },
      {
        question: 'Which platforms are supported?',
        answer:
          'TikTok, Instagram Reels, YouTube Shorts, LinkedIn, and X (Twitter) tag counts and formats are supported.',
      },
    ],
    relatedSlugs: ['social-copy-synthesizer', 'ai-image-prompt-engine', 'affiliate-link-converter'],
  },
  {
    slug: 'autonomous-coding-agent',
    name: 'Autonomous Coding Agent',
    tagline: 'Architect clean Next.js, TypeScript, and Python modules with production error handling.',
    endpoint: '/api/ai/code',
    model: 'Gemini 4 Hydrogen',
    runtimeModel: 'gemini-4-hydrogen',
    status: 'Operational',
    category: 'Engineering & Code',
    seoTitle: 'Autonomous AI Coding Agent — Full-Stack Code Generator',
    metaDescription:
      'Build, debug, and ship full-stack features faster with our Autonomous Coding Agent. Generate clean Next.js, Python, and TypeScript code.',
    placeholder: 'Specify the feature, stack (e.g. Next.js 15, TypeScript, Tailwind, Firestore), and edge cases...',
    samplePrompt:
      'Build a TypeScript Next.js 15 Route Handler that validates incoming JSON with strict type guards and streams a response using ReadableStream.',
    howToSteps: [
      {
        title: 'Define Feature Spec',
        description: 'List your target framework, inputs/outputs, and constraints.',
      },
      {
        title: 'Stream Implementation',
        description: 'Receive typed source code, file placement guidance, and usage examples.',
      },
      {
        title: 'Review & Ship',
        description: 'Run the generated snippet through AI Code Reviewer & Optimizer for final polish.',
      },
    ],
    faqs: [
      {
        question: 'Which programming languages work best?',
        answer:
          'TypeScript, React/Next.js App Router, Node.js, Python, SQL, and Tailwind CSS are first-class citizens.',
      },
      {
        question: 'Does it include error handling and types?',
        answer:
          'Yes, outputs prioritize explicit TypeScript interfaces, input validation, and graceful error handling.',
      },
    ],
    relatedSlugs: ['ai-code-reviewer', 'ai-image-prompt-engine', 'autonomous-blog-factory'],
  },
  {
    slug: 'ai-code-reviewer',
    name: 'AI Code Reviewer & Optimizer',
    tagline: 'Pinpoint bugs, security risks, N+1 bottlenecks, and readability improvements in seconds.',
    endpoint: '/api/ai/optimizer',
    model: 'Gemini 4 Hydrogen',
    runtimeModel: 'gemini-4-hydrogen',
    status: 'Operational',
    category: 'Engineering & Code',
    seoTitle: 'AI Code Reviewer & Optimizer — Clean & Fast Code',
    metaDescription:
      'Detect bugs, security flaws, and performance bottlenecks instantly. Refactor and optimize your source code with our AI Code Reviewer.',
    placeholder: 'Paste your TypeScript, React, Python, or API route code snippet to review...',
    samplePrompt:
      'Review this pattern for security, race conditions, and React render performance: fetching user profile inside useEffect without cleanup or AbortController.',
    howToSteps: [
      {
        title: 'Paste Source Snippet',
        description: 'Drop in a function, React component, or API handler.',
      },
      {
        title: 'Inspect Audit Report',
        description: 'Get prioritized findings across Security, Performance, and Clean Architecture.',
      },
      {
        title: 'Apply Refactored Code',
        description: 'Copy the hardened, optimized replacement code directly into your repository.',
      },
    ],
    faqs: [
      {
        question: 'What issues does the code reviewer catch?',
        answer:
          'It flags missing input validation, unsafe error handling, unnecessary re-renders, memory leaks, and async race conditions.',
      },
      {
        question: 'Can it refactor JavaScript into strict TypeScript?',
        answer:
          'Yes, request TypeScript migration in your prompt to receive typed interfaces and clean signatures.',
      },
    ],
    relatedSlugs: ['autonomous-coding-agent', 'seo-title-metadata', 'ai-article-writer'],
  },
  {
    slug: 'ai-image-prompt-engine',
    name: 'Visual Studio Prompt Engine',
    tagline: 'Transform short concepts into ultra-detailed lighting, lens, and composition prompts.',
    endpoint: '/api/ai/generate-image',
    model: 'Gemini 4 Hydrogen',
    runtimeModel: 'gemini-4-hydrogen',
    status: 'Operational',
    category: 'Design & Visuals',
    seoTitle: 'Visual Studio AI Prompt Engine — Image Prompt Generator',
    metaDescription:
      'Craft ultra-detailed prompts for AI image generators. Turn simple ideas into studio-grade visual prompts for ads, thumbnails, and art.',
    placeholder: 'Describe the subject, brand mood, product style, or YouTube thumbnail concept...',
    samplePrompt:
      'Create 3 high-contrast studio visual prompts for a sleek obsidian smartwatch launch campaign with emerald rim lighting and macro water droplets.',
    howToSteps: [
      {
        title: 'Describe Your Concept',
        description: 'Enter your subject, brand colors, or campaign format (thumbnail, hero, product ad).',
      },
      {
        title: 'Synthesize Prompt Specs',
        description: 'Receive detailed lighting, camera angle, framing, and negative prompt rules.',
      },
      {
        title: 'Generate Assets',
        description: 'Copy the final prompt directly into Nova Design AI or your image studio.',
      },
    ],
    faqs: [
      {
        question: 'What details make an image prompt studio-grade?',
        answer:
          'Explicit lens focal length, directional lighting setup, surface materials, aspect ratio, and color discipline.',
      },
      {
        question: 'Does it include YouTube thumbnail & ad variations?',
        answer:
          'Yes, prompts can be tailored for 16:9 banners, 4:3 product cards, 1:1 avatars, or 9:16 social stories.',
      },
    ],
    relatedSlugs: ['social-copy-synthesizer', 'hashtag-generator', 'affiliate-link-converter'],
  },
  {
    slug: 'social-copy-synthesizer',
    name: 'Social & Copy Synthesizer',
    tagline: 'Write scroll-stopping hooks, LinkedIn threads, Facebook ad copy, and X posts in one flow.',
    endpoint: '/api/ai/social-post',
    model: 'Gemini 4 Hydrogen',
    runtimeModel: 'gemini-4-hydrogen',
    status: 'Operational',
    category: 'Marketing & Copy',
    seoTitle: 'AI Social Media Post & Ad Copy Generator',
    metaDescription:
      'Write scroll-stopping social media captions, ad copy, and viral hooks for Facebook, X, and LinkedIn in seconds with AI Copy Synthesizer.',
    placeholder: 'Describe your offer, product benefit, target audience, and desired CTA...',
    samplePrompt:
      'Launch announcement for Nisar AI Studio free 10 daily AI credits plan targeting founders, creators, and freelance developers.',
    howToSteps: [
      {
        title: 'Input Offer & Audience',
        description: 'Share what you are promoting and the core problem it solves.',
      },
      {
        title: 'Stream Multi-Channel Copy',
        description: 'Receive tailored copy variations for LinkedIn, X/Twitter, Instagram, and Paid Ads.',
      },
      {
        title: 'Add Hashtags & Links',
        description: 'Combine with Hashtag Generator and Affiliate Link Converter before posting.',
      },
    ],
    faqs: [
      {
        question: 'Does it adapt tone per social network?',
        answer:
          'Yes, outputs distinguish punchy X hooks, structured LinkedIn posts, and high-urgency ad copy.',
      },
      {
        question: 'Can I generate bilingual English and Roman Urdu hooks?',
        answer:
          'Yes, mention "Roman Urdu" or "bilingual" in your prompt to get localized campaign copy.',
      },
    ],
    relatedSlugs: ['hashtag-generator', 'ai-image-prompt-engine', 'affiliate-link-converter'],
  },
  {
    slug: 'autonomous-blog-factory',
    name: 'Autonomous Blog Factory Pipeline',
    tagline: 'Orchestrate keyword clustering, outline planning, full article drafting, and internal linking.',
    endpoint: '/api/blog-factory/run',
    model: 'Gemini 4 Hydrogen',
    runtimeModel: 'gemini-4-hydrogen',
    status: 'Operational',
    category: 'Automation Pipelines',
    seoTitle: 'Autonomous Blog Factory — Automated AI Content Pipeline',
    metaDescription:
      'Automate keyword-to-publish blogging workflows with our multi-agent AI Blog Factory Pipeline. Scale organic traffic effortlessly.',
    placeholder: 'Enter your niche, pillar topic, target region, and monetization goal...',
    samplePrompt:
      'Niche: AI SaaS Productivity Tools for Digital Agencies. Target: Organic Google traffic + affiliate software reviews.',
    howToSteps: [
      {
        title: 'Set Niche & Goal',
        description: 'Define your niche topic, target audience, and conversion objective.',
      },
      {
        title: 'Run Pipeline Stages',
        description: 'Gemini streams Topic Cluster -> Pillar Outline -> Draft Brief -> Internal Link Plan.',
      },
      {
        title: 'Export Publishing Queue',
        description: 'Copy the complete pipeline blueprint or send topics into AI Article Writer.',
      },
    ],
    faqs: [
      {
        question: 'How is Blog Factory different from a single article prompt?',
        answer:
          'It plans an interconnected content cluster, keyword intent map, internal anchor plan, and full flagship draft together.',
      },
      {
        question: 'Can I monitor jobs in the Nisar AI Studio Dashboard?',
        answer:
          'Yes, the main Studio Dashboard tracks workspace blog pipelines alongside semantic brand memories.',
      },
    ],
    relatedSlugs: ['ai-article-writer', 'seo-title-metadata', 'backlink-auto-detect'],
  },
  {
    slug: 'backlink-auto-detect',
    name: 'Backlink Auto-Detect',
    tagline: 'Inspect outbound, dofollow, nofollow, and sponsored link profiles and audit outreach strategy.',
    endpoint: '/api/ai/backlink-detect',
    model: 'Gemini 4 Hydrogen',
    runtimeModel: 'gemini-4-hydrogen',
    status: 'Pending Integration',
    category: 'SEO Intelligence',
    seoTitle: 'Backlink Auto-Detect — Free AI Backlink Checker',
    metaDescription:
      'Discover, monitor, and analyze incoming backlinks in real time. Spot toxic links and track domain authority with Backlink Auto-Detect.',
    placeholder: 'Enter a public webpage URL (https://...) or paste backlink domains to audit...',
    samplePrompt:
      'Audit backlink opportunities and toxic anchor patterns for an AI tools directory competing in Next.js and SaaS automation keywords.',
    howToSteps: [
      {
        title: 'Submit URL or Link List',
        description: 'Provide a live webpage URL or paste referring domains for audit.',
      },
      {
        title: 'Inspect Link Attributes',
        description: 'Scan detects dofollow/nofollow/sponsored signals and runs a Gemini SEO link strategy audit.',
      },
      {
        title: 'Execute Outreach Plan',
        description: 'Use the generated outreach recommendations to strengthen domain authority.',
      },
    ],
    faqs: [
      {
        question: 'Can I run a full webpage HTML crawl from the Dashboard?',
        answer:
          'Yes, the Backlink Auto-Detect workspace tab performs live HTML link extraction, CSV export, and Firestore history storage.',
      },
      {
        question: 'What happens if I paste a domain or SEO prompt here?',
        answer:
          'If a live https:// URL is provided it crawls links and streams an AI audit; otherwise it runs a focused Gemini backlink strategy review.',
      },
    ],
    relatedSlugs: ['seo-title-metadata', 'affiliate-link-converter', 'autonomous-blog-factory'],
  },
  {
    slug: 'affiliate-link-converter',
    name: 'Real-Time Affiliate Link Converter',
    tagline: 'Convert raw product URLs into tracked affiliate links with UTM tags and FTC disclosures.',
    endpoint: '/api/ai/affiliate-converter',
    model: 'Gemini 4 Hydrogen',
    runtimeModel: 'gemini-4-hydrogen',
    status: 'Pending Integration',
    category: 'Monetization',
    seoTitle: 'Real-Time Affiliate Link Converter — Monetize Content Fast',
    metaDescription:
      'Convert product URLs into tracked affiliate links automatically in real time. Maximize affiliate commissions across blogs and social posts.',
    placeholder: 'Paste a product URL (e.g. https://amazon.com/dp/...) or describe your affiliate offer...',
    samplePrompt:
      'https://www.amazon.com/dp/B09XS7JWHH?tag=old-tag-20 — convert with tracking tag nisarai-20 and write an FTC disclosure + CTA hook.',
    howToSteps: [
      {
        title: 'Paste Product URL',
        description: 'Drop in any Amazon, SaaS partner, or ecommerce product link.',
      },
      {
        title: 'Inject Tracking & Disclosures',
        description: 'Automatically formats tracking query params, Markdown/HTML snippets, and promotional copy.',
      },
      {
        title: 'Deploy Across Channels',
        description: 'Paste monetized links and hooks directly into your blog posts and social descriptions.',
      },
    ],
    faqs: [
      {
        question: 'Which affiliate tracking formats are supported?',
        answer:
          'Amazon Associates (?tag=), Impact, ClickBank, ShareASale, CJ, and custom UTM campaign tracking are supported.',
      },
      {
        question: 'Can I save converted links permanently?',
        answer:
          'Yes, the Real-Time Affiliate Converter tool inside the Studio Dashboard persists links into your Firestore Link Vault.',
      },
    ],
    relatedSlugs: ['backlink-auto-detect', 'social-copy-synthesizer', 'ai-article-writer'],
  },
];

export function getSeoToolBySlug(slug: string): SeoToolDefinition | undefined {
  return TOOLS_CATALOG_10.find((t) => t.slug === slug);
}
