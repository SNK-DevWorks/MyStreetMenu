'use client';

import React, { createContext, useContext, useRef, useEffect, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PublicEventType =
  | 'menu_view'
  | 'qr_scan'
  | 'item_view'
  | 'whatsapp_click'
  | 'direction_click'
  | 'share_click';

interface QueuedEvent {
  shopId: string;
  eventType: PublicEventType;
  sessionId: string;
  occurredAt: string;      // ISO — browser timestamp, not server time
  metadata?: Record<string, unknown>;
}

interface AnalyticsContextValue {
  track: (eventType: PublicEventType, metadata?: Record<string, unknown>) => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AnalyticsCtx = createContext<AnalyticsContextValue | null>(null);

// ─── Session ID ────────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  const KEY = 'msm_sid';
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
    return id;
  } catch {
    // sessionStorage may be blocked (private mode on some browsers)
    return crypto.randomUUID();
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────────

interface AnalyticsProviderProps {
  children: React.ReactNode;
  shopId: string;
  menuVersion: number;
  publishedAt: string;
}

const FLUSH_INTERVAL_MS = 30_000; // 30 seconds
const FLUSH_THRESHOLD = 10;       // flush immediately when 10 events accumulate
const BATCH_ENDPOINT = '/api/analytics/batch';

export function AnalyticsProvider({
  children,
  shopId,
  menuVersion,
  publishedAt,
}: AnalyticsProviderProps) {
  const bufferRef = useRef<QueuedEvent[]>([]);
  const sessionIdRef = useRef<string>('');

  // Initialise session ID once on mount (client-only)
  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  // ── Flush helpers ─────────────────────────────────────────────────────────

  const flush = useCallback((useBeacon = false) => {
    const events = bufferRef.current.splice(0);
    if (events.length === 0) return;

    const payload = JSON.stringify({ events });

    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      // sendBeacon survives tab close; must use text/plain for CORS-free POST
      navigator.sendBeacon(BATCH_ENDPOINT, payload);
    } else {
      fetch(BATCH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Analytics should never surface errors to users
      });
    }
  }, []);

  // ── Periodic flush ────────────────────────────────────────────────────────

  useEffect(() => {
    const id = setInterval(() => flush(false), FLUSH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [flush]);

  // ── Flush on tab hide (e.g. tab close, navigate away) ─────────────────────

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush(true);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [flush]);

  // ── track() ──────────────────────────────────────────────────────────────

  const track = useCallback(
    (eventType: PublicEventType, extraMetadata?: Record<string, unknown>) => {
      const event: QueuedEvent = {
        shopId,
        eventType,
        sessionId: sessionIdRef.current,
        occurredAt: new Date().toISOString(),
        metadata: {
          menuVersion,
          publishedAt,
          ...extraMetadata,
        },
      };

      bufferRef.current.push(event);

      // Immediate flush when threshold reached
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
    // Outside provider — return a no-op so components don't crash
    return { track: () => {} };
  }
  return ctx;
}
