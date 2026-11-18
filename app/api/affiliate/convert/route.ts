export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { checkAndDeductCredits, refundQuotaOrCredit } from '@/lib/credits/credits-service';
import { convertLinksInText, convertSingleAffiliateUrl } from '@/lib/links/affiliate-engine';
import type { AffiliateNetworkPreset, SavedAffiliateLink } from '@/types/links';
import type { QuotaStatus } from '@/types/credits';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default_user';

    const colRef = collection(db, 'affiliate_links');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);

    const links: SavedAffiliateLink[] = [];
    snap.forEach((docSnap) => {
      links.push({ id: docSnap.id, ...(docSnap.data() as Omit<SavedAffiliateLink, 'id'>) });
    });

    links.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, links: links.slice(0, 50) });
  } catch (error) {
    console.error('[API /api/affiliate/convert GET Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch saved affiliate links.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing link id.' }, { status: 400 });
    }
    await deleteDoc(doc(db, 'affiliate_links', id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /api/affiliate/convert DELETE Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete affiliate link.',
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
      rawUrl = '',
      rawText = '',
      network = 'auto',
      affiliateTag = '',
      customParamKey = 'ref',
      utmSource = '',
      utmMedium = '',
      utmCampaign = '',
      stripExistingTags = true,
      includeAiCopy = false,
      saveToVault = true,
      label = '',
      userId = 'default_user',
    } = body || {};

    resolvedUserId =
      typeof userId === 'string' && userId.trim() ? userId.trim() : 'default_user';

    if (!rawUrl?.trim() && !rawText?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Provide either rawUrl or rawText to convert.' },
        { status: 400 }
      );
    }

    const options = {
      network: (network || 'auto') as AffiliateNetworkPreset,
      affiliateTag: typeof affiliateTag === 'string' ? affiliateTag : '',
      customParamKey: typeof customParamKey === 'string' ? customParamKey : 'ref',
      utmSource: typeof utmSource === 'string' ? utmSource : '',
      utmMedium: typeof utmMedium === 'string' ? utmMedium : '',
      utmCampaign: typeof utmCampaign === 'string' ? utmCampaign : '',
      stripExistingTags: Boolean(stripExistingTags),
    };

    const isBulk = Boolean(rawText?.trim());
    const singleResult = !isBulk ? convertSingleAffiliateUrl(rawUrl, options) : null;
    const bulkResult = isBulk ? convertLinksInText(rawText, options) : null;

    if (singleResult && !singleResult.isValid) {
      return NextResponse.json(
        { success: false, error: singleResult.error || 'Invalid URL format.' },
        { status: 400 }
      );
    }

    let quotaStatus: QuotaStatus | undefined;
    if (includeAiCopy) {
      const deductRes = await checkAndDeductCredits(
        resolvedUserId,
        1,
        'affiliate-link-converter'
      );
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

    let aiHook = '';
    let aiDisclosure = '';

    if (includeAiCopy) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        if (deductedFrom !== 'none' && deductedCost > 0) {
          await refundQuotaOrCredit(
            resolvedUserId,
            deductedFrom,
            deductedCost,
            'affiliate-link-converter'
          );
        }
        return NextResponse.json(
          { success: false, error: 'GEMINI_API_KEY is not configured on the server.' },
          { status: 500 }
        );
      }

      const ai = new GoogleGenAI({ apiKey });
      const summaryContext = isBulk
        ? `Bulk article/caption with ${bulkResult?.conversions.length || 0} converted affiliate links.`
        : `Target Domain: ${singleResult?.domain} | Converted URL: ${singleResult?.convertedUrl}`;

      const prompt = `You are a high-converting Affiliate Copywriter.
${summaryContext}
Label/Topic: ${label || 'Featured product recommendation'}

Return a valid JSON object with:
1. "aiHook": A punchy 1-2 sentence promotional CTA hook with urgency and clear value.
2. "aiDisclosure": A compliant, concise FTC affiliate disclosure sentence.`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiHook: { type: Type.STRING },
              aiDisclosure: { type: Type.STRING },
            },
            required: ['aiHook', 'aiDisclosure'],
          },
        },
      });

      const parsedAi = JSON.parse((aiResponse.text || '{}').trim());
      aiHook = parsedAi.aiHook || '';
      aiDisclosure = parsedAi.aiDisclosure || '';
    }

    const itemsToSave = isBulk
      ? (bulkResult?.conversions || []).slice(0, 10)
      : singleResult
      ? [singleResult]
      : [];

    const savedLinks: SavedAffiliateLink[] = [];

    if (saveToVault && itemsToSave.length > 0) {
      for (const item of itemsToSave) {
        const record: SavedAffiliateLink = {
          ...item,
          userId: resolvedUserId,
          label: typeof label === 'string' && label.trim() ? label.trim() : item.domain,
          ...(aiHook ? { aiHook } : {}),
          ...(aiDisclosure ? { aiDisclosure } : {}),
          createdAt: new Date().toISOString(),
        };
        savedLinks.push(record);
        try {
          await setDoc(doc(db, 'affiliate_links', record.id), record);
        } catch (dbErr) {
          console.warn('[API /api/affiliate/convert] Firestore save skipped:', dbErr);
          try {
            handleFirestoreError(dbErr, OperationType.WRITE, `affiliate_links/${record.id}`);
          } catch {
            // Non-blocking vault write
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      mode: isBulk ? 'bulk' : 'single',
      conversion: singleResult,
      bulk: bulkResult,
      aiHook,
      aiDisclosure,
      savedLinks,
      ...(quotaStatus ? { quota: quotaStatus } : {}),
    });
  } catch (error) {
    if (deductedFrom !== 'none' && deductedCost > 0) {
      await refundQuotaOrCredit(
        resolvedUserId,
        deductedFrom,
        deductedCost,
        'affiliate-link-converter'
      );
    }
    console.error('[API /api/affiliate/convert POST Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Affiliate link conversion failed.',
      },
      { status: 500 }
    );
  }
}
