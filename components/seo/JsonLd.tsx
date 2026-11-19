import { BRAND_DESCRIPTION, BRAND_NAME, SITE_URL } from '@/lib/seo/site-config';

export function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/og-image.png`,
        },
        founder: {
          '@type': 'Person',
          name: 'Muhammad Nisar',
        },
        sameAs: [
          'https://github.com/rananisarsb51214',
          'https://www.youtube.com/@Billukittentailz',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: BRAND_NAME,
        url: SITE_URL,
        description: BRAND_DESCRIPTION,
        publisher: {
          '@id': `${SITE_URL}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#software`,
        name: 'Super AI Tool Box',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: `${SITE_URL}/tools`,
        description:
          'Unified AI automation studio featuring 10+ Gemini-powered workflows, persistent Firestore memory chatbot, SEO audits, and 10 daily free AI credits.',
        creator: {
          '@id': `${SITE_URL}/#organization`,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: '10 daily free AI credits across Super AI Tool Box tools.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
