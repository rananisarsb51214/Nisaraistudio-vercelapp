'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/dashboard';
import { useAuth } from '@/components/auth-provider';

export default function DashboardPreviewPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#080b0e] dark:text-slate-100 selection:bg-emerald-500/30 transition-colors">
      <Dashboard
        previewMode={!user}
        onExitPreview={!user ? () => router.push('/') : undefined}
      />
    </div>
  );
}
