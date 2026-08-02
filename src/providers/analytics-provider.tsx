'use client';

import React, { createContext, useContext, useRef, useEffect, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PublicEventType =
  | 'menu_view'
  | 'qr_scan'
  | 'item_view'
  | 'whatsapp_click'
  | 'direction_click'
  | 'share_click'
  | 'like_click';

interface QueuedEvent {
  shopId:     string;
  eventType:  PublicEventType;
  visitorId:  string;
  sessionId:  string;
  dedupKey:   string;
  occurredAt: string;          // ISO — browser timestamp
  metadata?:  Record<string, unknown>;
}

interface AnalyticsContextValue {
  track: (eventType: PublicEventType, metadata?: Record<string, unknown>) => void;
}

// ─── Event Category Constants ──────────────────────────────────────────────────

/**
 * Unique Events: one per visitor per scope per day.
 * Client-side dedup Set enforces this before any network call.
 */
const UNIQUE_EVENT_TYPES = new Set<PublicEventType>(['menu_view', 'item_view', 'qr_scan']);
// Count Events (whatsapp_click, direction_click, share_click, like_click) skip dedup entirely.

// ─── Bot Detection ─────────────────────────────────────────────────────────────

const BOT_UA_PATTERNS = [
  /googlebot/i, /bingbot/i, /facebookexternalhit/i, /slackbot/i,
  /discordbot/i, /whatsapp/i, /twitterbot/i, /applebot/i,
];

function isBot(): boolean {
  if (typeof navigator === 'undefined') return false;
  return BOT_UA_PATTERNS.some(p => p.test(navigator.userAgent));
}

// ─── Visitor Identity — Cookie first, localStorage fallback ───────────────────

function getOrCreateVisitorId(): string {
  const KEY = 'msm_vid';
  try {
    // 1. Try cookie
    const fromCookie = document.cookie.match(/(?:^|;\s*)msm_vid=([^;]+)/)?.[1];
    if (fromCookie) return fromCookie;
    // 2. Try localStorage
    const fromStorage = localStorage.getItem(KEY);
    if (fromStorage) {
      // Backfill into cookie
      document.cookie = `${KEY}=${fromStorage}; max-age=31536000; path=/; SameSite=Lax`;
      return fromStorage;
    }
    // 3. Create new — write to both
    const id = crypto.randomUUID();
    document.cookie = `${KEY}=${id}; max-age=31536000; path=/; SameSite=Lax`;
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    return crypto.randomUUID(); // Private mode or storage blocked
  }
}

// ─── Session Identity — 30-minute inactivity rolling expiry ───────────────────

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getOrRefreshSessionId(): string {
  const ID_KEY  = 'msm_sid';
  const EXP_KEY = 'msm_sid_exp';
  try {
    const now  = Date.now();
    const exp  = Number(sessionStorage.getItem(EXP_KEY) ?? 0);
    const existing = sessionStorage.getItem(ID_KEY);
    if (existing && now < exp) {
      // Still valid — roll the expiry forward
      sessionStorage.setItem(EXP_KEY, String(now + SESSION_TTL_MS));
      return existing;
    }
    // Expired or missing — new session
    const id = crypto.randomUUID();
    sessionStorage.setItem(ID_KEY, id);
    sessionStorage.setItem(EXP_KEY, String(now + SESSION_TTL_MS));
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

// ─── Client-Side Dedup (localStorage-persisted across hard refreshes) ─────────

/**
 * Dedup keys are stored in localStorage under today's UTC date.
 * Format: "visitorId|eventType|scopeId|YYYY-MM-DD"
 *
 * Survives hard refreshes: on every page load the cache is restored from
 * localStorage so the same visitor+event+day is always dropped.
 * Automatically expires: if the stored date doesn't match today, it's ignored.
 */

const DEDUP_STORAGE_KEY = 'msm_dedup_today';
let _seenCache: Set<string> | null = null;

function getSeenToday(): Set<string> {
  if (_seenCache !== null) return _seenCache;
  try {
    const raw = localStorage.getItem(DEDUP_STORAGE_KEY);
    if (raw) {
      const { date, keys } = JSON.parse(raw) as { date: string; keys: string[] };
      const today = new Date().toISOString().slice(0, 10);
      if (date === today) {
        _seenCache = new Set(keys);
        return _seenCache;
      }
    }
  } catch {}
  _seenCache = new Set();
  return _seenCache;
}

function markAsSeen(key: string): void {
  const set = getSeenToday();
  set.add(key);
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(DEDUP_STORAGE_KEY, JSON.stringify({ date: today, keys: [...set] }));
  } catch {}
}

function getDedupKey(visitorId: string, eventType: string, scopeId: string): string {
  const utcDate = new Date().toISOString().slice(0, 10);
  return `${visitorId}|${eventType}|${scopeId}|${utcDate}`;
}


// ─── Offline Dead-Letter Queue ─────────────────────────────────────────────────

const DLQ_KEY      = 'msm_analytics_dlq';
const BATCH_ENDPOINT = '/api/analytics/batch';

function drainDLQ(): void {
  try {
    const queue = JSON.parse(localStorage.getItem(DLQ_KEY) ?? '[]') as string[];
    if (!queue.length) return;
    localStorage.removeItem(DLQ_KEY);
    for (const payload of queue) {
      fetch(BATCH_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}

async function flushWithRetry(payload: string, useBeacon = false): Promise<void> {
  if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(BATCH_ENDPOINT, payload);
    return;
  }
  try {
    await fetch(BATCH_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    payload,
      keepalive: true,
    });
    drainDLQ(); // success — try to clear backlog
  } catch {
    // Store in DLQ for next session
    try {
      const queue = JSON.parse(localStorage.getItem(DLQ_KEY) ?? '[]') as string[];
      queue.push(payload);
      localStorage.setItem(DLQ_KEY, JSON.stringify(queue.slice(-20))); // cap at 20 batches
    } catch {}
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AnalyticsCtx = createContext<AnalyticsContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

interface AnalyticsProviderProps {
  children:    React.ReactNode;
  shopId:      string;
  menuVersion: number;
  publishedAt: string;
}

const FLUSH_INTERVAL_MS = 30_000; // 30 seconds
const FLUSH_THRESHOLD   = 10;     // flush immediately when 10 events accumulate

export function AnalyticsProvider({
  children,
  shopId,
  menuVersion,
  publishedAt,
}: AnalyticsProviderProps) {
  const bufferRef    = useRef<QueuedEvent[]>([]);
  const botRef       = useRef<boolean>(false);

  // Initialise visitorId SYNCHRONOUSLY so it's available before any track()
  // call fires on first mount. Guard for SSR with typeof check.
  const visitorIdRef = useRef<string>(
    typeof window !== 'undefined' ? getOrCreateVisitorId() : ''
  );

  // Initialise bot check and DLQ drain once on client mount
  useEffect(() => {
    botRef.current = isBot();
    if (botRef.current) return;

    // Drain any previously failed batches
    drainDLQ();
  }, []);

  // ── Flush helpers ──────────────────────────────────────────────────────────

  const flush = useCallback((useBeacon = false) => {
    const events = bufferRef.current.splice(0);
    if (events.length === 0) return;
    const payload = JSON.stringify({ events });
    flushWithRetry(payload, useBeacon);
  }, []);

  // ── Periodic flush ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (botRef.current) return;
    const id = setInterval(() => flush(false), FLUSH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [flush]);

  // ── Flush on tab hide (tab close, navigate away) ───────────────────────────

  useEffect(() => {
    if (botRef.current) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush(true);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [flush]);

  // ── track() ───────────────────────────────────────────────────────────────

  const track = useCallback(
    (eventType: PublicEventType, extraMetadata?: Record<string, unknown>) => {
      // Bots get a no-op — nothing is queued or sent
      if (botRef.current) return;

      const visitorId = visitorIdRef.current;
      const sessionId = getOrRefreshSessionId(); // rolling expiry on every track call

      // ── Dedup for Unique Events ──────────────────────────────────────────
      if (UNIQUE_EVENT_TYPES.has(eventType)) {
        // Scope: itemId for item_view, shopId for everything else
        const scopeId = (extraMetadata?.itemId as string | undefined) ?? shopId;
        const key = getDedupKey(visitorId, eventType, scopeId);
        if (getSeenToday().has(key)) return; // silently drop — already seen today (survives hard refresh)
        markAsSeen(key);
      }
      // Count Events skip dedup entirely — every click counts

      // ── Build dedupKey (informational — stored in raw event) ────────────
      const scopeId  = (extraMetadata?.itemId as string | undefined) ?? shopId;
      const utcDate  = new Date().toISOString().slice(0, 10);
      const dedupKey = `${visitorId}|${eventType}|${scopeId}|${utcDate}`;

      const event: QueuedEvent = {
        shopId,
        eventType,
        visitorId,
        sessionId,
        dedupKey,
        occurredAt: new Date().toISOString(),
        metadata: {
          menuVersion,
          publishedAt,
          ua: navigator.userAgent, // raw UA — parsed at reporting time, not here
          ...extraMetadata,
        },
      };

      bufferRef.current.push(event);

      if (bufferRef.current.length >= FLUSH_THRESHOLD) {
        flush(false);
      }
    },
    [shopId, menuVersion, publishedAt, flush],
  );

  return (
    <AnalyticsCtx.Provider value={{ track }}>
      {children}
    </AnalyticsCtx.Provider>
  );
}

// ─── Consumer hook ─────────────────────────────────────────────────────────────

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsCtx);
  if (!ctx) {
    // Outside provider — return no-op so components never crash
    return { track: () => {} };
  }
  return ctx;
}
