import type {
  AffiliateConversionOptions,
  AffiliateConversionResult,
  AffiliateNetworkPreset,
} from '@/types/links';

const TRACKING_AND_AFFILIATE_PARAMS = new Set([
  'tag',
  'ascsubtag',
  'ref',
  'ref_',
  'aff_id',
  'affid',
  'affiliate',
  'hop',
  'irclickid',
  'irgwc',
  'clickid',
  'cjevent',
  'sscid',
  'ranmid',
  'raneaid',
  'ransiteid',
  'via',
  'partner',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
]);

export function detectAffiliateNetworkFromHost(
  hostname: string
): Exclude<AffiliateNetworkPreset, 'auto'> {
  const host = hostname.toLowerCase();
  if (host.includes('amazon.') || host === 'amzn.to' || host.endsWith('.amzn.to')) {
    return 'amazon';
  }
  if (host.includes('clickbank.') || host.includes('hop.clickbank')) {
    return 'clickbank';
  }
  if (host.includes('shareasale.')) {
    return 'shareasale';
  }
  if (host.includes('cj.com') || host.includes('dpbolvw.') || host.includes('anrdoezrs.')) {
    return 'cj';
  }
  if (host.includes('rakuten.') || host.includes('linksynergy.')) {
    return 'rakuten';
  }
  if (host.includes('impact.com') || host.includes('sjv.io') || host.includes('pxf.io')) {
    return 'impact';
  }
  return 'custom';
}

export function getParamKeyForNetwork(
  network: Exclude<AffiliateNetworkPreset, 'auto'>,
  customParamKey?: string
): string {
  switch (network) {
    case 'amazon':
      return 'tag';
    case 'clickbank':
      return 'hop';
    case 'impact':
      return 'irgwc';
    case 'shareasale':
      return 'afftrack';
    case 'cj':
      return 'cjevent';
    case 'rakuten':
      return 'murl';
    case 'custom':
    default: {
      const sanitized = (customParamKey || 'ref').replace(/[^a-zA-Z0-9_-]/g, '');
      return sanitized || 'ref';
    }
  }
}

export function buildShortSlug(urlObj: URL): string {
  const hostPart = urlObj.hostname
    .replace(/^www\./, '')
    .split('.')[0]
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 10)
    .toLowerCase();
  const pathPart = urlObj.pathname
    .split('/')
    .filter(Boolean)
    .slice(-1)[0]
    ?.replace(/[^a-z0-9-]/gi, '')
    .slice(0, 14)
    .toLowerCase();
  const suffix = Math.abs(
    Array.from(urlObj.href).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7)
  )
    .toString(36)
    .slice(0, 4);

  return [hostPart || 'link', pathPart || 'offer', suffix].filter(Boolean).join('-');
}

export function convertSingleAffiliateUrl(
  rawUrl: string,
  options: AffiliateConversionOptions
): AffiliateConversionResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      id: `aff_${Date.now()}`,
      originalUrl: rawUrl,
      convertedUrl: '',
      detectedNetwork: 'custom',
      appliedParamKey: 'ref',
      appliedTag: options.affiliateTag,
      domain: '',
      shortSlug: '',
      htmlSnippet: '',
      markdownSnippet: '',
      isValid: false,
      error: 'URL is empty.',
    };
  }

  let normalizedInput = trimmed;
  if (!/^https?:\/\//i.test(normalizedInput)) {
    normalizedInput = `https://${normalizedInput}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedInput);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Only HTTP and HTTPS links are supported.');
    }
  } catch (err) {
    return {
      id: `aff_${Date.now()}`,
      originalUrl: rawUrl,
      convertedUrl: rawUrl,
      detectedNetwork: 'custom',
      appliedParamKey: 'ref',
      appliedTag: options.affiliateTag,
      domain: '',
      shortSlug: '',
      htmlSnippet: '',
      markdownSnippet: '',
      isValid: false,
      error: err instanceof Error ? err.message : 'Invalid URL format.',
    };
  }

  const resolvedNetwork =
    options.network === 'auto'
      ? detectAffiliateNetworkFromHost(parsed.hostname)
      : options.network;

  if (options.stripExistingTags) {
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (TRACKING_AND_AFFILIATE_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key);
      }
    }
  }

  const paramKey = getParamKeyForNetwork(resolvedNetwork, options.customParamKey);
  const cleanTag = options.affiliateTag.trim();
  if (cleanTag) {
    parsed.searchParams.set(paramKey, cleanTag);
  }

  if (options.utmSource?.trim()) {
    parsed.searchParams.set('utm_source', options.utmSource.trim());
  }
  if (options.utmMedium?.trim()) {
    parsed.searchParams.set('utm_medium', options.utmMedium.trim());
  }
  if (options.utmCampaign?.trim()) {
    parsed.searchParams.set('utm_campaign', options.utmCampaign.trim());
  }

  const convertedUrl = parsed.toString();
  const domain = parsed.hostname.replace(/^www\./, '');
  const shortSlug = buildShortSlug(parsed);
  const anchorLabel = `Check ${domain} Offer`;
  const htmlSnippet = `<a href="${convertedUrl}" rel="sponsored nofollow noopener noreferrer" target="_blank">${anchorLabel}</a>`;
  const markdownSnippet = `[${anchorLabel}](${convertedUrl})`;

  return {
    id: `aff_${shortSlug}_${Date.now().toString(36)}`,
    originalUrl: trimmed,
    convertedUrl,
    detectedNetwork: resolvedNetwork,
    appliedParamKey: paramKey,
    appliedTag: cleanTag,
    domain,
    shortSlug,
    htmlSnippet,
    markdownSnippet,
    isValid: true,
  };
}

const URL_REGEX = /https?:\/\/[^\s<>"'`)\]]+/gi;

export function convertLinksInText(
  rawText: string,
  options: AffiliateConversionOptions
): {
  convertedText: string;
  conversions: AffiliateConversionResult[];
} {
  const conversions: AffiliateConversionResult[] = [];
  const seen = new Map<string, AffiliateConversionResult>();

  const convertedText = rawText.replace(URL_REGEX, (match) => {
    // Strip trailing sentence punctuation cleanly if present
    let cleanMatch = match;
    let trailing = '';
    while (/[.,;:!?]$/.test(cleanMatch)) {
      trailing = cleanMatch.slice(-1) + trailing;
      cleanMatch = cleanMatch.slice(0, -1);
    }

    let result = seen.get(cleanMatch);
    if (!result) {
      result = convertSingleAffiliateUrl(cleanMatch, options);
      seen.set(cleanMatch, result);
      if (result.isValid) {
        conversions.push(result);
      }
    }
    return (result.isValid ? result.convertedUrl : cleanMatch) + trailing;
  });

  return { convertedText, conversions };
}
