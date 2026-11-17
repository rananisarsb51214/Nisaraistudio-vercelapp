import type { Metadata } from 'next';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'NISAR AI Studio Super AI Toolbox',
  description:
    'An all-in-one platform powered exclusively by Google Gemini and Firebase, featuring intelligent agents, e-commerce automation, and developer tools in a unified workspace.',
  openGraph: {
    title: 'NISAR AI Studio Super AI Toolbox',
    description:
      'An all-in-one platform powered exclusively by Google Gemini and Firebase, featuring intelligent agents, e-commerce automation, and developer tools in a unified workspace.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
