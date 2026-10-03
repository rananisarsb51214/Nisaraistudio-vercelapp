export interface UserCredits {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  lastRefillAt: string;
  updatedAt: string;
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
  free: { dailyRefill: 50, maxBalance: 100 },
  starter: { dailyRefill: 250, maxBalance: 1000 },
  pro: { dailyRefill: 1000, maxBalance: 5000 },
  enterprise: { dailyRefill: 5000, maxBalance: 50000 },
};
