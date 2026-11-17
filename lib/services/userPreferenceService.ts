import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export const USER_PREFERENCES_COLLECTION = 'user_preferences';

export type ThemeMode = 'dark' | 'light';

export interface UserPreferences {
  favoriteTools?: string[];
  theme?: ThemeMode;
  tenantId: string;
  updatedAt?: any;
}

export const userPreferenceService = {
  // Get document reference for user preferences / metadata
  getUserPreferencesRef: (userId: string) => {
    return doc(db, USER_PREFERENCES_COLLECTION, userId);
  },

  // Read user preferences from Firestore
  getUserPreferences: async (userId: string): Promise<UserPreferences | null> => {
    if (!userId) return null;
    const docRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return snap.data() as UserPreferences;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${USER_PREFERENCES_COLLECTION}/${userId}`);
      return null;
    }
  },

  // Persist theme preference in Firestore user metadata
  setThemePreference: async (userId: string, theme: ThemeMode): Promise<ThemeMode> => {
    if (!userId) return theme;
    const normalizedTheme: ThemeMode = theme === 'light' ? 'light' : 'dark';
    const docRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
    try {
      await setDoc(
        docRef,
        {
          theme: normalizedTheme,
          tenantId: userId,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
      return normalizedTheme;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${USER_PREFERENCES_COLLECTION}/${userId}`);
      return normalizedTheme;
    }
  },

  // Toggle favorite tool status in Firestore
  toggleFavoriteTool: async (userId: string, currentFavorites: string[], toolId: string): Promise<string[]> => {
    if (!userId) return currentFavorites;

    const isFavorited = currentFavorites.includes(toolId);
    const updatedFavorites = isFavorited
      ? currentFavorites.filter(id => id !== toolId)
      : [...currentFavorites, toolId];

    const docRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
    try {
      await setDoc(
        docRef,
        {
          favoriteTools: updatedFavorites,
          tenantId: userId,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
      return updatedFavorites;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${USER_PREFERENCES_COLLECTION}/${userId}`);
      return currentFavorites;
    }
  },

  // Set initial favorite tools if empty
  setFavoriteTools: async (userId: string, favoriteTools: string[]) => {
    if (!userId) return;
    const docRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
    try {
      await setDoc(
        docRef,
        {
          favoriteTools,
          tenantId: userId,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${USER_PREFERENCES_COLLECTION}/${userId}`);
    }
  },
};
