import { NextRequest } from 'next/server';
import { handleStreamingToolRequest } from '@/lib/ai/tool-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isBlockedPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h.endsWith('.local') ||
    h.endsWith('.internal')
  ) {
    return true;
  }
  return /^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h);
}

async function inspectLiveUrlForPrompt(rawPrompt: string): Promise<string> {
  const urlMatch = rawPrompt.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/i);
  if (!urlMatch) return rawPrompt;

  let targetUrl: URL;
  try {
    targetUrl = new URL(urlMatch[0]);
  } catch {
    return rawPrompt;
  }

  if (isBlockedPrivateHost(targetUrl.hostname)) {
    return rawPrompt;
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      headers: { 'User-Agent': 'NisarAIStudio-BacklinkCrawler/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      return `${rawPrompt}\n\n[Live crawl note: HTTP ${res.status} when fetching ${targetUrl.toString()}. Provide link audit based on URL/domain context.]`;
    }
    const html = await res.text();
    const anchorMatches = Array.from(
      html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)
    ).slice(0, 25);

    const extracted = anchorMatches.map((m) => {
      const fullTag = m[0];
      const href = m[1];
      const relMatch = fullTag.match(/rel=["']([^"']+)["']/i);
      const anchorText = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
      return `- href: ${href} | rel: ${relMatch?.[1] || 'dofollow'} | anchor: "${anchorText || '(empty)'}"`;
    });

    return `${rawPrompt}\n\n[Live Page Link Sample from ${targetUrl.toString()} (${anchorMatches.length} links inspected)]:\n${extracted.join('\n') || 'No anchor tags extracted.'}`;
  } catch {
    return rawPrompt;
  }
}

export async function POST(req: NextRequest) {
  return handleStreamingToolRequest(req, {
    toolId: 'backlink-auto-detect',
    systemInstruction:
      'You are the Backlink Auto-Detect & SEO Authority Analyst at Nisar AI Studio. Analyze the submitted URL, crawled link sample, or domain strategy. Provide: (1) Backlink & Outbound Rel Attribute Breakdown (dofollow, nofollow, sponsored, ugc), (2) Toxic / Spam Risk Signals, (3) High-Authority Referring Domain Opportunities, and (4) 3 Personalized Link-Building Outreach Templates.',
    promptTransformer: inspectLiveUrlForPrompt,
  });
}
