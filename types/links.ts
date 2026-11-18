export type LinkRelType = 'dofollow' | 'nofollow' | 'sponsored' | 'ugc';
export type DetectedLinkCategory = 'external' | 'internal' | 'affiliate' | 'social';

export interface DetectedBacklink {
  id: string;
  url: string;
  domain: string;
  anchorText: string;
  rel: string;
  relType: LinkRelType;
  category: DetectedLinkCategory;
  matchesTargetDomain: boolean;
  isAffiliateCandidate: boolean;
  targetAttr: string;
}

export interface BacklinkScanSummary {
  totalLinks: number;
  externalLinks: number;
  internalLinks: number;
  dofollowCount: number;
  nofollowOrSponsoredCount: number;
  matchingBacklinksCount: number;
  affiliateLinksCount: number;
  uniqueExternalDomains: number;
}

export interface BacklinkAiAudit {
  seoScore: number;
  verdict: string;
  anchorInsights: string[];
  outreachPitch: string;
}

export interface BacklinkScanReport {
  id: string;
  userId: string;
  scannedUrl: string;
  scannedDomain: string;
  targetDomain: string;
  pageTitle: string;
  canonicalUrl: string;
  fetchStatus: number;
  fetchNote?: string;
  summary: BacklinkScanSummary;
  links: DetectedBacklink[];
  aiAudit?: BacklinkAiAudit | null;
  createdAt: string;
}

export type AffiliateNetworkPreset =
  | 'auto'
  | 'amazon'
  | 'impact'
  | 'clickbank'
  | 'shareasale'
  | 'cj'
  | 'rakuten'
  | 'custom';

export interface AffiliateConversionOptions {
  network: AffiliateNetworkPreset;
  affiliateTag: string;
  customParamKey?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  stripExistingTags?: boolean;
}

export interface AffiliateConversionResult {
  id: string;
  originalUrl: string;
  convertedUrl: string;
  detectedNetwork: Exclude<AffiliateNetworkPreset, 'auto'>;
  appliedParamKey: string;
  appliedTag: string;
  domain: string;
  shortSlug: string;
  htmlSnippet: string;
  markdownSnippet: string;
  isValid: boolean;
  error?: string;
}

export interface SavedAffiliateLink extends AffiliateConversionResult {
  userId: string;
  label?: string;
  aiHook?: string;
  aiDisclosure?: string;
  createdAt: string;
}
