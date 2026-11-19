export const VERCEL_PRODUCTION_URL = 'https://nisaraistudiovercel-app.vercel.app/';

export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://nisaraistudiovercel-app.vercel.app').replace(
    /\/+$/,
    ''
  );

export const GOOGLE_AI_STUDIO_APP_ID = '920d46dd-8266-45c8-8dda-11999ec5401c';
export const GOOGLE_AI_STUDIO_APP_URL =
  'https://ai.studio/apps/920d46dd-8266-45c8-8dda-11999ec5401c';

export const GITHUB_HUB_REPO = 'rananisarsb51214/NisarAI-Studio---Agent-Skills-Hub';
export const GITHUB_HUB_URL =
  'https://github.com/rananisarsb51214/NisarAI-Studio---Agent-Skills-Hub';

export const GITHUB_VERCEL_REPO = 'rananisarsb51214/Nisaraistudio-vercelapp';
export const GITHUB_VERCEL_URL =
  'https://github.com/rananisarsb51214/Nisaraistudio-vercelapp';

export const BRAND_NAME = 'NISAR AI STUDIO';
export const TOOLBOX_NAME = 'Super AI Toolbox';
export const BRAND_TAGLINE = 'Build Smarter. Automate Better. Create More.';
export const BRAND_DESCRIPTION =
  'Build Smarter. Automate Better. Create More. NISAR AI STUDIO & Super AI Toolbox offers Search & Auto-Collect, Agent Evolver (Gemini + Claude AI), Chatbot Maker AI, Backlink Auto-Detect, Affiliate Link Converter, and Dual PKR/USD Billing.';

export const FOUNDER_INFO = {
  name: 'Muhammad Nisar (Rana Nisar)',
  shortName: 'Muhammad Nisar',
  location: 'Pindi Bhattian, Hafizabad, Punjab, Pakistan',
  localPaymentNumber: '0323-5052148',
  localPaymentTitle: 'Muhammad Nisar',
  localPaymentGateways: ['JazzCash', 'Easypaisa'] as const,
};

export const BILLING_PLANS = {
  free: {
    id: 'FREE' as const,
    name: 'Free Daily Tier',
    credits: 10,
    priceUsd: 0,
    pricePkr: 0,
    cadence: '10 free daily credits',
  },
  starter: {
    id: 'STARTER' as const,
    name: 'Starter Pack',
    credits: 100,
    priceUsd: 5,
    pricePkr: 499,
    cadence: '100 credits',
  },
  pro: {
    id: 'PRO' as const,
    name: 'Pro Studio',
    credits: 500,
    priceUsd: 15,
    pricePkr: 1499,
    cadence: '500 credits',
  },
};
