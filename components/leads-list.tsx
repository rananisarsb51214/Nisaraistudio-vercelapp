'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  AlertCircle,
  Check,
  Copy,
  Flame,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Snowflake,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { loginWithGoogle, useAuth } from '@/components/auth-provider';
import type { LeadRecord } from '@/types/leads';

const ADMIN_EMAIL = 'nisarrsna@gmail.com';

function formatTimestamp(val: unknown): string {
  if (!val) return 'Just now';
  if (typeof val === 'object' && val !== null && 'toDate' in val && typeof (val as any).toDate === 'function') {
    return (val as any).toDate().toLocaleString();
  }
  if (typeof val === 'string') {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? val : d.toLocaleString();
  }
  return 'Just now';
}

interface LeadsListProps {
  filterLabel?: 'all' | 'HOT' | 'COLD';
  searchQuery?: string;
}

export function LeadsList({ filterLabel = 'all', searchQuery = '' }: LeadsListProps = {}) {
  const { user, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const triggeredIdsRef = useRef<Set<string>>(new Set());

  const triggerAutoGemini = async (lead: LeadRecord, isManualRetry = false) => {
    if (!lead.id || (!isManualRetry && triggeredIdsRef.current.has(lead.id))) {
      return;
    }
    triggeredIdsRef.current.add(lead.id);
    setProcessingIds((prev) => ({ ...prev, [lead.id]: true }));

    try {
      await fetch('/api/leads/auto-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          naam: lead.naam,
          phoneNumber: lead.phoneNumber,
          city: lead.city,
          saveToFirestore: true,
        }),
      });
    } catch (err) {
      console.warn('[Auto-Gemini Lead Processing]:', err);
    } finally {
      setProcessingIds((prev) => ({ ...prev, [lead.id]: false }));
    }
  };

  useEffect(() => {
    if (authLoading || !user || !db) {
      if (!authLoading) setLoading(false);
      return;
    }

    const isAdmin = Boolean(user.emailVerified && user.email === ADMIN_EMAIL);
    const leadsQuery = isAdmin
      ? query(collection(db, 'leads'))
      : query(collection(db, 'leads'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      leadsQuery,
      (snapshot) => {
        const items: LeadRecord[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<LeadRecord, 'id'>),
        }));

        items.sort((a, b) => {
          const getMs = (v: unknown) => {
            if (typeof v === 'object' && v !== null && 'toMillis' in v && typeof (v as any).toMillis === 'function') {
              return (v as any).toMillis();
            }
            if (typeof v === 'string') return new Date(v).getTime() || 0;
            return 0;
          };
          return getMs(b.createdAt) - getMs(a.createdAt);
        });

        setLeads(items);
        setLoading(false);

        // Automatically run Auto-Gemini for any unprocessed lead in Firestore
        for (const item of items) {
          const needsAutoAi =
            !item.aiStatus || (item.aiStatus === 'pending' && !item.whatsappReply);
          if (needsAutoAi && !triggeredIdsRef.current.has(item.id)) {
            void triggerAutoGemini(item);
          }
        }
      },
      (err) => {
        setLoading(false);
        try {
          handleFirestoreError(err, OperationType.GET, 'leads');
        } catch {
          // Structured telemetry logged by handleFirestoreError
        }
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleCopyReply = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `leads/${id}`);
      } catch {
        // Logged
      }
    }
  };

  if (!user) {
    return (
      <section
        aria-label="Leads List Preview Sign In"
        className="w-full bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
            Sign in with Google to view live Firestore leads
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Security rules ke mutabiq captured leads aur Auto-Gemini WhatsApp replies dekhne ke liye Google Sign-In zaroori hai.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
        >
          Continue with Google
        </button>
      </section>
    );
  }

  const isLeadHot = (l: LeadRecord) =>
    l.leadLabel === 'HOT' ||
    (!l.leadLabel && ['lahore', 'karachi', 'islamabad'].some((c) => l.city?.toLowerCase().includes(c)));

  const hotCount = leads.filter(isLeadHot).length;

  const filteredLeads = leads.filter((lead) => {
    const hot = isLeadHot(lead);
    if (filterLabel === 'HOT' && !hot) return false;
    if (filterLabel === 'COLD' && hot) return false;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      lead.naam?.toLowerCase().includes(q) ||
      lead.phoneNumber?.toLowerCase().includes(q) ||
      lead.city?.toLowerCase().includes(q)
    );
  });

  return (
    <section
      aria-label="Auto-Gemini Leads List"
      className="w-full bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl p-6 sm:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-emerald-950/50 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Captured Leads &amp; Auto-Gemini Replies
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Har naya lead aate hi Gemini khud HOT/COLD label aur Roman Urdu WhatsApp reply generate karta hai.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
          <span>Total: {leads.length}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>{hotCount} HOT</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex items-center justify-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Firestore leads load ho rahi hain...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="py-10 text-center rounded-xl border border-dashed border-slate-300 dark:border-emerald-950/70 bg-slate-50 dark:bg-[#090d11] px-4">
          <MessageCircle className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {leads.length === 0 ? 'Abhi koi lead save nahi hui' : 'Is filter mein koi lead nahi mili'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {leads.length === 0
              ? 'Lead form bharke "Free Offer Hasil Karo" dabayein — Gemini khud yahan HOT/COLD aur WhatsApp reply dikhayega.'
              : 'Search ya HOT/COLD filter badal kar dobara check karein.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const isHot = isLeadHot(lead);
            const isProcessing =
              processingIds[lead.id] ||
              lead.aiStatus === 'pending' ||
              (!lead.aiStatus && !lead.whatsappReply);

            return (
              <div
                key={lead.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-emerald-950/60 bg-slate-50 dark:bg-[#090d11] space-y-4"
              >
                {/* Top Row: Lead Details + HOT/COLD Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                      <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>{lead.naam}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-xs text-slate-700 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>{lead.phoneNumber}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>{lead.city}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      {isHot ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
                          <Flame className="w-3.5 h-3.5" />
                          <span>HOT LEAD</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-sky-700 dark:text-sky-400">
                          <Snowflake className="w-3.5 h-3.5" />
                          <span>COLD LEAD</span>
                        </span>
                      )}
                      <span aria-hidden="true" className="text-slate-400 hidden md:inline">
                        ·
                      </span>
                      <span className="text-slate-500 hidden md:inline tabular-nums">
                        {formatTimestamp(lead.createdAt)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleDeleteLead(lead.id)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      title="Delete lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Gemini WhatsApp Reply */}
                {isProcessing ? (
                  <div className="pt-3 border-t border-slate-200 dark:border-emerald-950/50 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400 font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>Auto-Gemini is lead ke liye WhatsApp reply likh raha hai...</span>
                  </div>
                ) : lead.aiStatus === 'error' && !lead.whatsappReply ? (
                  <div className="pt-3 border-t border-slate-200 dark:border-emerald-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                      <span>{lead.aiError || 'Gemini reply generate nahi ho saka.'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void triggerAutoGemini(lead, true)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0e1318] border border-rose-500/40 text-rose-800 dark:text-rose-300 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-200 dark:border-emerald-950/50 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Gemini WhatsApp Reply (Roman Urdu)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleCopyReply(lead.id, lead.whatsappReply || '')}
                        className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shrink-0"
                      >
                        {copiedId === lead.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Reply</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {lead.whatsappReply}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
