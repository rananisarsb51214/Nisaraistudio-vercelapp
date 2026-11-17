'use client';

import React from 'react';
import { Moon, Sun, Loader2 } from 'lucide-react';
import { useTheme } from './theme-provider';

interface ThemeSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function ThemeSwitcher({ compact = false, className = '' }: ThemeSwitcherProps) {
  const { theme, toggleTheme, isSavingTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={() => void toggleTheme()}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to high-contrast light mode'}
      aria-pressed={isLight}
      title={
        isLight
          ? 'High-Contrast Light Mode active — click for Dark Mode'
          : 'Dark Mode active — click for High-Contrast Light Mode'
      }
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-emerald-400 ${
        isLight
          ? 'bg-white text-slate-950 border-slate-900 hover:bg-slate-100 shadow-xs'
          : 'bg-[#1e2230] text-slate-100 border-slate-700 hover:bg-[#272b3c] hover:border-emerald-500/50'
      } ${className}`}
    >
      {isSavingTheme ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700 dark:text-emerald-400 shrink-0" />
      ) : isLight ? (
        <Moon className="w-3.5 h-3.5 text-slate-950 shrink-0" />
      ) : (
        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      )}
      {!compact && (
        <span className="font-mono">
          {isLight ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}
