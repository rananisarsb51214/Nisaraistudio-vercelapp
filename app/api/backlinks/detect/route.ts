export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { checkAndDeductCredits, refundQuotaOrCredit } from '@/lib/credits/credits-service';
import type {
  BacklinkAiAudit,
  BacklinkScanReport,
  DetectedBacklink,
  DetectedLinkCategory,
  LinkRelType,
} from '@/types/links';
import type { QuotaStatus } from '@/types/credits';

const SOCIAL_DOMAINS = [
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'youtube.com',
  'youtu.be',
  'tiktok.com',
  'pinterest.com',
  'reddit.com',
];

const AFFILIATE_PARAM_HINTS = ['tag=', 'ref=', 'aff', 'hop=', 'irclickid=', 'cjevent=', 'via='];

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
  if (/^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) {
    return true;
  }
  return false;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyRel(relRaw: string): LinkRelType {
  const lower = relRaw.toLowerCase();
  if (lower.includes('sponsored')) return 'sponsored';
  if (lower.includes('ugc')) return 'ugc';
  if (lower.includes('nofollow')) return 'nofollow';
  return 'dofollow';
}

function extractBacklinksFromHtml(
  html: string,
  baseUrl: URL,
  targetDomain: string
): {
  pageTitle: string;
  canonicalUrl: string;
  links: DetectedBacklink[];
} {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const pageTitle = titleMatch ? decodeHtmlEntities(titleMatch[1]) : baseUrl.hostname;

  const canonicalMatch = html.match(
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i
  );
  const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : baseUrl.toString();

  const anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  const links: DetectedBacklink[] = [];
  const seenKeys = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html)) !== null && links.length < 250) {
    const attrs = match[1] || '';
    const innerRaw = (match[2] || '').replace(/<[^>]+>/g, ' ');
    const anchorText = decodeHtmlEntities(innerRaw) || '[Image / Empty Anchor]';

    const hrefMatch = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const rawHref = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? '').trim();

    if (
      !rawHref ||
      rawHref.startsWith('#') ||
      rawHref.startsWith('javascript:') ||
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('tel:')
    ) {
      continue;
    }

    let resolved: URL;
    try {
      resolved = new URL(rawHref, baseUrl);
    } catch {
      continue;
    }

    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
      continue;
    }

    const relMatch = attrs.match(/rel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const relRaw = (relMatch?.[1] ?? relMatch?.[2] ?? relMatch?.[3] ?? '').trim();
    const relType = classifyRel(relRaw);

    const targetMatch = attrs.match(/target\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const targetAttr = (targetMatch?.[1] ?? targetMatch?.[2] ?? targetMatch?.[3] ?? '').trim();

    const domain = resolved.hostname.replace(/^www\./i, '').toLowerCase();
    const baseDomain = baseUrl.hostname.replace(/^www\./i, '').toLowerCase();
    const cleanTargetDomain = targetDomain
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .toLowerCase()
      .trim();

    const matchesTargetDomain = Boolean(
      cleanTargetDomain &&
        (domain === cleanTargetDomain || domain.endsWith(`.${cleanTargetDomain}`))
    );

    const lowerHref = resolved.toString().toLowerCase();
    const isAffiliateCandidate =
      relType === 'sponsored' ||
      AFFILIATE_PARAM_HINTS.some((hint) => lowerHref.includes(hint)) ||
      domain.includes('amzn.to') ||
      domain.includes('amazon.');

    let category: DetectedLinkCategory = 'external';
    if (domain === baseDomain) {
      category = 'internal';
    } else if (isAffiliateCandidate) {
      category = 'affiliate';
    } else if (SOCIAL_DOMAINS.some((s) => domain === s || domain.endsWith(`.${s}`))) {
      category = 'social';
    }

    const dedupeKey = `${resolved.toString()}::${anchorText}`;
    if (seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);

    links.push({
      id: `lnk_${links.length + 1}`,
      url: resolved.toString(),
      domain,
      anchorText: anchorText.slice(0, 140),
      rel: relRaw || 'dofollow',
      relType,
      category,
      matchesTargetDomain,
      isAffiliateCandidate,
      targetAttr: targetAttr || '_self',
    });
  }

  return { pageTitle, canonicalUrl, links };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default_user';

    const colRef = collection(db, 'backlink_scans');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);

    const scans: BacklinkScanReport[] = [];
    snap.forEach((docSnap) => {
      scans.push({ id: docSnap.id, ...(docSnap.data() as Omit<BacklinkScanReport, 'id'>) });
    });

    scans.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, scans: scans.slice(0, 20) });
  } catch (error) {
    console.error('[API /api/backlinks/detect GET Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load backlink scan history.',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let deductedFrom: 'daily_free' | 'paid_credits' | 'none' = 'none';
  let deductedCost = 0;
  let resolvedUserId = 'default_user';

  try {
    const body = await req.json();
    const {
      targetUrl,
      targetDomain = '',
      userId = 'default_user',
      includeAiOutreach = false,
      saveToFirestore = true,
    } = body || {};

    resolvedUserId =
      typeof userId === 'string' && userId.trim() ? userId.trim() : 'default_user';

    if (typeof targetUrl !== 'string' || !targetUrl.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid targetUrl to scan.' },
        { status: 400 }
      );
    }

    let normalizedUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Only http:// and https:// URLs are supported.');
      }
      if (isBlockedPrivateHost(parsedUrl.hostname)) {
        return NextResponse.json(
          { success: false, error: 'Scanning local or private network hosts is not allowed.' },
          { status: 400 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: err instanceof Error ? err.message : 'Invalid URL provided.',
        },
        { status: 400 }
      );
    }

    let quotaStatus: QuotaStatus | undefined;
    if (includeAiOutreach) {
      const deductRes = await checkAndDeductCredits(resolvedUserId, 1, 'backlink-auto-detect');
      if (!deductRes.success) {
        return NextResponse.json(
          {
            success: false,
            code: deductRes.code || 'LIMIT_REACHED',
            error: deductRes.error || 'Daily free quota reached.',
            quota: deductRes.quota,
          },
          { status: deductRes.code === 'LIMIT_REACHED' ? 429 : 500 }
        );
      }
      deductedFrom = deductRes.deductedFrom;
      deductedCost = deductRes.deductedCost;
      quotaStatus = deductRes.quota;
    }

    // Fetch live HTML of the target webpage
    let html = '';
    let fetchStatus = 200;
    let fetchNote = '';

    try {
      const pageRes = await fetch(parsedUrl.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; NisarAI-BacklinkBot/1.0; +https://nisaraistudiovercel-app.vercel.app)',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(9000),
      });
      fetchStatus = pageRes.status;
      if (!pageRes.ok) {
        fetchNote = `Remote server returned HTTP ${pageRes.status}. Partial or header-only inspection recorded.`;
      }
      html = await pageRes.text();
    } catch (fetchErr) {
      fetchStatus = 502;
      fetchNote =
        fetchErr instanceof Error
          ? `Could not fetch remote HTML (${fetchErr.message}).`
          : 'Remote webpage blocked automated crawl or timed out.';
    }

    const { pageTitle, canonicalUrl, links } = extractBacklinksFromHtml(
      html,
      parsedUrl,
      typeof targetDomain === 'string' ? targetDomain : ''
    );

    const externalLinks = links.filter((l) => l.category !== 'internal');
    const uniqueExternalDomains = new Set(externalLinks.map((l) => l.domain)).size;

    const summary = {
      totalLinks: links.length,
      externalLinks: externalLinks.length,
      internalLinks: links.filter((l) => l.category === 'internal').length,
      dofollowCount: links.filter((l) => l.relType === 'dofollow').length,
      nofollowOrSponsoredCount: links.filter((l) => l.relType !== 'dofollow').length,
      matchingBacklinksCount: links.filter((l) => l.matchesTargetDomain).length,
      affiliateLinksCount: links.filter((l) => l.isAffiliateCandidate).length,
      uniqueExternalDomains,
    };

    let aiAudit: BacklinkAiAudit | null = null;
    if (includeAiOutreach) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        if (deductedFrom !== 'none' && deductedCost > 0) {
          await refundQuotaOrCredit(resolvedUserId, deductedFrom, deductedCost, 'backlink-auto-detect');
        }
        return NextResponse.json(
          { success: false, error: 'GEMINI_API_KEY is not configured on the server.' },
          { status: 500 }
        );
      }

      const ai = new GoogleGenAI({ apiKey });
      const sampleAnchors = links
        .slice(0, 20)
        .map((l) => `- [${l.anchorText}] -> ${l.url} (${l.relType}, ${l.category})`)
        .join('\n');

      const prompt = `Analyze this live backlink crawl report:
Scanned URL: ${parsedUrl.toString()}
Page Title: ${pageTitle}
Target Brand/Domain Looking For Backlink: ${targetDomain || 'General SEO Audit'}
Summary: ${JSON.stringify(summary)}
Sample Outbound Links:
${sampleAnchors || 'None extracted (site may use client-side rendering or block bots).'}

Provide an SEO audit and outreach strategy as JSON:
1. "seoScore": integer 0-100 evaluating outbound/backlink health
2. "verdict": 1 concise summary sentence
3. "anchorInsights": 3 actionable bullet tips on anchor text, dofollow/nofollow balance, or affiliate rel="sponsored" compliance
4. "outreachPitch": a concise, high-converting cold outreach email pitch to earn/upgrade a dofollow backlink on this page.`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              seoScore: { type: Type.NUMBER },
              verdict: { type: Type.STRING },
              anchorInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
              outreachPitch: { type: Type.STRING },
            },
            required: ['seoScore', 'verdict', 'anchorInsights', 'outreachPitch'],
          },
        },
      });

      aiAudit = JSON.parse((aiResponse.text || '{}').trim()) as BacklinkAiAudit;
    }

    const scanId = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const report: BacklinkScanReport = {
      id: scanId,
      userId: resolvedUserId,
      scannedUrl: parsedUrl.toString(),
      scannedDomain: parsedUrl.hostname.replace(/^www\./i, ''),
      targetDomain: typeof targetDomain === 'string' ? targetDomain.trim() : '',
      pageTitle,
      canonicalUrl,
      fetchStatus,
      ...(fetchNote ? { fetchNote } : {}),
      summary,
      links,
      aiAudit,
      createdAt: new Date().toISOString(),
    };

    if (saveToFirestore) {
      try {
        await setDoc(doc(db, 'backlink_scans', scanId), {
          ...report,
          // Keep stored links bounded under Firestore 1MB limit
          links: report.links.slice(0, 100),
        });
      } catch (dbErr) {
        console.warn('[API /api/backlinks/detect] Firestore save skipped:', dbErr);
        try {
          handleFirestoreError(dbErr, OperationType.WRITE, `backlink_scans/${scanId}`);
        } catch {
          // Do not fail the HTTP scan response if logging/history fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      report,
      ...(quotaStatus ? { quota: quotaStatus } : {}),
    });
  } catch (error) {
    if (deductedFrom !== 'none' && deductedCost > 0) {
      await refundQuotaOrCredit(resolvedUserId, deductedFrom, deductedCost, 'backlink-auto-detect');
    }
    console.error('[API /api/backlinks/detect POST Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Backlink detection failed.',
      },
      { status: 500 }
    );
  }
}
