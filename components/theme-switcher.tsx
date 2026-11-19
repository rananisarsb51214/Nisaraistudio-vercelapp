'use client';

import React from 'react';
import { Contrast, Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import type { ThemeMode } from '@/lib/services/userPreferenceService';

interface ThemeSwitcherProps {
  compact?: boolean;
  className?: string;
}

const THEME_OPTIONS: {
  id: ThemeMode;
  label: string;
  shortLabel: string;
  title: string;
}[] = [
  {
    id: 'black',
    label: 'Black',
    shortLabel: 'Black',
    title: 'Pure Pitch Black Dashboard',
  },
  {
    id: 'dark',
    label: 'Navy',
    shortLabel: 'Dark',
    title: 'Midnight Neon Dark Dashboard',
  },
  {
    id: 'light',
    label: 'Light',
    shortLabel: 'Light',
    title: 'High-Contrast Light Dashboard',
  },
];

export function ThemeSwitcher({ compact = false, className = '' }: ThemeSwitcherProps) {
  const { theme, setTheme, toggleTheme, isSavingTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void toggleTheme()}
        aria-label={`Dashboard theme: ${theme}. Click to switch color mode`}
        title={`Current theme: ${theme.toUpperCase()} — click to cycle Black / Dark / Light`}
        className={`inline-flex min-h-[38px] items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          theme === 'light'
            ? 'bg-white text-slate-950 border-slate-300 hover:bg-slate-100'
            : theme === 'black'
            ? 'bg-black text-white border-neutral-700 hover:border-neutral-500'
            : 'bg-[#0B0F19] text-slate-100 border-slate-700 hover:border-[#00D9FF]/60'
        } ${className}`}
      >
        {isSavingTheme ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 shrink-0" />
        ) : theme === 'black' ? (
          <Contrast className="w-3.5 h-3.5 text-white shrink-0" />
        ) : theme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-[#00D9FF] shrink-0" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        )}
        <span className="font-mono capitalize">{theme}</span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Dashboard color theme toggle"
      className={`inline-flex items-center gap-0.5 p-1 rounded-xl border whitespace-nowrap shrink-0 transition-colors duration-150 ${
        theme === 'light'
          ? 'bg-slate-100 border-slate-300'
          : theme === 'black'
          ? 'bg-[#0a0a0a] border-neutral-800'
          : 'bg-[#0B0F19] border-slate-800'
      } ${className}`}
    >
      {THEME_OPTIONS.map((option) => {
        const isActive = theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => void setTheme(option.id)}
            aria-pressed={isActive}
            title={option.title}
            className={`inline-flex min-h-[30px] items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isActive
                ? option.id === 'black'
                  ? 'bg-black text-white border border-neutral-600 shadow-xs'
                  : option.id === 'dark'
                  ? 'bg-[#131b2e] text-[#00D9FF] border border-[#00D9FF]/40'
                  : 'bg-white text-slate-950 border border-slate-300 shadow-xs'
                : 'border border-transparent text-slate-500 dark:text-slate-400 black:text-neutral-400 hover:text-slate-900 dark:hover:text-white black:hover:text-white'
            }`}
          >
            {isSavingTheme && isActive ? (
              <Loader2 className="w-3 h-3 animate-spin text-emerald-500 shrink-0" />
            ) : option.id === 'black' ? (
              <Contrast className="w-3 h-3 shrink-0" />
            ) : option.id === 'dark' ? (
              <Moon className="w-3 h-3 shrink-0" />
            ) : (
              <Sun className="w-3 h-3 shrink-0" />
            )}
            <span className="hidden xl:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
