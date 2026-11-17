'use client';
import { useAuth } from '@/components/auth-provider';
import { Dashboard } from '@/components/dashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function DashboardPageRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0c10] text-slate-100">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-4" />
        <p className="font-mono text-xs text-slate-400">Loading user session...</p>
      </div>
    );
  }

  if (!user) return null;

  return <Dashboard />;
}
