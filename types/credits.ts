export const DAILY_FREE_LIMIT = 10;

export interface QuotaStatus {
  dailyUsed: number;
  dailyLimit: number;
  remainingFree: number;
  paidCredits: number;
  lastResetDate: string; // UTC YYYY-MM-DD
  deductedFrom?: 'daily_free' | 'paid_credits' | 'none';
}

export interface UserCredits {
  userId: string;
  balance: number; // kept in sync with paidCredits for backwards compatibility
  paidCredits: number;
  dailyUsed: number;
  dailyLimit: number;
  lastResetDate: string; // UTC YYYY-MM-DD
  totalEarned: number;
  totalSpent: number;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  lastRefillAt: string;
  updatedAt: string;
}

export interface CreditDeductionResult {
  success: boolean;
  code?: 'LIMIT_REACHED' | 'TRANSACTION_FAILED';
  remainingCredits: number;
  quota: QuotaStatus;
  deductedCost: number;
  deductedFrom: 'daily_free' | 'paid_credits' | 'none';
  error?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // positive for additions, negative for deductions
  type: 'generation' | 'refund' | 'daily_refill' | 'purchase' | 'bonus';
  toolId?: string;
  generationId?: string;
  description: string;
  timestamp: string;
}

export const TIER_CREDIT_LIMITS = {
  free: { dailyRefill: 10, maxBalance: 100 },
  starter: { dailyRefill: 250, maxBalance: 1000 },
  pro: { dailyRefill: 1000, maxBalance: 5000 },
  enterprise: { dailyRefill: 5000, maxBalance: 50000 },
};

export function getUtcDateString(date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function normalizeUserCredits(
  userId: string,
  raw?: Partial<UserCredits> | null
): UserCredits {
  const now = new Date();
  const nowIso = now.toISOString();
  const todayStr = getUtcDateString(now);

  if (!raw) {
    return {
      userId,
      balance: 0,
      paidCredits: 0,
      dailyUsed: 0,
      dailyLimit: DAILY_FREE_LIMIT,
      lastResetDate: todayStr,
      totalEarned: 0,
      totalSpent: 0,
      tier: 'free',
      lastRefillAt: nowIso,
      updatedAt: nowIso,
    };
  }

  const paidCredits =
    typeof raw.paidCredits === 'number'
      ? Math.max(0, raw.paidCredits)
      : typeof raw.balance === 'number'
      ? Math.max(0, raw.balance)
      : 0;

  const isSameDay = raw.lastResetDate === todayStr;
  const dailyUsed = isSameDay && typeof raw.dailyUsed === 'number' ? Math.max(0, raw.dailyUsed) : 0;
  const dailyLimit =
    typeof raw.dailyLimit === 'number' && raw.dailyLimit > 0 ? raw.dailyLimit : DAILY_FREE_LIMIT;

  return {
    userId: raw.userId || userId,
    balance: paidCredits,
    paidCredits,
    dailyUsed,
    dailyLimit,
    lastResetDate: todayStr,
    totalEarned: typeof raw.totalEarned === 'number' ? raw.totalEarned : paidCredits,
    totalSpent: typeof raw.totalSpent === 'number' ? raw.totalSpent : 0,
    tier: raw.tier || 'free',
    lastRefillAt: raw.lastRefillAt || nowIso,
    updatedAt: raw.updatedAt || nowIso,
  };
}
