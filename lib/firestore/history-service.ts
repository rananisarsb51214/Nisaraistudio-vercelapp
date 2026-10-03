import { 
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where, orderBy, limit 
} from 'firebase/firestore';
import { db } from '../firebase';
import { GenerationHistoryItem, GenerationFilter } from '@/types/generation';

export async function saveGenerationHistory(item: GenerationHistoryItem): Promise<void> {
  try {
    const ref = doc(db, 'ai_history', item.id);
    await setDoc(ref, item);
  } catch (error) {
    console.warn('[HistoryService] Firestore save history warning:', error);
  }
}

export async function getUserGenerationHistory(
  userId: string,
  filter?: GenerationFilter
): Promise<GenerationHistoryItem[]> {
  try {
    const colRef = collection(db, 'ai_history');
    let q = query(colRef, where('userId', '==', userId));

    const snap = await getDocs(q);
    let items: GenerationHistoryItem[] = [];

    snap.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as GenerationHistoryItem);
    });

    // Client-side sorting & filtering to avoid index errors
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter?.category) {
      items = items.filter((i) => i.category === filter.category);
    }
    if (filter?.toolId) {
      items = items.filter((i) => i.toolId === filter.toolId);
    }
    if (filter?.onlyFavorites) {
      items = items.filter((i) => i.isFavorite);
    }
    if (filter?.searchQuery) {
      const qLower = filter.searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.toolName.toLowerCase().includes(qLower) ||
          i.promptSummary.toLowerCase().includes(qLower) ||
          i.output.toLowerCase().includes(qLower)
      );
    }

    if (filter?.limit) {
      items = items.slice(0, filter.limit);
    }

    return items;
  } catch (error) {
    console.warn('[HistoryService] Error retrieving history, returning empty array:', error);
    return [];
  }
}

export async function toggleFavoriteHistory(historyId: string, isFavorite: boolean): Promise<void> {
  try {
    const ref = doc(db, 'ai_history', historyId);
    await updateDoc(ref, { isFavorite });
  } catch (error) {
    console.warn('[HistoryService] Error toggling favorite:', error);
  }
}

export async function deleteHistoryItem(historyId: string): Promise<void> {
  try {
    const ref = doc(db, 'ai_history', historyId);
    await deleteDoc(ref);
  } catch (error) {
    console.warn('[HistoryService] Error deleting history item:', error);
  }
}
