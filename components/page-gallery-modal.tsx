'use client';

import React, { useState } from 'react';
import { 
  X, Sparkles, Layout, Eye, Check, Search, Globe, Zap, ArrowRight,
  ShoppingBag, Shield, Cpu, Code, Camera, Dumbbell, Home as HomeIcon,
  Utensils, GraduationCap, HeartPulse, Plane, Radio, Terminal, Calendar,
  Leaf, Coffee, Smartphone, Award
} from 'lucide-react';

export interface SiteTemplate {
  id: string;
  name: string;
  category: 'SaaS & Tech' | 'E-Commerce' | 'Agency & Business' | 'Portfolio & Personal' | 'Health & Lifestyle' | 'Crypto & Web3';
  description: string;
  accent: string;
  badge: string;
  icon: any;
  blocks: {
    id: string;
    type: string;
    content: any;
    accent: string;
  }[];
}

export const TWENTY_SITE_TEMPLATES: SiteTemplate[] = [
  {
    id: 'site_1',
    name: 'AI SaaS Copilot Pro',
    category: 'SaaS & Tech',
    description: 'High-converting SaaS landing page with Gemini AI features, pricing hooks, and trial CTA.',
    accent: '#00f5ff',
    badge: 'Popular SaaS',
    icon: Sparkles,
    blocks: [
      {
        id: 'b1_1',
        type: 'hero',
        content: {
          heading: 'Automate Enterprise Workflows with Gemini AI',
          sub: 'Deploy autonomous AI agents to handle customer inquiries, content creation, and real-time data synthesis in seconds.'
        },
        accent: '#00f5ff'
      },
      {
        id: 'b1_2',
        type: 'text',
        content: {
          body: '🚀 Built for scale: Over 10,000+ engineering teams rely on our zero-latency AI gateway to power their mission-critical applications with 99.99% uptime.'
        },
        accent: '#00f5ff'
      },
      {
        id: 'b1_3',
        type: 'image',
        content: {
          caption: 'Interactive Gemini AI Dashboard — Real-time Analytics & Neural Monitoring',
          src: 'https://picsum.photos/seed/saisaas/800/400'
        },
        accent: '#bf00ff'
      },
      {
        id: 'b1_4',
        type: 'button',
        content: {
          label: '⚡ Start 14-Day Free Enterprise Trial',
          href: '#'
        },
        accent: '#00f5ff'
      },
      {
        id: 'b1_5',
        type: 'form',
        content: {
          fields: 'Work Email, Team Size, Primary AI Model',
          buttonText: 'Request VIP Demo Access'
        },
        accent: '#00ff88'
      }
    ]
  },
  {
    id: 'site_2',
    name: 'Luxury E-Commerce Storefront',
    category: 'E-Commerce',
    description: 'Elegant product showcase with limited-edition highlights, luxury typography, and checkout form.',
    accent: '#ffd700',
    badge: 'Luxury Ecom',
    icon: ShoppingBag,
    blocks: [
      {
        id: 'b2_1',
        type: 'hero',
        content: {
          heading: 'Artisanal Craftsmanship Meets Modern Luxury',
          sub: 'Discover handcrafted Swiss timepieces and luxury leather accessories engineered for the relentless visionary.'
        },
        accent: '#ffd700'
      },
      {
        id: 'b2_2',
        type: 'image',
        content: {
          caption: 'Chronograph Edition 2026 — Sapphire Crystal & Rose Gold Finish',
          src: 'https://picsum.photos/seed/watchluxury/800/400'
        },
        accent: '#ffd700'
      },
      {
        id: 'b2_3',
        type: 'text',
        content: {
          body: '✨ Worldwide complimentary express shipping. Each piece includes a certified 10-year warranty and bespoke monogram engraving.'
        },
        accent: '#ffd700'
      },
      {
        id: 'b2_4',
        type: 'button',
        content: {
          label: '🛒 Explore Spring Collection (15% Off)',
          href: '#'
        },
        accent: '#ffd700'
      },
      {
        id: 'b2_5',
        type: 'form',
        content: {
          fields: 'Full Name, Delivery Address, VIP Discount Code',
          buttonText: 'Proceed to Secure Checkout'
        },
        accent: '#ffd700'
      }
    ]
  },
  {
    id: 'site_3',
    name: 'Cyberpunk Web3 & NFT Guild',
    category: 'Crypto & Web3',
    description: 'Futuristic dark-mode landing page with tokenomics, roadmap highlights, and wallet connection.',
    accent: '#bf00ff',
    badge: 'Web3 & NFT',
    icon: Cpu,
    blocks: [
      {
        id: 'b3_1',
        type: 'hero',
        content: {
          heading: 'Decentralized Autonomous Gaming Ecosystem',
          sub: 'Uniting 50,000+ web3 players with zero-gas staking, yield generation, and community DAO governance.'
        },
        accent: '#bf00ff'
      },
      {
        id: 'b3_2',
        type: 'text',
        content: {
          body: '⚡ Genesis Cyber Avatar Drop: 10,000 unique algorithmically generated 3D assets with in-game utility and daily $CYBER token rewards.'
        },
        accent: '#00f5ff'
      },
      {
        id: 'b3_3',
        type: 'image',
        content: {
          caption: 'Cyberpunk Metaverse Realm — Unreal Engine 5 Real-Time Preview',
          src: 'https://picsum.photos/seed/cyberpunk/800/400'
        },
        accent: '#bf00ff'
      },
      {
        id: 'b3_4',
        type: 'button',
        content: {
          label: '🔗 Connect Web3 Wallet & Mint NFT',
          href: '#'
        },
        accent: '#bf00ff'
      },
      {
        id: 'b3_5',
        type: 'form',
        content: {
          fields: 'Ethereum Address, Discord Handle',
          buttonText: 'Claim Genesis Whitelist Spot'
        },
        accent: '#bf00ff'
      }
    ]
  },
  {
    id: 'site_4',
    name: 'Digital Growth & Media Agency',
    category: 'Agency & Business',
    description: 'High-impact agency page showcasing client case studies, 300% ROAS proof, and audit booking.',
    accent: '#00ff88',
    badge: 'Agency Pro',
    icon: Globe,
    blocks: [
      {
        id: 'b4_1',
        type: 'hero',
        content: {
          heading: 'We Scale E-Commerce Brands to $10M+ ARR',
          sub: 'Data-driven performance marketing, viral creative production, and AI-optimized sales funnels.'
        },
        accent: '#00ff88'
      },
      {
        id: 'b4_2',
        type: 'text',
        content: {
          body: '📈 Proven track record: Over $50M in generated client revenue in the last 12 months with an average 4.2x ROAS across TikTok and Meta ads.'
        },
        accent: '#00ff88'
      },
      {
        id: 'b4_3',
        type: 'button',
        content: {
          label: '📞 Schedule Free 30-Min Growth Audit',
          href: '#'
        },
        accent: '#00ff88'
      },
      {
        id: 'b4_4',
        type: 'form',
        content: {
          fields: 'Company Name, Monthly Ad Spend, Phone Number',
          buttonText: 'Get Custom Scale Blueprint'
        },
        accent: '#00ff88'
      }
    ]
  },
  {
    id: 'site_5',
    name: 'Full-Stack Developer Portfolio',
    category: 'Portfolio & Personal',
    description: 'Sleek personal site showcasing technical stack, GitHub projects, and project inquiry form.',
    accent: '#ff0080',
    badge: 'Developer Portfolio',
    icon: Code,
    blocks: [
      {
        id: 'b5_1',
        type: 'hero',
        content: {
          heading: 'Hi, I am Nisar — Senior AI & Web Architect',
          sub: 'Specializing in Next.js, React, TypeScript, Gemini API integration, and cloud-native serverless deployments.'
        },
        accent: '#ff0080'
      },
      {
        id: 'b5_2',
        type: 'text',
        content: {
          body: '💻 Tech Stack: Next.js 15, Tailwind CSS, Firestore, Cloud Run, Python, LangChain, Vector Databases, Node.js.'
        },
        accent: '#bf00ff'
      },
      {
        id: 'b5_3',
        type: 'image',
        content: {
          caption: 'Featured Open Source Work & AI Agent Infrastructure',
          src: 'https://picsum.photos/seed/devportfolio/800/400'
        },
        accent: '#ff0080'
      },
      {
        id: 'b5_4',
        type: 'button',
        content: {
          label: '📄 Download Resume (PDF) & View GitHub',
          href: '#'
        },
        accent: '#ff0080'
      },
      {
        id: 'b5_5',
        type: 'form',
        content: {
          fields: 'Your Name, Project Scope, Budget',
          buttonText: 'Hire Me For Contract'
        },
        accent: '#ff0080'
      }
    ]
  },
  {
    id: 'site_6',
    name: 'Fitness & CrossFit Club',
    category: 'Health & Lifestyle',
    description: 'High-energy fitness club page with class schedules, coach bios, and pass reservation.',
    accent: '#ff4500',
    badge: 'Fitness & Gym',
    icon: Dumbbell,
    blocks: [
      {
        id: 'b6_1',
        type: 'hero',
        content: {
          heading: 'Unleash Your Ultimate Physical Potential',
          sub: 'State-of-the-art conditioning, Olympic weightlifting, and group HIIT classes guided by certified elite coaches.'
        },
        accent: '#ff4500'
      },
      {
        id: 'b6_2',
        type: 'text',
        content: {
          body: '🔥 Programs available: Beginner Onboarding, Advanced Strength Training, Recovery Sauna, Nutrition Coaching, and Personal Training.'
        },
        accent: '#ff4500'
      },
      {
        id: 'b6_3',
        type: 'button',
        content: {
          label: '💪 Claim 3-Day Free VIP Gym Pass',
          href: '#'
        },
        accent: '#ff4500'
      },
      {
        id: 'b6_4',
        type: 'form',
        content: {
          fields: 'Full Name, Phone, Preferred Class Time',
          buttonText: 'Reserve Free Trial Spot'
        },
        accent: '#ff4500'
      }
    ]
  },
  {
    id: 'site_7',
    name: 'Real Estate Luxury Estates',
    category: 'Agency & Business',
    description: 'Architectural showcase with luxury penthouse galleries, amenities list, and private viewing form.',
    accent: '#e6c687',
    badge: 'Real Estate',
    icon: HomeIcon,
    blocks: [
      {
        id: 'b7_1',
        type: 'hero',
        content: {
          heading: 'Exquisite Architectural Masterpieces',
          sub: 'Exclusive waterfront villas and skyline penthouses engineered with sustainable luxury and private helipads.'
        },
        accent: '#e6c687'
      },
      {
        id: 'b7_2',
        type: 'image',
        content: {
          caption: 'The Azure Coastal Villa — 6 Bedrooms, Infinity Pool & Panoramic Ocean Views',
          src: 'https://picsum.photos/seed/realestate/800/400'
        },
        accent: '#e6c687'
      },
      {
        id: 'b7_3',
        type: 'button',
        content: {
          label: '🏰 View 3D Virtual Private Tour',
          href: '#'
        },
        accent: '#e6c687'
      },
      {
        id: 'b7_4',
        type: 'form',
        content: {
          fields: 'Full Name, Preferred Move-in Date, Contact Number',
          buttonText: 'Request Private Listing Brochure'
        },
        accent: '#e6c687'
      }
    ]
  },
  {
    id: 'site_8',
    name: 'Gourmet Bistro & Culinary Lounge',
    category: 'Health & Lifestyle',
    description: 'Atmospheric dining site with chef tasting menu highlights, wine pairings, and table reservations.',
    accent: '#f59e0b',
    badge: 'Culinary & Dining',
    icon: Utensils,
    blocks: [
      {
        id: 'b8_1',
        type: 'hero',
        content: {
          heading: 'Michelin-Inspired Artisanal Culinary Experience',
          sub: 'Celebrating farm-to-table organic dining paired with rare vintage wines in an intimate atmospheric setting.'
        },
        accent: '#f59e0b'
      },
      {
        id: 'b8_2',
        type: 'text',
        content: {
          body: '🍷 Executive Chef Signature: 7-Course Omakase Tasting Menu featuring dry-aged Wagyu and hand-harvested truffle infused risotto.'
        },
        accent: '#f59e0b'
      },
      {
        id: 'b8_3',
        type: 'button',
        content: {
          label: '🍷 Book Chef\'s Table Reservation',
          href: '#'
        },
        accent: '#f59e0b'
      },
      {
        id: 'b8_4',
        type: 'form',
        content: {
          fields: 'Guest Count, Preferred Date, Special Dietary Notes',
          buttonText: 'Confirm Table Booking'
        },
        accent: '#f59e0b'
      }
    ]
  },
  {
    id: 'site_9',
    name: 'AI EdTech Learning Academy',
    category: 'SaaS & Tech',
    description: 'Course academy page with prompt engineering modules, instructor bio, and scholarship application.',
    accent: '#38bdf8',
    badge: 'EdTech Academy',
    icon: GraduationCap,
    blocks: [
      {
        id: 'b9_1',
        type: 'hero',
        content: {
          heading: 'Master Prompt Engineering & AI Architecture',
          sub: 'Comprehensive hands-on certification program designed by Google AI practitioners and tech lead engineers.'
        },
        accent: '#38bdf8'
      },
      {
        id: 'b9_2',
        type: 'text',
        content: {
          body: '🎓 What you will build: Autonomous AI agents, full-stack Next.js apps with Gemini API, vector database search, and automated workflows.'
        },
        accent: '#38bdf8'
      },
      {
        id: 'b9_3',
        type: 'button',
        content: {
          label: '🚀 Start Free Module 1 Right Now',
          href: '#'
        },
        accent: '#38bdf8'
      },
      {
        id: 'b9_4',
        type: 'form',
        content: {
          fields: 'Email Address, Programming Experience Level',
          buttonText: 'Apply for Student Scholarship'
        },
        accent: '#38bdf8'
      }
    ]
  },
  {
    id: 'site_10',
    name: 'Cyber Security Zero-Trust Platform',
    category: 'SaaS & Tech',
    description: 'Enterprise security landing page with threat detection breakdown, SOC2 badges, and security audit CTA.',
    accent: '#10b981',
    badge: 'Cyber Security',
    icon: Shield,
    blocks: [
      {
        id: 'b10_1',
        type: 'hero',
        content: {
          heading: 'Real-Time Autonomous Threat Neutralization',
          sub: 'Protect your cloud infrastructure with zero-trust AI perimeter monitoring, automated vulnerability patching, and SOC2 compliance.'
        },
        accent: '#10b981'
      },
      {
        id: 'b10_2',
        type: 'text',
        content: {
          body: '🛡️ ISO 27001 & SOC2 Type II Certified: Scans over 1B events per second with AI anomaly detection before breaches occur.'
        },
        accent: '#10b981'
      },
      {
        id: 'b10_3',
        type: 'button',
        content: {
          label: '🔍 Run Free Infrastructure Security Scan',
          href: '#'
        },
        accent: '#10b981'
      },
      {
        id: 'b10_4',
        type: 'form',
        content: {
          fields: 'Domain URL, IT Manager Email, Cloud Provider',
          buttonText: 'Get Vulnerability Report'
        },
        accent: '#10b981'
      }
    ]
  },
  {
    id: 'site_11',
    name: 'Fintech Crypto Yield Vault',
    category: 'Crypto & Web3',
    description: 'DeFi yield platform featuring APY analytics, audited smart contracts, and wallet onboarding.',
    accent: '#6366f1',
    badge: 'DeFi & Fintech',
    icon: Award,
    blocks: [
      {
        id: 'b11_1',
        type: 'hero',
        content: {
          heading: 'Earn Up to 18.4% APY on Stablecoins',
          sub: 'Algorithmic yield aggregator auto-routing deposits across top-tier audited lending pools with automated loss protection.'
        },
        accent: '#6366f1'
      },
      {
        id: 'b11_2',
        type: 'text',
        content: {
          body: '🔒 Over $120M Total Value Locked (TVL). Fully audited by CertiK and Hacken with 24/7 liquidity withdrawals.'
        },
        accent: '#6366f1'
      },
      {
        id: 'b11_3',
        type: 'button',
        content: {
          label: '💰 Connect Wallet & Deposit USDC',
          href: '#'
        },
        accent: '#6366f1'
      },
      {
        id: 'b11_4',
        type: 'form',
        content: {
          fields: 'Estimated Deposit Amount, Preferred Vault Type',
          buttonText: 'Calculate Expected APY'
        },
        accent: '#6366f1'
      }
    ]
  },
  {
    id: 'site_12',
    name: 'Telehealth & 24/7 Doctor Clinic',
    category: 'Health & Lifestyle',
    description: 'Medical clinic landing page with doctor consultation booking, specialties list, and appointment form.',
    accent: '#14b8a6',
    badge: 'Telehealth',
    icon: HeartPulse,
    blocks: [
      {
        id: 'b12_1',
        type: 'hero',
        content: {
          heading: 'Board-Certified Doctors Available 24/7 Online',
          sub: 'Get immediate virtual consultations, prescription refills, and lab test orders from the comfort of your home.'
        },
        accent: '#14b8a6'
      },
      {
        id: 'b12_2',
        type: 'text',
        content: {
          body: '🩺 Covered by major insurance providers. Average wait time under 4 minutes with HIPAA-compliant secure video calls.'
        },
        accent: '#14b8a6'
      },
      {
        id: 'b12_3',
        type: 'button',
        content: {
          label: '📅 Start Instant Virtual Doctor Visit',
          href: '#'
        },
        accent: '#14b8a6'
      },
      {
        id: 'b12_4',
        type: 'form',
        content: {
          fields: 'Patient Name, Primary Symptoms, Insurance Provider',
          buttonText: 'Schedule Same-Day Appointment'
        },
        accent: '#14b8a6'
      }
    ]
  },
  {
    id: 'site_13',
    name: 'Exotic Travel & Expedition Expeditions',
    category: 'Health & Lifestyle',
    description: 'Adventure travel portal showcasing safari tours, Arctic expeditions, and custom itinerary form.',
    accent: '#f43f5e',
    badge: 'Travel & Expeditions',
    icon: Plane,
    blocks: [
      {
        id: 'b13_1',
        type: 'hero',
        content: {
          heading: 'Discover Uncharted Wonders Across 7 Continents',
          sub: 'Curated small-group expeditions from Patagonia mountain treks to Serengeti wildlife safaris and Northern Lights tours.'
        },
        accent: '#f43f5e'
      },
      {
        id: 'b13_2',
        type: 'image',
        content: {
          caption: 'Icelandic Aurora Borealis Glamping Lodge — All-Inclusive Luxury Expedition',
          src: 'https://picsum.photos/seed/traveladventure/800/400'
        },
        accent: '#f43f5e'
      },
      {
        id: 'b13_3',
        type: 'button',
        content: {
          label: '🗺️ Explore 2026/2027 Expedition Calendar',
          href: '#'
        },
        accent: '#f43f5e'
      },
      {
        id: 'b13_4',
        type: 'form',
        content: {
          fields: 'Dream Destination, Traveler Count, Budget Range',
          buttonText: 'Get Custom Travel Itinerary'
        },
        accent: '#f43f5e'
      }
    ]
  },
  {
    id: 'site_14',
    name: 'Podcast & Tech Media Network',
    category: 'Agency & Business',
    description: 'Media network page with episode audio highlights, host bio, and guest speaker pitch form.',
    accent: '#8b5cf6',
    badge: 'Podcast & Media',
    icon: Radio,
    blocks: [
      {
        id: 'b14_1',
        type: 'hero',
        content: {
          heading: 'The Future of Tech & AI Founder Podcast',
          sub: 'Deep-dive conversations with unicorn founders, AI researchers, and venture capitalists shaping the next decade.'
        },
        accent: '#8b5cf6'
      },
      {
        id: 'b14_2',
        type: 'text',
        content: {
          body: '🎙️ Over 2.5 Million downloads across Spotify, Apple Podcasts, and YouTube. Ranked #1 in Tech Strategy.'
        },
        accent: '#8b5cf6'
      },
      {
        id: 'b14_3',
        type: 'button',
        content: {
          label: '🎧 Listen on Spotify & Apple Podcasts',
          href: '#'
        },
        accent: '#8b5cf6'
      },
      {
        id: 'b14_4',
        type: 'form',
        content: {
          fields: 'Speaker Name, Company Name, Proposed Topic',
          buttonText: 'Apply as Guest Speaker'
        },
        accent: '#8b5cf6'
      }
    ]
  },
  {
    id: 'site_15',
    name: 'Developer API Gateway & Docs',
    category: 'SaaS & Tech',
    description: 'Developer portal with code endpoint highlights, sub-millisecond benchmarks, and API key generation.',
    accent: '#84cc16',
    badge: 'Developer API',
    icon: Terminal,
    blocks: [
      {
        id: 'b15_1',
        type: 'hero',
        content: {
          heading: 'Sub-Millisecond Neural Vector Search API',
          sub: 'High-speed embeddings, semantic retrieval, and memory management API for AI agents and LLM applications.'
        },
        accent: '#84cc16'
      },
      {
        id: 'b15_2',
        type: 'text',
        content: {
          body: '⚡ Code snippet: npm install @nisar-ai/vector-sdk — Query over 10,000,000 vectors with under 8ms latency.'
        },
        accent: '#84cc16'
      },
      {
        id: 'b15_3',
        type: 'button',
        content: {
          label: '🔑 Get Free Developer API Key (10k Requests)',
          href: '#'
        },
        accent: '#84cc16'
      },
      {
        id: 'b15_4',
        type: 'form',
        content: {
          fields: 'GitHub Username, Primary Programming Language',
          buttonText: 'Request Sandbox Key'
        },
        accent: '#84cc16'
      }
    ]
  },
  {
    id: 'site_16',
    name: 'Global Tech Conference & Summit',
    category: 'Agency & Business',
    description: 'Conference landing page with speaker lineup, ticket tiers, and early bird registration form.',
    accent: '#eab308',
    badge: 'Conference',
    icon: Calendar,
    blocks: [
      {
        id: 'b16_1',
        type: 'hero',
        content: {
          heading: 'Global AI & Tech Innovation Summit 2026',
          sub: 'Nov 12-14 | Moscone Center, San Francisco. 3 Days, 50+ Keynote Speakers, 5,000+ Founders and Investors.'
        },
        accent: '#eab308'
      },
      {
        id: 'b16_2',
        type: 'text',
        content: {
          body: '🎟️ Keynotes featured: OpenAI Engineering Leads, Google DeepMind Researchers, Top VC Partners, and Founder Pioneers.'
        },
        accent: '#eab308'
      },
      {
        id: 'b16_3',
        type: 'button',
        content: {
          label: '🎫 Get Early-Bird Ticket (40% OFF)',
          href: '#'
        },
        accent: '#eab308'
      },
      {
        id: 'b16_4',
        type: 'form',
        content: {
          fields: 'Attendee Name, Work Email, Ticket Type (VIP/Standard)',
          buttonText: 'Reserve Conference Seat'
        },
        accent: '#eab308'
      }
    ]
  },
  {
    id: 'site_17',
    name: 'Clean Organic Cosmetics & Skincare',
    category: 'E-Commerce',
    description: 'Dermatologist-approved skincare brand site with clinical results, ingredients, and order checkout.',
    accent: '#ec4899',
    badge: 'Cosmetics & Beauty',
    icon: Sparkles,
    blocks: [
      {
        id: 'b17_1',
        type: 'hero',
        content: {
          heading: 'Nourish Your Skin with Organic Botanical Radiance',
          sub: 'Dermatologist-formulated clean skincare powered by bioactive botanical oils, vitamin C, and hyaluronic hydration.'
        },
        accent: '#ec4899'
      },
      {
        id: 'b17_2',
        type: 'text',
        content: {
          body: '🌸 100% Vegan, Cruelty-Free, Paraben-Free. Clinical trial results: 94% noticed visibly brighter skin within 14 days.'
        },
        accent: '#ec4899'
      },
      {
        id: 'b17_3',
        type: 'button',
        content: {
          label: '✨ Shop Glow Essentials Bundle',
          href: '#'
        },
        accent: '#ec4899'
      },
      {
        id: 'b17_4',
        type: 'form',
        content: {
          fields: 'Shipping Address, Email, Skin Type',
          buttonText: 'Order Glow Starter Kit'
        },
        accent: '#ec4899'
      }
    ]
  },
  {
    id: 'site_18',
    name: 'Mobile App Showcase & Downloads',
    category: 'SaaS & Tech',
    description: 'Mobile application landing page with store rating badges, feature breakdown, and beta access signup.',
    accent: '#06b6d4',
    badge: 'Mobile App',
    icon: Smartphone,
    blocks: [
      {
        id: 'b18_1',
        type: 'hero',
        content: {
          heading: 'The All-In-One Personal Finance Companion',
          sub: 'Categorize expenses, track investments, and build wealth with automated AI budgeting insights right on your phone.'
        },
        accent: '#06b6d4'
      },
      {
        id: 'b18_2',
        type: 'image',
        content: {
          caption: 'iOS & Android App Store Rating 4.9/5 — Over 500,000+ Active Monthly Users',
          src: 'https://picsum.photos/seed/mobileapp/800/400'
        },
        accent: '#06b6d4'
      },
      {
        id: 'b18_3',
        type: 'button',
        content: {
          label: '📲 Download Free on App Store & Google Play',
          href: '#'
        },
        accent: '#06b6d4'
      },
      {
        id: 'b18_4',
        type: 'form',
        content: {
          fields: 'Email Address, Device Platform (iOS/Android)',
          buttonText: 'Join Beta Tester Group'
        },
        accent: '#06b6d4'
      }
    ]
  },
  {
    id: 'site_19',
    name: 'Eco Green Ocean Restoration Foundation',
    category: 'Health & Lifestyle',
    description: 'Non-profit eco landing page with impact metrics, plastic cleanup tracker, and sponsorship donation.',
    accent: '#059669',
    badge: 'Non-Profit & Eco',
    icon: Leaf,
    blocks: [
      {
        id: 'b19_1',
        type: 'hero',
        content: {
          heading: 'Restoring Our Oceans & Planet Biodiversity',
          sub: 'Deploying autonomous solar ocean barriers to clean 1,000,000+ lbs of ocean plastic every single month.'
        },
        accent: '#059669'
      },
      {
        id: 'b19_2',
        type: 'text',
        content: {
          body: '🌱 100% Transparency: Every $1 donated directly removes 5 lbs of plastic from marine ecosystems with live GPS tracking.'
        },
        accent: '#059669'
      },
      {
        id: 'b19_3',
        type: 'button',
        content: {
          label: '🌊 Sponsor 1 Acre of Ocean Cleanup',
          href: '#'
        },
        accent: '#059669'
      },
      {
        id: 'b19_4',
        type: 'form',
        content: {
          fields: 'Sponsor Name, Monthly Donation Amount, Email',
          buttonText: 'Become Planet Ambassador'
        },
        accent: '#059669'
      }
    ]
  },
  {
    id: 'site_20',
    name: 'Artisanal Specialty Coffee Roastery',
    category: 'E-Commerce',
    description: 'Single-origin coffee roastery page with flavor profiles, roast guides, and subscription club signup.',
    accent: '#d97706',
    badge: 'Artisanal Food',
    icon: Coffee,
    blocks: [
      {
        id: 'b20_1',
        type: 'hero',
        content: {
          heading: 'Fresh Single-Origin Beans Roasted Daily',
          sub: 'Direct trade specialty coffee beans ethically sourced from high-altitude volcanic farms in Ethiopia and Colombia.'
        },
        accent: '#d97706'
      },
      {
        id: 'b20_2',
        type: 'text',
        content: {
          body: '☕ Roast Profiles: Light Ethiopian Yirgacheffe (Jasmine & Bergamot notes), Medium Colombia Supremo (Caramel & Milk Chocolate).'
        },
        accent: '#d97706'
      },
      {
        id: 'b20_3',
        type: 'button',
        content: {
          label: '📦 Join Monthly Coffee Subscription (20% Off)',
          href: '#'
        },
        accent: '#d97706'
      },
      {
        id: 'b20_4',
        type: 'form',
        content: {
          fields: 'Grind Preference (Whole Bean/Espresso), Address',
          buttonText: 'Get Free Sample Tasting Bag'
        },
        accent: '#d97706'
      }
    ]
  }
];

interface PageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSite: (template: SiteTemplate) => void;
}

export default function PageGalleryModal({ isOpen, onClose, onSelectSite }: PageGalleryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewTemplate, setPreviewTemplate] = useState<SiteTemplate | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'SaaS & Tech', 'E-Commerce', 'Agency & Business', 'Portfolio & Personal', 'Health & Lifestyle', 'Crypto & Web3'];

  const filtered = TWENTY_SITE_TEMPLATES.filter((site) => {
    const matchesCategory = selectedCategory === 'All' || site.category === selectedCategory;
    const matchesSearch = 
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#12141c] border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#171a24] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100 font-sans">20 Full Website Templates & Page Gallery</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-bold">
                  20 Pre-Built Sites
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Browse, preview, and load complete 5+ block website campaigns with 1 click into your active builder.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-[#141722] flex flex-col md:flex-row gap-3 items-center justify-between shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-[#1e2230] text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 20 site templates..."
              className="w-full bg-[#1e2230] border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Main Body Grid / Preview */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#0b0c10]">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Layout className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-slate-300 text-sm">No site templates found</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or selecting another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((site) => {
                const Icon = site.icon;
                return (
                  <div
                    key={site.id}
                    className="bg-[#12141c] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between group transition duration-200 hover:shadow-xl relative overflow-hidden"
                  >
                    {/* Top Tag & Badge */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase"
                          style={{ backgroundColor: `${site.accent}20`, color: site.accent, border: `1px solid ${site.accent}40` }}
                        >
                          {site.badge}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {site.blocks.length} Blocks
                        </span>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div 
                          className="p-2.5 rounded-xl shrink-0"
                          style={{ backgroundColor: `${site.accent}15`, color: site.accent }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition">
                            {site.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {site.description}
                          </p>
                        </div>
                      </div>

                      {/* Mini Block Stack Preview Chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {site.blocks.map((blk, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#181a24] text-slate-400 border border-slate-800"
                          >
                            {blk.type.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center space-x-2">
                      <button
                        onClick={() => setPreviewTemplate(site)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#1a1d28] hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectSite(site);
                          onClose();
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-950 transition flex items-center justify-center space-x-1 cursor-pointer shadow-md"
                        style={{ background: `linear-gradient(90deg, ${site.accent}, #00ff88)` }}
                      >
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Load Site</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#171a24] flex items-center justify-between text-xs text-slate-400">
          <span>Showing <strong className="text-emerald-400">{filtered.length}</strong> of 20 Full Website Templates</span>
          <span className="font-mono text-[11px] text-slate-500">NISAR Studio Site Builder Engine v3.5</span>
        </div>
      </div>

      {/* Live Preview Overlay Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-4 bg-[#171a24] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: previewTemplate.accent }}
                />
                <h4 className="text-sm font-bold text-slate-100">{previewTemplate.name} — Live Site Preview</h4>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#090a10]">
              {previewTemplate.blocks.map((b, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl border space-y-2"
                  style={{ 
                    borderColor: `${b.accent}40`, 
                    backgroundColor: `${b.accent}0a` 
                  }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
                    <span>Block #{i + 1}: {b.type}</span>
                    <span style={{ color: b.accent }}>{b.accent}</span>
                  </div>

                  {b.type === 'hero' && (
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-100">{b.content.heading}</h3>
                      <p className="text-xs text-slate-400">{b.content.sub}</p>
                    </div>
                  )}

                  {b.type === 'text' && (
                    <p className="text-xs text-slate-300 leading-relaxed">{b.content.body}</p>
                  )}

                  {b.type === 'image' && (
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
                      📷 {b.content.caption}
                    </div>
                  )}

                  {b.type === 'button' && (
                    <button 
                      className="px-4 py-2 rounded-lg text-xs font-bold text-slate-950"
                      style={{ background: b.accent }}
                    >
                      {b.content.label}
                    </button>
                  )}

                  {b.type === 'form' && (
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-xs">
                      <div className="text-slate-400">Form fields: {b.content.fields}</div>
                      <button 
                        className="px-3 py-1.5 rounded text-xs font-bold text-slate-950"
                        style={{ background: b.accent }}
                      >
                        {b.content.buttonText}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#171a24] border-t border-slate-800 flex justify-end space-x-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  onSelectSite(previewTemplate);
                  setPreviewTemplate(null);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 flex items-center space-x-2"
                style={{ background: `linear-gradient(90deg, ${previewTemplate.accent}, #00ff88)` }}
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Load Into Builder</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
