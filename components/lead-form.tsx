'use client';

import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { AlertCircle, CheckCircle2, Loader2, MapPin, Phone, Sparkles, User } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';

const MAX_NAAM_LENGTH = 100;
const MIN_PHONE_LENGTH = 5;
const MAX_PHONE_LENGTH = 30;
const MAX_CITY_LENGTH = 80;

interface LeadFormProps {
  source?: 'landing' | 'dashboard';
}

export function LeadForm({ source = 'dashboard' }: LeadFormProps) {
  const { user } = useAuth();

  const [naam, setNaam] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanNaam = naam.trim().slice(0, MAX_NAAM_LENGTH);
    const cleanPhone = phoneNumber.trim().slice(0, MAX_PHONE_LENGTH);
    const cleanCity = city.trim().slice(0, MAX_CITY_LENGTH);

    if (!cleanNaam) {
      setErrorMessage('Baraye mehrbani apna Naam darj karein.');
      return;
    }
    if (cleanPhone.length < MIN_PHONE_LENGTH) {
      setErrorMessage('Baraye mehrbani sahi Phone Number darj karein.');
      return;
    }
    if (!cleanCity) {
      setErrorMessage('Baraye mehrbani apni City darj karein.');
      return;
    }

    if (!db) {
      setErrorMessage('Firebase database is not initialized.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const docRef = await addDoc(collection(db, 'leads'), {
        naam: cleanNaam,
        phoneNumber: cleanPhone,
        city: cleanCity,
        source,
        userId: user?.uid || 'guest',
        aiStatus: 'pending',
        createdAt: serverTimestamp(),
      });

      // Automatically trigger Gemini lead classification & Roman Urdu WhatsApp reply
      void fetch('/api/leads/auto-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: docRef.id,
          naam: cleanNaam,
          phoneNumber: cleanPhone,
          city: cleanCity,
          saveToFirestore: true,
        }),
      }).catch(() => {});

      setIsSubmitted(true);
      setNaam('');
      setPhoneNumber('');
      setCity('');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'leads');
      } catch {
        setErrorMessage(
          err instanceof Error
            ? `Data save karne mein masla aaya: ${err.message}`
            : 'Data save karne mein masla aaya. Dobara koshish karein.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Free Offer Lead Form"
      className="w-full bg-white dark:bg-[#0e1318] border border-slate-200 dark:border-emerald-950/70 rounded-2xl p-6 sm:p-8"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Limited Time Free Offer · Instant WhatsApp Follow-Up
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Apna Free Offer Abhi Book Karein
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Sirf 3 tafseelat darj karein — hamari team jald rabta karegi.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-5 sm:p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-300">
                  Shukriya! Hum jald rabta karenge.
                </p>
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-400/90 mt-0.5">
                  Aapki maloomat kamyabi se save ho gayi hain.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-[#0e1318] text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition shrink-0 cursor-pointer"
            >
              Ek Aur Form Bharein
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* 1. Naam */}
              <div>
                <label
                  htmlFor={`lead-naam-${source}`}
                  className="block text-xs font-semibold text-slate-800 dark:text-slate-300 mb-2"
                >
                  1. Naam
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id={`lead-naam-${source}`}
                    type="text"
                    required
                    maxLength={MAX_NAAM_LENGTH}
                    value={naam}
                    onChange={(e) => setNaam(e.target.value)}
                    placeholder="Apna naam likhein"
                    className="w-full min-h-[46px] bg-slate-50 dark:bg-[#090d11] border border-slate-300 dark:border-emerald-950/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-950 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 2. Phone Number */}
              <div>
                <label
                  htmlFor={`lead-phone-${source}`}
                  className="block text-xs font-semibold text-slate-800 dark:text-slate-300 mb-2"
                >
                  2. Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id={`lead-phone-${source}`}
                    type="tel"
                    required
                    minLength={MIN_PHONE_LENGTH}
                    maxLength={MAX_PHONE_LENGTH}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full min-h-[46px] bg-slate-50 dark:bg-[#090d11] border border-slate-300 dark:border-emerald-950/70 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tabular-nums text-slate-950 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 3. City */}
              <div>
                <label
                  htmlFor={`lead-city-${source}`}
                  className="block text-xs font-semibold text-slate-800 dark:text-slate-300 mb-2"
                >
                  3. City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id={`lead-city-${source}`}
                    type="text"
                    required
                    maxLength={MAX_CITY_LENGTH}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lahore, Karachi, Islamabad..."
                    className="w-full min-h-[46px] bg-slate-50 dark:bg-[#090d11] border border-slate-300 dark:border-emerald-950/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-950 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm sm:text-base tracking-wide transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Save ho raha hai...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Free Offer Hasil Karo</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
