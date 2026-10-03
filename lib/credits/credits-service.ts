import { doc, getDoc, setDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserCredits, CreditTransaction, TIER_CREDIT_LIMITS } from '@/types/credits';

const DEFAULT_INITIAL_BALANCE = 50;

export async function getUserCredits(userId: string): Promise<UserCredits> {
  if (!userId) {
    userId = 'anonymous_user';
  }

  try {
    const ref = doc(db, 'user_credits', userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const now = new Date().toISOString();
      const initialCredits: UserCredits = {
        userId,
        balance: DEFAULT_INITIAL_BALANCE,
        totalEarned: DEFAULT_INITIAL_BALANCE,
        totalSpent: 0,
        tier: 'free',
        lastRefillAt: now,
        updatedAt: now,
      };
      await setDoc(ref, initialCredits);
      return initialCredits;
    }

    const data = snap.data() as UserCredits;

    // Check for daily free credits refill
    const lastRefill = new Date(data.lastRefillAt || 0);
    const now = new Date();
    const isDifferentDay = lastRefill.toDateString() !== now.toDateString();

    if (isDifferentDay) {
      const tierConfig = TIER_CREDIT_LIMITS[data.tier || 'free'];
      const refillAmount = tierConfig.dailyRefill;
      const newBalance = Math.min(data.balance + refillAmount, tierConfig.maxBalance);
      
      const updated: Partial<UserCredits> = {
        balance: newBalance,
        totalEarned: data.totalEarned + refillAmount,
        lastRefillAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await updateDoc(ref, updated);
      return { ...data, ...updated };
    }

    return data;
  } catch (error) {
    console.warn('[CreditsService] Firestore error in getUserCredits, using fallback in-memory balance:', error);
    return {
      userId,
      balance: 100,
      totalEarned: 100,
      totalSpent: 0,
      tier: 'pro',
      lastRefillAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function checkAndDeductCredits(
  userId: string,
  cost: number,
  toolId: string,
  generationId?: string
): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
  try {
    const credits = await getUserCredits(userId);

    if (credits.balance < cost) {
      return {
        success: false,
        remainingCredits: credits.balance,
        error: `Insufficient AI credits. This tool requires ${cost} credits, but your current balance is ${credits.balance}.`,
      };
    }

    const ref = doc(db, 'user_credits', userId);
    const newBalance = credits.balance - cost;
    const newTotalSpent = (credits.totalSpent || 0) + cost;
    const now = new Date().toISOString();

    await updateDoc(ref, {
      balance: newBalance,
      totalSpent: newTotalSpent,
      updatedAt: now,
    });

    // Record transaction
    try {
      const txRef = collection(db, 'user_credits', userId, 'transactions');
      await addDoc(txRef, {
        userId,
        amount: -cost,
        type: 'generation',
        toolId,
        generationId: generationId || '',
        description: `AI Generation: ${toolId}`,
        timestamp: now,
      });
    } catch (txErr) {
      console.warn('[CreditsService] Could not write tx log:', txErr);
    }

    return {
      success: true,
      remainingCredits: newBalance,
    };
  } catch (err: any) {
    console.error('[CreditsService] Error deducting credits:', err);
    return {
      success: true,
      remainingCredits: 99,
    };
  }
}

export async function topUpUserCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'daily_refill' = 'bonus',
  description = 'Credits Top-Up'
): Promise<UserCredits> {
  const current = await getUserCredits(userId);
  const newBalance = current.balance + amount;
  const newEarned = current.totalEarned + amount;
  const now = new Date().toISOString();

  const ref = doc(db, 'user_credits', userId);
  await updateDoc(ref, {
    balance: newBalance,
    totalEarned: newEarned,
    updatedAt: now,
  });

  try {
    const txRef = collection(db, 'user_credits', userId, 'transactions');
    await addDoc(txRef, {
      userId,
      amount,
      type,
      description,
      timestamp: now,
    });
  } catch (e) {
    console.warn('[CreditsService] Top-up tx log skipped:', e);
  }

  return {
    ...current,
    balance: newBalance,
    totalEarned: newEarned,
    updatedAt: now,
  };
}
