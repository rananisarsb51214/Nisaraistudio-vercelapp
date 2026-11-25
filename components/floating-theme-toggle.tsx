'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { useAuth } from './auth-provider';
import type { ThemeMode } from '@/lib/services/userPreferenceService';

const DASHBOARD_ROUTE_PREFIXES = ['/dashboard', '/preview'];

export function FloatingThemeToggle() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, setTheme, isSavingTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dashboardShellActive, setDashboardShellActive] = useState(false);

  // Preserve the user's preferred dark variant ('black' root default or 'dark' navy)
  const lastDarkThemeRef = useRef<Exclude<ThemeMode, 'light'>>('black');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme === 'black' || theme === 'dark') {
      lastDarkThemeRef.current = theme;
    }
  }, [theme]);

  // Detect mounted Dashboard shell (e.g. when "/" renders <Dashboard /> in preview or signed-in mode)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const checkDashboardPresence = () => {
      setDashboardShellActive(
        Boolean(document.querySelector('[data-dashboard-shell="true"]'))
      );
    };

    checkDashboardPresence();

    const observer = new MutationObserver(checkDashboardPresence);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-dashboard-shell'],
    });

    return () => observer.disconnect();
  }, [pathname, user]);

  if (!mounted) {
    return null;
  }

  const isDashboardRoute = DASHBOARD_ROUTE_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  );

  if (isDashboardRoute || dashboardShellActive) {
    return null;
  }

  const isDark = theme === 'black' || theme === 'dark';

  const handleToggle = () => {
    if (isDark) {
      void setTheme('light');
    } else {
      void setTheme(lastDarkThemeRef.current);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
        title={
          isDark
            ? 'Dark mode active — click to switch to Light mode'
            : 'Light mode active — click to switch to Dark mode'
        }
        className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold backdrop-blur-md shadow-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
          isDark
            ? theme === 'black'
              ? 'bg-[#0a0a0a]/95 text-neutral-100 border-neutral-700 hover:border-neutral-500 shadow-black/60 focus-visible:ring-offset-black'
              : 'bg-[#0B0F19]/95 text-slate-100 border-slate-700 hover:border-[#00D9FF]/60 shadow-slate-950/60 focus-visible:ring-offset-[#050811]'
            : 'bg-white/95 text-slate-950 border-slate-300 hover:border-slate-900 shadow-slate-900/10 focus-visible:ring-offset-white'
        }`}
      >
        {isSavingTheme ? (
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500 shrink-0" />
        ) : isDark ? (
          <Sun className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <Moon className="w-4 h-4 text-slate-900 shrink-0" />
        )}
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    </div>
  );
}
