import {
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

export type UserPlanTier = 'FREE' | 'STARTER' | 'PRO';

export interface StudioUserProfile {
  uid: string;
  email: string;
  displayName: string;
  plan: UserPlanTier;
  credits: number;
  dailyFreeRemaining: number;
  dailyLimit: number;
  lastResetDate: string;
  updatedAt?: unknown;
  createdAt?: unknown;
}

const DAILY_FREE_CREDITS = 10;

function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function ensureUserQuotaProfile(user: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}): Promise<StudioUserProfile> {
  if (!db) {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Studio User',
      plan: 'FREE',
      credits: DAILY_FREE_CREDITS,
      dailyFreeRemaining: DAILY_FREE_CREDITS,
      dailyLimit: DAILY_FREE_CREDITS,
      lastResetDate: todayUtcDate(),
    };
  }

  const userRef = doc(db, 'users', user.uid);
  const today = todayUtcDate();

  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(userRef);

      if (!snap.exists()) {
        const fresh: StudioUserProfile = {
          uid: user.uid,
          email: (user.email || '').slice(0, 160),
          displayName: (user.displayName || 'Studio User').slice(0, 120),
          plan: 'FREE',
          credits: DAILY_FREE_CREDITS,
          dailyFreeRemaining: DAILY_FREE_CREDITS,
          dailyLimit: DAILY_FREE_CREDITS,
          lastResetDate: today,
        };
        tx.set(userRef, {
          ...fresh,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return fresh;
      }

      const data = snap.data() as Partial<StudioUserProfile>;
      const existingPlan: UserPlanTier =
        data.plan === 'PRO' || data.plan === 'STARTER' ? data.plan : 'FREE';
      const existingCredits =
        typeof data.credits === 'number' && Number.isFinite(data.credits)
          ? Math.max(0, data.credits)
          : DAILY_FREE_CREDITS;
      const existingDailyRemaining =
        typeof data.dailyFreeRemaining === 'number' &&
        Number.isFinite(data.dailyFreeRemaining)
          ? Math.max(0, data.dailyFreeRemaining)
          : DAILY_FREE_CREDITS;

      if (data.lastResetDate !== today) {
        const toppedCredits = Math.max(existingCredits, DAILY_FREE_CREDITS);
        const updated: StudioUserProfile = {
          uid: user.uid,
          email: (user.email || data.email || '').slice(0, 160),
          displayName: (user.displayName || data.displayName || 'Studio User').slice(0, 120),
          plan: existingPlan,
          credits: toppedCredits,
          dailyFreeRemaining: DAILY_FREE_CREDITS,
          dailyLimit: DAILY_FREE_CREDITS,
          lastResetDate: today,
        };
        tx.update(userRef, {
          credits: updated.credits,
          dailyFreeRemaining: updated.dailyFreeRemaining,
          lastResetDate: today,
          updatedAt: serverTimestamp(),
        });
        return updated;
      }

      return {
        uid: user.uid,
        email: data.email || user.email || '',
        displayName: data.displayName || user.displayName || 'Studio User',
        plan: existingPlan,
        credits: existingCredits,
        dailyFreeRemaining: existingDailyRemaining,
        dailyLimit: typeof data.dailyLimit === 'number' ? data.dailyLimit : DAILY_FREE_CREDITS,
        lastResetDate: data.lastResetDate || today,
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function deductUserCreditAtomic(
  userId: string,
  cost = 1
): Promise<{ ok: boolean; remainingCredits: number; reason?: string }> {
  if (!db || !userId) {
    return { ok: true, remainingCredits: DAILY_FREE_CREDITS };
  }

  const userRef = doc(db, 'users', userId);
  const today = todayUtcDate();

  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists()) {
        const initialRemaining = Math.max(0, DAILY_FREE_CREDITS - cost);
        tx.set(userRef, {
          uid: userId,
          email: '',
          displayName: 'Studio User',
          plan: 'FREE',
          credits: initialRemaining,
          dailyFreeRemaining: initialRemaining,
          dailyLimit: DAILY_FREE_CREDITS,
          lastResetDate: today,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return { ok: true, remainingCredits: initialRemaining };
      }

      const data = snap.data() as Partial<StudioUserProfile>;
      let credits =
        typeof data.credits === 'number' && Number.isFinite(data.credits) ? data.credits : 0;
      let dailyFreeRemaining =
        typeof data.dailyFreeRemaining === 'number' &&
        Number.isFinite(data.dailyFreeRemaining)
          ? data.dailyFreeRemaining
          : 0;

      if (data.lastResetDate !== today) {
        dailyFreeRemaining = DAILY_FREE_CREDITS;
        credits = Math.max(credits, DAILY_FREE_CREDITS);
      }

      if (credits < cost) {
        return {
          ok: false,
          remainingCredits: credits,
          reason:
            'Daily free credits exhausted. Upgrade via JazzCash/Easypaisa (0323-5052148) or Stripe in the Billing Hub.',
        };
      }

      const nextCredits = credits - cost;
      const nextDailyFree = Math.max(0, dailyFreeRemaining - cost);

      tx.update(userRef, {
        credits: nextCredits,
        dailyFreeRemaining: nextDailyFree,
        lastResetDate: today,
        updatedAt: serverTimestamp(),
      });

      return { ok: true, remainingCredits: nextCredits };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function approveLocalPaymentAtomic(
  paymentId: string,
  targetUserId: string,
  creditsToAdd: number,
  newPlan: 'STARTER' | 'PRO',
  adminEmail: string
): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized.');
  const payRef = doc(db, 'local_payments', paymentId);
  const userRef = doc(db, 'users', targetUserId);
  const today = todayUtcDate();

  try {
    await runTransaction(db, async (tx) => {
      const paySnap = await tx.get(payRef);
      if (!paySnap.exists()) {
        throw new Error('Local payment record not found.');
      }
      if (paySnap.data()?.status === 'APPROVED') {
        throw new Error('This TID has already been approved and credited.');
      }

      const userSnap = await tx.get(userRef);
      const prevCredits =
        userSnap.exists() && typeof userSnap.data()?.credits === 'number'
          ? userSnap.data().credits
          : DAILY_FREE_CREDITS;

      if (userSnap.exists()) {
        tx.update(userRef, {
          credits: prevCredits + creditsToAdd,
          plan: newPlan,
          updatedAt: serverTimestamp(),
        });
      } else {
        tx.set(userRef, {
          uid: targetUserId,
          email: String(paySnap.data()?.userEmail || '').slice(0, 160),
          displayName: 'Studio User',
          plan: newPlan,
          credits: prevCredits + creditsToAdd,
          dailyFreeRemaining: DAILY_FREE_CREDITS,
          dailyLimit: DAILY_FREE_CREDITS,
          lastResetDate: today,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      tx.update(payRef, {
        status: 'APPROVED',
        reviewedBy: adminEmail.slice(0, 128),
        updatedAt: serverTimestamp(),
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `local_payments/${paymentId}`);
  }
}
