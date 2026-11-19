'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  CreditCard,
  Loader2,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { loginWithGoogle, useAuth } from '@/components/auth-provider';
import {
  approveLocalPaymentAtomic,
  type StudioUserProfile,
} from '@/lib/services/userQuotaService';
import { isStudioAdmin } from '@/lib/services/toolSettingsService';
import { trackStudioEvent } from '@/lib/analytics';
import { BILLING_PLANS, FOUNDER_INFO } from '@/lib/seo/site-config';

interface LocalPaymentRecord {
  id: string;
  userId: string;
  userEmail?: string;
  method: 'JazzCash' | 'Easypaisa';
  accountNumber: string;
  plan: 'STARTER' | 'PRO';
  amountPkr: number;
  credits: number;
  tid: string;
  senderNumber: string;
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  createdAt?: any;
}

interface StripeEventRecord {
  id: string;
  eventId: string;
  eventType: string;
  userId: string;
  plan: string;
  amountUsd: number;
  credits: number;
  status: string;
  createdAt?: any;
}

export function BillingHub({
  userProfile,
}: {
  userProfile: StudioUserProfile | null;
}) {
  const { user } = useAuth();
  const isAdmin = isStudioAdmin(user);

  // Local Payment Form State
  const [method, setMethod] = useState<'JazzCash' | 'Easypaisa'>('JazzCash');
  const [plan, setPlan] = useState<'STARTER' | 'PRO'>('STARTER');
  const [tid, setTid] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submittingLocal, setSubmittingLocal] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Stripe Checkout State
  const [stripeLoadingPlan, setStripeLoadingPlan] = useState<'starter' | 'pro' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live Firestore Records
  const [localPayments, setLocalPayments] = useState<LocalPaymentRecord[]>([]);
  const [stripeEvents, setStripeEvents] = useState<StripeEventRecord[]>([]);

  useEffect(() => {
    if (!db || !user?.uid) {
      setLocalPayments([]);
      setStripeEvents([]);
      return;
    }

    const payQuery = isAdmin
      ? query(collection(db, 'local_payments'))
      : query(collection(db, 'local_payments'), where('userId', '==', user.uid));

    const unsubPay = onSnapshot(
      payQuery,
      (snap) => {
        const items: LocalPaymentRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<LocalPaymentRecord, 'id'>),
        }));
        items.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tB - tA;
        });
        setLocalPayments(items);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'local_payments');
        } catch {
          // Handled safely
        }
      }
    );

    const stripeQuery = isAdmin
      ? query(collection(db, 'stripe_events'))
      : query(collection(db, 'stripe_events'), where('userId', '==', user.uid));

    const unsubStripe = onSnapshot(
      stripeQuery,
      (snap) => {
        const items: StripeEventRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StripeEventRecord, 'id'>),
        }));
        setStripeEvents(items);
      },
      () => {
        // Optional empty ledger
      }
    );

    return () => {
      unsubPay();
      unsubStripe();
    };
  }, [user?.uid, isAdmin]);

  const handleSubmitLocalPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !db) {
      setErrorMsg('Please sign in with Google to submit a JazzCash / Easypaisa TID.');
      return;
    }
    const cleanTid = tid.trim();
    const cleanSender = senderNumber.trim();
    if (cleanTid.length < 4 || cleanSender.length < 5) {
      setErrorMsg('Please enter a valid Transaction ID (TID) and sender mobile number.');
      return;
    }

    setSubmittingLocal(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const selected = plan === 'PRO' ? BILLING_PLANS.pro : BILLING_PLANS.starter;

    try {
      await addDoc(collection(db, 'local_payments'), {
        userId: user.uid,
        userEmail: (user.email || '').slice(0, 160),
        method,
        accountNumber: FOUNDER_INFO.localPaymentNumber,
        plan,
        amountPkr: selected.pricePkr,
        credits: selected.credits,
        tid: cleanTid.slice(0, 80),
        senderNumber: cleanSender.slice(0, 30),
        status: 'PENDING_VERIFICATION',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      trackStudioEvent('initiate_checkout', {
        provider: method,
        plan,
        currency: 'PKR',
        amount: selected.pricePkr,
      });

      setTid('');
      setSenderNumber('');
      setSuccessMsg(
        `TID ${cleanTid} submitted (${method} · PKR ${selected.pricePkr.toLocaleString()}). Status: PENDING_VERIFICATION.`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit payment TID.');
    } finally {
      setSubmittingLocal(false);
    }
  };

  const handleApproveLocalPayment = async (item: LocalPaymentRecord) => {
    if (!user?.email || !isAdmin) return;
    setApprovingId(item.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await approveLocalPaymentAtomic(
        item.id,
        item.userId,
        item.credits,
        item.plan,
        user.email
      );
      setSuccessMsg(
        `Approved TID ${item.tid} and atomically credited +${item.credits} credits to user ${item.userEmail || item.userId}.`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to approve TID.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleStripeCheckout = async (planKey: 'starter' | 'pro') => {
    if (!user?.uid) {
      setErrorMsg('Please sign in with Google before starting Stripe checkout.');
      return;
    }

    setStripeLoadingPlan(planKey);
    setErrorMsg(null);
    setSuccessMsg(null);

    const selected = BILLING_PLANS[planKey];
    trackStudioEvent('initiate_checkout', {
      provider: 'stripe',
      plan: selected.id,
      currency: 'USD',
      amount: selected.priceUsd,
    });

    try {
      const res = await fetch('/api/billing/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          userId: user.uid,
          email: user.email || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Stripe checkout could not be created.');
      }
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Stripe checkout failed.');
    } finally {
      setStripeLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live User Quota & Plan Header */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#00D9FF]/25 bg-white dark:bg-[#0B0F19]/90 p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Active Subscription Plan
          </div>
          <div className="text-2xl font-extrabold text-slate-950 dark:text-white">
            {userProfile?.plan || 'FREE'}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            10 free daily credits auto-resetting in Firestore (`users/{'{userId}'}`).
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Live Available Credits
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-indigo-700 dark:text-[#00D9FF]">
            {userProfile ? userProfile.credits.toLocaleString() : '10'}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Daily Free Remaining: {userProfile?.dailyFreeRemaining ?? 10} / {userProfile?.dailyLimit ?? 10}
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Official Local Account (Pakistan)
          </div>
          <div className="text-xl font-extrabold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
            {FOUNDER_INFO.localPaymentNumber}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            JazzCash &amp; Easypaisa · {FOUNDER_INFO.localPaymentTitle}
          </p>
        </div>
      </section>

      {!user && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-50/70 dark:bg-[#0B0F19] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            Sign in with Google to sync your live credit balance, submit JazzCash/Easypaisa TIDs, or pay with Stripe.
          </p>
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#6366F1] text-slate-950 font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/35 bg-emerald-50 dark:bg-emerald-950/25 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Dual Billing Grid: Pakistan Local (JazzCash/Easypaisa) + International Stripe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Local Pakistan Billing */}
        <section className="rounded-2xl border border-slate-200 dark:border-emerald-500/30 bg-white dark:bg-[#0B0F19]/90 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                Pakistan Local Payments
              </div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>JazzCash &amp; Easypaisa TID Verification</span>
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="font-semibold text-slate-900 dark:text-white">
              Transfer to: {FOUNDER_INFO.localPaymentNumber} ({FOUNDER_INFO.localPaymentTitle})
            </div>
            <div className="text-slate-600 dark:text-slate-400 font-mono">
              Starter: PKR 499 (100 credits) · Pro: PKR 1,499 (500 credits)
            </div>
          </div>

          <form onSubmit={handleSubmitLocalPayment} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Wallet Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as 'JazzCash' | 'Easypaisa')}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white"
                >
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Credit Pack
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as 'STARTER' | 'PRO')}
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white"
                >
                  <option value="STARTER">Starter — PKR 499 (100 Credits)</option>
                  <option value="PRO">Pro — PKR 1,499 (500 Credits)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Transaction ID (TID)
                </label>
                <input
                  type="text"
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  placeholder="e.g. 09483726152"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] px-3.5 py-2 text-xs sm:text-sm text-slate-950 dark:text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Sender Mobile Number
                </label>
                <input
                  type="text"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="e.g. 0300-1234567"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#050811] px-3.5 py-2 text-xs sm:text-sm text-slate-950 dark:text-white font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingLocal || !user}
              className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition"
            >
              {submittingLocal ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Coins className="w-4 h-4" />
              )}
              <span>Submit TID for Verification</span>
            </button>
          </form>
        </section>

        {/* International Stripe Billing */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#6366F1]/35 bg-white dark:bg-[#0B0F19]/90 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1">
              <div className="text-xs font-mono text-indigo-700 dark:text-[#00D9FF]">
                International USD Checkout
              </div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#6366F1]" />
                <span>Stripe Cards &amp; Global Billing</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-slate-500">For solo builders</div>
                  <div className="text-base font-bold text-slate-950 dark:text-white">
                    Starter Pack
                  </div>
                  <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-950 dark:text-white">
                    $5 <span className="text-xs font-normal text-slate-500">/ 100 credits</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!user || stripeLoadingPlan !== null}
                  onClick={() => handleStripeCheckout('starter')}
                  className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {stripeLoadingPlan === 'starter' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Checkout $5</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[#00D9FF]/40 bg-cyan-50/40 dark:bg-[#070B14] flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-indigo-700 dark:text-[#00D9FF]">
                    For agencies &amp; teams
                  </div>
                  <div className="text-base font-bold text-slate-950 dark:text-white">
                    Pro Studio Pack
                  </div>
                  <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-950 dark:text-white">
                    $15 <span className="text-xs font-normal text-slate-500">/ 500 credits</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!user || stripeLoadingPlan !== null}
                  onClick={() => handleStripeCheckout('pro')}
                  className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#6366F1] text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {stripeLoadingPlan === 'pro' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Checkout $15</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Idempotent webhook endpoint: <span className="font-mono text-slate-900 dark:text-slate-200">/api/billing/stripe-webhook</span> · Tracked events: <span className="font-mono tabular-nums">{stripeEvents.length}</span>
          </div>
        </section>
      </div>

      {/* Live Local Payments Ledger (with Admin Verification Approval) */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19]/90 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              Local TID Verification Ledger (`local_payments`)
            </h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {localPayments.length} submissions
          </span>
        </div>

        {localPayments.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] text-xs text-slate-500">
            No JazzCash or Easypaisa TID submissions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500">
                  <th className="py-2.5 pr-4">TID &amp; Method</th>
                  <th className="py-2.5 px-4">Plan &amp; Amount</th>
                  <th className="py-2.5 px-4">Sender</th>
                  <th className="py-2.5 px-4">Status</th>
                  {isAdmin && <th className="py-2.5 pl-4 text-right">Admin Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                {localPayments.map((pay) => (
                  <tr key={pay.id}>
                    <td className="py-3 pr-4 font-mono">
                      <div className="font-semibold text-slate-950 dark:text-white">{pay.tid}</div>
                      <div className="text-[11px] text-slate-500">
                        {pay.method} · {pay.userEmail || pay.userId}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {pay.plan} · PKR {pay.amountPkr.toLocaleString()} (+{pay.credits})
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {pay.senderNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <span
                        className={
                          pay.status === 'APPROVED'
                            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                            : pay.status === 'REJECTED'
                            ? 'text-rose-600 dark:text-rose-400 font-bold'
                            : 'text-amber-600 dark:text-amber-400 font-bold'
                        }
                      >
                        {pay.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 pl-4 text-right">
                        {pay.status === 'PENDING_VERIFICATION' ? (
                          <button
                            type="button"
                            disabled={approvingId === pay.id}
                            onClick={() => handleApproveLocalPayment(pay)}
                            className="min-h-[34px] px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
                          >
                            {approvingId === pay.id ? 'Approving...' : 'Approve & Credit'}
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-slate-500">Verified</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
