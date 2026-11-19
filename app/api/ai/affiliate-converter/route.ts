import { NextRequest } from 'next/server';
import { handleStreamingToolRequest } from '@/lib/ai/tool-stream';
import { convertLinksInText } from '@/lib/links/affiliate-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function enrichAffiliatePrompt(rawPrompt: string): string {
  const { convertedText, conversions } = convertLinksInText(rawPrompt, {
    network: 'auto',
    affiliateTag: 'nisarai-20',
    stripExistingTags: true,
    utmSource: 'nisar-ai-studio',
    utmMedium: 'affiliate',
    utmCampaign: 'super-ai-toolbox',
  });

  if (conversions.length === 0) {
    return rawPrompt;
  }

  const summaryLines = conversions
    .map(
      (c, i) =>
        `${i + 1}. Network: ${c.detectedNetwork.toUpperCase()} | Converted URL: ${c.convertedUrl} | Markdown: ${c.markdownSnippet}`
    )
    .join('\n');

  return `${rawPrompt}\n\n[Real-Time Affiliate Conversion Results]\n${summaryLines}\n\nConverted Copy Preview:\n${convertedText}`;
}

export async function POST(req: NextRequest) {
  return handleStreamingToolRequest(req, {
    toolId: 'affiliate-link-converter',
    systemInstruction:
      'You are the Real-Time Affiliate Link Converter & Conversion Strategist at Nisar AI Studio. Present the converted tracking URL(s), clean Markdown and HTML rel="sponsored nofollow" snippets, a compliant FTC Affiliate Disclosure line, and 2 high-converting promotional CTA hooks.',
    promptTransformer: enrichAffiliatePrompt,
  });
}
