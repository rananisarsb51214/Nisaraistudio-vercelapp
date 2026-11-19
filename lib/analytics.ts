'use client';

import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

export type StudioAnalyticsEvent =
  | 'search_auto_collect'
  | 'export_collected_data'
  | 'initiate_checkout'
  | 'open_google_ai_studio'
  | 'agent_evolver_run'
  | 'claude_router_run';

export interface TrackedEventRecord {
  id: string;
  event: StudioAnalyticsEvent;
  params: Record<string, string | number | boolean>;
  timestamp: string;
}

const STORAGE_KEY = 'nisar_ai_studio_analytics_counts_v1';

const DEFAULT_COUNTS: Record<StudioAnalyticsEvent, number> = {
  search_auto_collect: 0,
  export_collected_data: 0,
  initiate_checkout: 0,
  open_google_ai_studio: 0,
  agent_evolver_run: 0,
  claude_router_run: 0,
};

let memoryCounts: Record<StudioAnalyticsEvent, number> = { ...DEFAULT_COUNTS };
let recentEvents: TrackedEventRecord[] = [];
const listeners = new Set<() => void>();

function hydrateCounts(): Record<StudioAnalyticsEvent, number> {
  if (typeof window === 'undefined') return { ...memoryCounts };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<StudioAnalyticsEvent, number>>;
      memoryCounts = { ...DEFAULT_COUNTS, ...parsed };
    }
  } catch {
    // Ignore storage quota / privacy mode errors
  }
  return { ...memoryCounts };
}

function persistCounts() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCounts));
  } catch {
    // Ignore
  }
}

export function getAnalyticsCounts(): Record<StudioAnalyticsEvent, number> {
  return hydrateCounts();
}

export function getRecentAnalyticsEvents(): TrackedEventRecord[] {
  return recentEvents.slice(0, 25);
}

export function subscribeAnalytics(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function trackStudioEvent(
  event: StudioAnalyticsEvent,
  params: Record<string, string | number | boolean> = {}
) {
  const current = hydrateCounts();
  memoryCounts = {
    ...current,
    [event]: (current[event] || 0) + 1,
  };
  persistCounts();

  recentEvents = [
    {
      id: `${event}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      event,
      params,
      timestamp: new Date().toISOString(),
    },
    ...recentEvents,
  ].slice(0, 50);

  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // Ignore subscriber errors
    }
  });

  if (analytics) {
    void analytics
      .then((instance) => {
        if (instance) {
          logEvent(instance, event, params);
        }
      })
      .catch(() => {
        // Never break UX on analytics failure
      });
  }
}
