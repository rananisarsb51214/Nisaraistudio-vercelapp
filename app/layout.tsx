import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NISAR AI STUDIO — Super AI Toolbox',
  description:
    'An all-in-one platform powered exclusively by Google Gemini and Firebase, featuring intelligent agents, e-commerce automation, and developer tools in a unified workspace.',
  openGraph: {
    title: 'NISAR AI STUDIO — Super AI Toolbox',
    description:
      'An all-in-one platform powered exclusively by Google Gemini and Firebase, featuring intelligent agents, e-commerce automation, and developer tools in a unified workspace.',
  },
};

const themeInitScript = `
(function() {
  try {
    var t = window.localStorage.getItem('nisar-studio-theme');
    var root = document.documentElement;
    if (t === 'light') {
      root.classList.remove('dark');
      root.classList.add('light-high-contrast');
      root.dataset.theme = 'light';
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('dark');
      root.classList.remove('light-high-contrast');
      root.dataset.theme = 'dark';
      root.style.colorScheme = 'dark';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-slate-50 text-slate-950 dark:bg-[#080b0e] dark:text-slate-100 font-sans antialiased transition-colors duration-150">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
