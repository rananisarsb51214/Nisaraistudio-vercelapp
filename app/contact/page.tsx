import type { Metadata } from 'next';
import { ToolPageNav } from '@/components/tools/ToolPageNav';
import { LeadForm } from '@/components/lead-form';
import { BRAND_NAME, SITE_URL } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Contact Nisar AI Studio',
  description:
    'Book a free AI automation consultation or submit your inquiry directly to Nisar AI Studio with instant WhatsApp follow-up.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `Contact ${BRAND_NAME}`,
    url: `${SITE_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] black:bg-black text-slate-950 dark:text-slate-100 black:text-neutral-100 transition-colors duration-150">
      <ToolPageNav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-mono font-semibold text-indigo-700 dark:text-[#00D9FF]">
            {BRAND_NAME} · Direct Inquiry
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Contact &amp; Free Offer Booking
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Submit your contact details below — every inquiry is saved securely in Firestore and automatically prepared with an instant follow-up reply.
          </p>
        </div>

        <LeadForm source="landing" />
      </main>
    </div>
  );
}
