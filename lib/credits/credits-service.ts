import { doc, collection, addDoc, runTransaction } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import {
  DAILY_FREE_LIMIT,
  UserCredits,
  CreditDeductionResult,
  getUtcDateString,
  normalizeUserCredits,
} from '@/types/credits';

export async function getUserCredits(userId: string): Promise<UserCredits> {
  const safeUserId = userId?.trim() || 'default_user';
  const docPath = `user_credits/${safeUserId}`;
  const ref = doc(db, 'user_credits', safeUserId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const todayStr = getUtcDateString();
      const nowIso = new Date().toISOString();

      if (!snap.exists()) {
        const initialCredits = normalizeUserCredits(safeUserId, null);
        transaction.set(ref, initialCredits);
        return initialCredits;
      }

      const raw = snap.data() as Partial<UserCredits>;
      const normalized = normalizeUserCredits(safeUserId, raw);

      const needsSync =
        raw.lastResetDate !== todayStr ||
        typeof raw.paidCredits !== 'number' ||
        typeof raw.dailyUsed !== 'number' ||
        typeof raw.dailyLimit !== 'number' ||
        raw.balance !== normalized.paidCredits;

      if (needsSync) {
        transaction.set(
          ref,
          {
            ...normalized,
            updatedAt: nowIso,
          },
          { merge: true }
        );
      }

      return normalized;
    });

    return result;
  } catch (error) {
    console.error('[CreditsService] getUserCredits transaction error:', error);
    try {
      handleFirestoreError(error, OperationType.GET, docPath);
    } catch {
      // Surface clean error context without crashing read endpoint unexpectedly if offline
    }
    throw error;
  }
}

export async function checkAndDeductCredits(
  userId: string,
  cost: number,
  toolId: string,
  generationId?: string
): Promise<CreditDeductionResult> {
  const safeUserId = userId?.trim() || 'default_user';
  const effectiveCost = Math.max(1, Number.isFinite(cost) ? Math.round(cost) : 1);
  const docPath = `user_credits/${safeUserId}`;
  const ref = doc(db, 'user_credits', safeUserId);

  try {
    const txResult = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const nowIso = new Date().toISOString();
      const todayStr = getUtcDateString();

      const current = normalizeUserCredits(
        safeUserId,
        snap.exists() ? (snap.data() as Partial<UserCredits>) : null
      );

      if (current.dailyUsed < current.dailyLimit) {
        const nextDailyUsed = current.dailyUsed + 1;
        const remainingFree = Math.max(0, current.dailyLimit - nextDailyUsed);

        const nextDoc: UserCredits = {
          ...current,
          dailyUsed: nextDailyUsed,
          lastResetDate: todayStr,
          updatedAt: nowIso,
        };

        transaction.set(ref, nextDoc, { merge: true });

        return {
          success: true,
          remainingCredits: nextDoc.paidCredits,
          deductedCost: 1,
          deductedFrom: 'daily_free' as const,
          quota: {
            dailyUsed: nextDailyUsed,
            dailyLimit: nextDoc.dailyLimit,
            remainingFree,
            paidCredits: nextDoc.paidCredits,
            lastResetDate: todayStr,
            deductedFrom: 'daily_free' as const,
          },
        };
      }

      if (current.paidCredits >= effectiveCost) {
        const nextPaidCredits = current.paidCredits - effectiveCost;
        const nextTotalSpent = (current.totalSpent || 0) + effectiveCost;

        const nextDoc: UserCredits = {
          ...current,
          paidCredits: nextPaidCredits,
          balance: nextPaidCredits,
          totalSpent: nextTotalSpent,
          lastResetDate: todayStr,
          updatedAt: nowIso,
        };

        transaction.set(ref, nextDoc, { merge: true });

        return {
          success: true,
          remainingCredits: nextPaidCredits,
          deductedCost: effectiveCost,
          deductedFrom: 'paid_credits' as const,
          quota: {
            dailyUsed: nextDoc.dailyUsed,
            dailyLimit: nextDoc.dailyLimit,
            remainingFree: 0,
            paidCredits: nextPaidCredits,
            lastResetDate: todayStr,
            deductedFrom: 'paid_credits' as const,
          },
        };
      }

      // Neither free daily quota nor paid credits are sufficient
      if (!snap.exists() || snap.data()?.lastResetDate !== todayStr) {
        transaction.set(ref, current, { merge: true });
      }

      return {
        success: false,
        code: 'LIMIT_REACHED' as const,
        remainingCredits: current.paidCredits,
        deductedCost: 0,
        deductedFrom: 'none' as const,
        quota: {
          dailyUsed: current.dailyUsed,
          dailyLimit: current.dailyLimit,
          remainingFree: 0,
          paidCredits: current.paidCredits,
          lastResetDate: todayStr,
          deductedFrom: 'none' as const,
        },
        error: `Daily free limit (${current.dailyLimit}/${current.dailyLimit}) reached and paid credits (${current.paidCredits}) are insufficient for ${effectiveCost} credits.`,
      };
    });

    if (txResult.success) {
      try {
        const txRef = collection(db, 'user_credits', safeUserId, 'transactions');
        await addDoc(txRef, {
          userId: safeUserId,
          amount: txResult.deductedFrom === 'daily_free' ? 0 : -txResult.deductedCost,
          type: 'generation',
          toolId,
          generationId: generationId || '',
          description:
            txResult.deductedFrom === 'daily_free'
              ? `Daily Free Quota (${txResult.quota.dailyUsed}/${txResult.quota.dailyLimit}): ${toolId}`
              : `AI Generation (${txResult.deductedCost} paid credits): ${toolId}`,
          timestamp: new Date().toISOString(),
        });
      } catch (txErr) {
        console.warn('[CreditsService] Could not write tx log:', txErr);
      }
    }

    return txResult;
  } catch (err) {
    console.error('[CreditsService] Atomic quota/credit deduction failed:', err);
    try {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    } catch {
      // Return structured failure rather than faking success
    }
    return {
      success: false,
      code: 'TRANSACTION_FAILED',
      remainingCredits: 0,
      deductedCost: 0,
      deductedFrom: 'none',
      quota: {
        dailyUsed: DAILY_FREE_LIMIT,
        dailyLimit: DAILY_FREE_LIMIT,
        remainingFree: 0,
        paidCredits: 0,
        lastResetDate: getUtcDateString(),
        deductedFrom: 'none',
      },
      error: err instanceof Error ? err.message : 'Unable to verify quota due to database error.',
    };
  }
}

export async function refundQuotaOrCredit(
  userId: string,
  deductedFrom: 'daily_free' | 'paid_credits' | 'none',
  amount: number,
  toolId: string
): Promise<void> {
  if (deductedFrom === 'none' || amount <= 0) return;

  const safeUserId = userId?.trim() || 'default_user';
  const ref = doc(db, 'user_credits', safeUserId);

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) return;

      const todayStr = getUtcDateString();
      const current = normalizeUserCredits(safeUserId, snap.data() as Partial<UserCredits>);
      const nowIso = new Date().toISOString();

      if (deductedFrom === 'daily_free' && current.lastResetDate === todayStr) {
        transaction.set(
          ref,
          {
            dailyUsed: Math.max(0, current.dailyUsed - 1),
            updatedAt: nowIso,
          },
          { merge: true }
        );
      } else if (deductedFrom === 'paid_credits') {
        const nextPaid = current.paidCredits + amount;
        transaction.set(
          ref,
          {
            paidCredits: nextPaid,
            balance: nextPaid,
            totalSpent: Math.max(0, current.totalSpent - amount),
            updatedAt: nowIso,
          },
          { merge: true }
        );
      }
    });

    try {
      const txRef = collection(db, 'user_credits', safeUserId, 'transactions');
      await addDoc(txRef, {
        userId: safeUserId,
        amount: deductedFrom === 'paid_credits' ? amount : 0,
        type: 'refund',
        toolId,
        description: `Automatic rollback after generation failure: ${toolId}`,
        timestamp: new Date().toISOString(),
      });
    } catch (txErr) {
      console.warn('[CreditsService] Refund tx log skipped:', txErr);
    }
  } catch (err) {
    console.warn('[CreditsService] Refund failed:', err);
  }
}

export async function topUpUserCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'daily_refill' = 'bonus',
  description = 'Paid Credits Top-Up'
): Promise<UserCredits> {
  const safeUserId = userId?.trim() || 'default_user';
  const validAmount = Math.max(1, Math.round(Number(amount) || 0));
  const docPath = `user_credits/${safeUserId}`;
  const ref = doc(db, 'user_credits', safeUserId);

  try {
    const updated = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const current = normalizeUserCredits(
        safeUserId,
        snap.exists() ? (snap.data() as Partial<UserCredits>) : null
      );
      const nowIso = new Date().toISOString();
      const nextPaid = current.paidCredits + validAmount;
      const nextEarned = current.totalEarned + validAmount;

      const nextDoc: UserCredits = {
        ...current,
        paidCredits: nextPaid,
        balance: nextPaid,
        totalEarned: nextEarned,
        lastRefillAt: nowIso,
        updatedAt: nowIso,
      };

      transaction.set(ref, nextDoc, { merge: true });
      return nextDoc;
    });

    try {
      const txRef = collection(db, 'user_credits', safeUserId, 'transactions');
      await addDoc(txRef, {
        userId: safeUserId,
        amount: validAmount,
        type,
        description,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[CreditsService] Top-up tx log skipped:', e);
    }

    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export interface AdminCreditUpdateInput {
  paidCredits?: number;
  adjustPaidDelta?: number;
  dailyLimit?: number;
  resetDailyUsed?: boolean;
  tier?: UserCredits['tier'];
  description?: string;
}

export async function adminUpdateUserCredits(
  userId: string,
  updates: AdminCreditUpdateInput
): Promise<UserCredits> {
  const safeUserId = userId?.trim() || 'default_user';
  const docPath = `user_credits/${safeUserId}`;
  const ref = doc(db, 'user_credits', safeUserId);

  try {
    const updated = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const current = normalizeUserCredits(
        safeUserId,
        snap.exists() ? (snap.data() as Partial<UserCredits>) : null
      );
      const nowIso = new Date().toISOString();
      const todayStr = getUtcDateString();

      let nextPaid = current.paidCredits;
      if (typeof updates.paidCredits === 'number' && Number.isFinite(updates.paidCredits)) {
        nextPaid = Math.max(0, Math.min(1000000, Math.round(updates.paidCredits)));
      } else if (typeof updates.adjustPaidDelta === 'number' && Number.isFinite(updates.adjustPaidDelta)) {
        nextPaid = Math.max(0, Math.min(1000000, current.paidCredits + Math.round(updates.adjustPaidDelta)));
      }

      const nextDailyLimit =
        typeof updates.dailyLimit === 'number' && Number.isFinite(updates.dailyLimit)
          ? Math.max(0, Math.min(10000, Math.round(updates.dailyLimit)))
          : current.dailyLimit;

      const nextDailyUsed = updates.resetDailyUsed ? 0 : current.dailyUsed;
      const nextTier = updates.tier || current.tier;

      const deltaPaid = nextPaid - current.paidCredits;
      const nextEarned = deltaPaid > 0 ? current.totalEarned + deltaPaid : current.totalEarned;

      const nextDoc: UserCredits = {
        ...current,
        paidCredits: nextPaid,
        balance: nextPaid,
        dailyLimit: nextDailyLimit,
        dailyUsed: nextDailyUsed,
        lastResetDate: todayStr,
        totalEarned: nextEarned,
        tier: nextTier,
        lastRefillAt: deltaPaid > 0 ? nowIso : current.lastRefillAt,
        updatedAt: nowIso,
      };

      transaction.set(ref, nextDoc, { merge: true });
      return nextDoc;
    });

    try {
      const txRef = collection(db, 'user_credits', safeUserId, 'transactions');
      await addDoc(txRef, {
        userId: safeUserId,
        amount: typeof updates.adjustPaidDelta === 'number' ? Math.round(updates.adjustPaidDelta) : 0,
        type: 'bonus',
        description: updates.description || 'Admin Panel Credits Control adjustment',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[CreditsService] Admin update tx log skipped:', e);
    }

    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}
