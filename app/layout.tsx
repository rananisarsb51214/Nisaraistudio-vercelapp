import type { Metadata } from 'next';
import Providers from './providers';
import { JsonLd } from '@/components/seo/JsonLd';
import { BRAND_DESCRIPTION, BRAND_NAME, SITE_URL } from '@/lib/seo/site-config';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nisar AI Studio — Super AI Tool Box & Automation Hub',
    template: '%s | Nisar AI Studio',
  },
  description: BRAND_DESCRIPTION,
  keywords: [
    'Nisar AI Studio',
    'Super AI Tool Box',
    'AI automation tools',
    'Chatbot Maker AI',
    'Nova Design AI',
    'Backlink Auto-Detect',
    'Affiliate Link Converter',
    'AI SaaS Pakistan',
    'Next.js AI tools',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: BRAND_NAME,
    title: 'Nisar AI Studio — Super AI Tool Box & Automation Hub',
    description: BRAND_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nisar AI Studio — Super AI Tool Box & Automation Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nisar AI Studio — Super AI Tool Box & Automation Hub',
    description: BRAND_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

const themeInitScript = `
(function() {
  try {
    var t = window.localStorage.getItem('nisar-studio-theme');
    var root = document.documentElement;
    if (t === 'light') {
      root.classList.remove('dark', 'theme-black');
      root.classList.add('light-high-contrast');
      root.dataset.theme = 'light';
      root.style.colorScheme = 'light';
    } else if (t === 'dark') {
      root.classList.add('dark');
      root.classList.remove('theme-black', 'light-high-contrast');
      root.dataset.theme = 'dark';
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('dark', 'theme-black');
      root.classList.remove('light-high-contrast');
      root.dataset.theme = 'black';
      root.style.colorScheme = 'dark';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark theme-black" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-950 dark:bg-[#050811] black:bg-black dark:text-slate-100 black:text-neutral-100 font-sans antialiased transition-colors duration-150">
        <JsonLd />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
