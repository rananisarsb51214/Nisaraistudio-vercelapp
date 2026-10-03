import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

const USER_PREFERENCES_COLLECTION = 'user_preferences';

export interface UserPreferences {
  favoriteTools: string[];
  tenantId: string;
  updatedAt?: any;
}

export const userPreferenceService = {
  // Get document reference for user preferences
  getUserPreferencesRef: (userId: string) => {
    return doc(db, USER_PREFERENCES_COLLECTION, userId);
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
      await setDoc(docRef, {
        favoriteTools: updatedFavorites,
        tenantId: userId,
        updatedAt: Timestamp.now(),
      }, { merge: true });
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
      await setDoc(docRef, {
        favoriteTools,
        tenantId: userId,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${USER_PREFERENCES_COLLECTION}/${userId}`);
    }
  }
};
