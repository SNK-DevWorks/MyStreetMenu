'use client';

import React, { createContext, useContext, useRef, useEffect, useCallback, useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PublicEventType =
  | 'menu_view'
  | 'qr_scan'
  | 'item_view'
  | 'whatsapp_click'
  | 'direction_click'
  | 'share_click'
  | 'like_click'
  | 'cart_click';

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
  visitorId: string;
  isLiked: (itemId: string) => boolean;
  getLikeCount: (itemId: string) => number;
  isLikePending: (itemId: string) => boolean;
  likeMenuItem: (itemId: string) => Promise<void>;
}

// ─── Shop-Scoped Social Storage Helpers ────────────────────────────────────────

function getLocalLikedItems(shopId: string): Set<string> {
  if (typeof window === 'undefined' || !shopId) return new Set();
  try {
    const raw = localStorage.getItem(`msm_liked_items_${shopId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as { shopId?: string; likedItems?: string[] };
      if (Array.isArray(parsed.likedItems)) {
        return new Set(parsed.likedItems);
      }
    }
  } catch {}
  return new Set();
}

function setLocalLikedItems(shopId: string, set: Set<string>): void {
  if (typeof window === 'undefined' || !shopId) return;
  try {
    localStorage.setItem(
      `msm_liked_items_${shopId}`,
      JSON.stringify({
        shopId,
        likedItems: Array.from(set),
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {}
}

// ─── Event Category Constants ──────────────────────────────────────────────────

/**
 * Unique Events: one per visitor per scope per day.
 * Client-side dedup Set enforces this before any network call.
 */
const UNIQUE_EVENT_TYPES = new Set<PublicEventType>(['menu_view', 'item_view', 'qr_scan']);
// Count Events (whatsapp_click, direction_click, share_click, like_click) skip dedup entirely.

/**
 * HIGH-PRIORITY events: flush immediately after queuing (no batching delay).
 * These are low-frequency, high-value events that must not be lost.
 */
const IMMEDIATE_FLUSH_EVENTS = new Set<PublicEventType>([
  'qr_scan',
  'share_click',
  'whatsapp_click',
  'direction_click',
  'like_click',
  'menu_view',
]);

// ─── Bot Detection ─────────────────────────────────────────────────────────────

const BOT_UA_PATTERNS = [
  /googlebot/i, /bingbot/i, /facebookexternalhit/i, /slackbot/i,
  /discordbot/i, /twitterbot/i, /applebot/i,
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

/**
 * sendWithBeacon — uses sendBeacon for page-unload flushes.
 * sendBeacon content-type is text/plain but our route.ts handles that.
 */
function sendWithBeacon(payload: string): boolean {
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      return navigator.sendBeacon(BATCH_ENDPOINT, payload);
    }
  } catch {}
  return false;
}

async function flushWithRetry(payload: string, useBeacon = false): Promise<void> {
  if (useBeacon) {
    // Try beacon first (survives page close), fall through to fetch if unavailable
    if (sendWithBeacon(payload)) return;
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

// Periodic flush for item_view events that accumulate during long browsing sessions
const FLUSH_INTERVAL_MS = 15_000; // 15 seconds (reduced from 30s)
// Immediate flush threshold — low so we don't lose events if page closes quickly
const FLUSH_THRESHOLD   = 3;      // flush after just 3 events (reduced from 10)

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

  // ── Periodic flush (for item_view events that don't trigger immediate flush)

  useEffect(() => {
    if (botRef.current) return;
    const id = setInterval(() => flush(false), FLUSH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [flush]);

  // ── Flush on tab hide (visibilitychange) ──────────────────────────────────

  useEffect(() => {
    if (botRef.current) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush(true);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [flush]);

  // ── Flush on pagehide (PWA / iOS Safari — more reliable than visibilitychange)

  useEffect(() => {
    if (botRef.current) return;
    const onPageHide = () => flush(true);
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
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

      // ── Immediate flush for high-priority events ───────────────────────
      // qr_scan, share_click, whatsapp_click, direction_click, like_click, menu_view
      // are all sent immediately without any batching delay.
      if (IMMEDIATE_FLUSH_EVENTS.has(eventType)) {
        flush(false);
        return;
      }

      // ── Threshold flush for accumulating events (item_view) ───────────
      if (bufferRef.current.length >= FLUSH_THRESHOLD) {
        flush(false);
      }
    },
    [shopId, menuVersion, publishedAt, flush],
  );

  // ─── Social Likes Shared State Management ───────────────────────────────

  const [mounted, setMounted] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());

  // Hydrate local storage on client mount (prevents SSR hydration mismatch)
  useEffect(() => {
    setMounted(true);
    if (!shopId) return;
    const local = getLocalLikedItems(shopId);
    if (local.size > 0) {
      setLikedItems((prev: Set<string>) => {
        const merged = new Set<string>(prev);
        local.forEach((id: string) => merged.add(id));
        return merged;
      });
    }
  }, [shopId]);

  // Fetch initial public social snapshot (live counts + server-verified likedItems)
  useEffect(() => {
    if (!shopId || botRef.current) return;
    const vid = visitorIdRef.current;
    const url = `/api/menu/social?shopId=${encodeURIComponent(shopId)}${vid ? `&visitorId=${encodeURIComponent(vid)}` : ''}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.likeCounts) {
          setLikeCounts(data.likeCounts);
        }
        if (Array.isArray(data.likedItems) && data.likedItems.length > 0) {
          setLikedItems((prev: Set<string>) => {
            const merged = new Set<string>(prev);
            data.likedItems.forEach((id: string) => merged.add(id));
            setLocalLikedItems(shopId, merged);
            return merged;
          });
        }
      })
      .catch(() => {});
  }, [shopId]);

  const isLiked = useCallback(
    (itemId: string) => {
      if (!mounted) return false;
      return likedItems.has(itemId);
    },
    [mounted, likedItems]
  );

  const getLikeCount = useCallback((itemId: string) => likeCounts[itemId] ?? 0, [likeCounts]);

  const isLikePending = useCallback((itemId: string) => pendingLikes.has(itemId), [pendingLikes]);

  const likeMenuItem = useCallback(
    async (itemId: string) => {
      if (!itemId || !shopId) return;
      if (pendingLikes.has(itemId)) return;

      const currentlyLiked = likedItems.has(itemId);

      // Lock pending state
      setPendingLikes((prev: Set<string>) => new Set<string>(prev).add(itemId));

      if (currentlyLiked) {
        // ── UNLIKE WORKFLOW ──
        // 1. Optimistic UI update (remove from set, decrement count)
        setLikedItems((prev: Set<string>) => {
          const next = new Set<string>(prev);
          next.delete(itemId);
          setLocalLikedItems(shopId, next);
          return next;
        });

        setLikeCounts((prev: Record<string, number>) => ({
          ...prev,
          [itemId]: Math.max((prev[itemId] ?? 1) - 1, 0),
        }));

        try {
          const res = await fetch('/api/menu/like', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopId, itemId, visitorId: visitorIdRef.current }),
          });

          if (res.ok) {
            const data = await res.json();
            if (typeof data.likes === 'number') {
              setLikeCounts((prev: Record<string, number>) => ({
                ...prev,
                [itemId]: data.likes,
              }));
            }
          } else {
            // Rollback on HTTP error (re-add item)
            setLikedItems((prev: Set<string>) => {
              const next = new Set<string>(prev).add(itemId);
              setLocalLikedItems(shopId, next);
              return next;
            });
            setLikeCounts((prev: Record<string, number>) => ({
              ...prev,
              [itemId]: (prev[itemId] ?? 0) + 1,
            }));
          }
        } catch {
          // Rollback on network error
          setLikedItems((prev: Set<string>) => {
            const next = new Set<string>(prev).add(itemId);
            setLocalLikedItems(shopId, next);
            return next;
          });
          setLikeCounts((prev: Record<string, number>) => ({
            ...prev,
            [itemId]: (prev[itemId] ?? 0) + 1,
          }));
        } finally {
          setPendingLikes((prev: Set<string>) => {
            const next = new Set<string>(prev);
            next.delete(itemId);
            return next;
          });
        }
      } else {
        // ── LIKE WORKFLOW ──
        // 1. Optimistic UI update (add to set, increment count)
        setLikedItems((prev: Set<string>) => {
          const next = new Set<string>(prev).add(itemId);
          setLocalLikedItems(shopId, next);
          return next;
        });

        setLikeCounts((prev: Record<string, number>) => ({
          ...prev,
          [itemId]: (prev[itemId] ?? 0) + 1,
        }));

        try {
          const res = await fetch('/api/menu/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopId, itemId, visitorId: visitorIdRef.current }),
          });

          if (res.ok) {
            const data = await res.json();
            if (typeof data.likes === 'number') {
              setLikeCounts((prev: Record<string, number>) => ({
                ...prev,
                [itemId]: data.likes,
              }));
            }
          } else {
            // Rollback on HTTP error (remove item)
            setLikedItems((prev: Set<string>) => {
              const next = new Set<string>(prev);
              next.delete(itemId);
              setLocalLikedItems(shopId, next);
              return next;
            });
            setLikeCounts((prev: Record<string, number>) => ({
              ...prev,
              [itemId]: Math.max((prev[itemId] ?? 1) - 1, 0),
            }));
          }
        } catch {
          // Rollback on network error
          setLikedItems((prev: Set<string>) => {
            const next = new Set<string>(prev);
            next.delete(itemId);
            setLocalLikedItems(shopId, next);
            return next;
          });
          setLikeCounts((prev: Record<string, number>) => ({
            ...prev,
            [itemId]: Math.max((prev[itemId] ?? 1) - 1, 0),
          }));
        } finally {
          setPendingLikes((prev: Set<string>) => {
            const next = new Set<string>(prev);
            next.delete(itemId);
            return next;
          });
        }
      }
    },
    [shopId, likedItems, pendingLikes]
  );

  return (
    <AnalyticsCtx.Provider
      value={{
        track,
        visitorId: visitorIdRef.current,
        isLiked,
        getLikeCount,
        isLikePending,
        likeMenuItem,
      }}
    >
      {children}
    </AnalyticsCtx.Provider>
  );
}

// ─── Consumer hook ─────────────────────────────────────────────────────────────

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsCtx);
  if (!ctx) {
    // Outside provider — return no-op so components never crash
    return {
      track: () => {},
      visitorId: '',
      isLiked: () => false,
      getLikeCount: () => 0,
      isLikePending: () => false,
      likeMenuItem: async () => {},
    };
  }
  return ctx;
}
