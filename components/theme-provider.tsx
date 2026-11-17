'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { useAuth } from './auth-provider';
import { handleFirestoreError, OperationType } from '@/lib/firebase';
import { ThemeMode, USER_PREFERENCES_COLLECTION, userPreferenceService } from '@/lib/services/userPreferenceService';

const THEME_STORAGE_KEY = 'nisar-studio-theme';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (nextTheme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  isSavingTheme: boolean;
  themeSyncError: string | null;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: async () => {},
  toggleTheme: async () => {},
  isSavingTheme: false,
  themeSyncError: null,
});

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light-high-contrast');
  } else {
    root.classList.remove('dark');
    root.classList.add('light-high-contrast');
  }
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage access restrictions
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [themeSyncError, setThemeSyncError] = useState<string | null>(null);

  // Hydrate initial cached theme on client mount before auth resolves
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
        applyThemeToDom(saved);
        return;
      }
    } catch {
      // Ignore storage access errors
    }
    applyThemeToDom('dark');
  }, []);

  // Subscribe to Firestore user_preferences/{uid} metadata once auth is ready
  useEffect(() => {
    if (authLoading || !user?.uid) return;

    const prefRef = userPreferenceService.getUserPreferencesRef(user.uid);
    const unsubscribe = onSnapshot(
      prefRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const remoteTheme = data?.theme;
          if (remoteTheme === 'light' || remoteTheme === 'dark') {
            setThemeState(remoteTheme);
            applyThemeToDom(remoteTheme);
          }
        }
        setThemeSyncError(null);
      },
      (error) => {
        setThemeSyncError('Could not sync theme preference from Firestore.');
        try {
          handleFirestoreError(error, OperationType.GET, `${USER_PREFERENCES_COLLECTION}/${user.uid}`);
        } catch (err) {
          console.error('Theme preference snapshot error:', err);
        }
      }
    );

    return () => unsubscribe();
  }, [authLoading, user?.uid]);

  const setTheme = useCallback(
    async (nextTheme: ThemeMode) => {
      const normalized: ThemeMode = nextTheme === 'light' ? 'light' : 'dark';
      setThemeState(normalized);
      applyThemeToDom(normalized);
      setThemeSyncError(null);

      if (!user?.uid) return;

      setIsSavingTheme(true);
      try {
        await userPreferenceService.setThemePreference(user.uid, normalized);
      } catch (err) {
        console.error('Failed to persist theme preference:', err);
        setThemeSyncError('Theme applied locally; failed to sync to Firestore.');
      } finally {
        setIsSavingTheme(false);
      }
    },
    [user?.uid]
  );

  const toggleTheme = useCallback(async () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    await setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isSavingTheme,
        themeSyncError,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
