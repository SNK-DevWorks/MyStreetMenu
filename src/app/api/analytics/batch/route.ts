import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyticsService } from '@/services';

// ─── Bot Detection ─────────────────────────────────────────────────────────────

const BOT_UA_PATTERNS = [
  /googlebot/i, /bingbot/i, /facebookexternalhit/i, /slackbot/i,
  /discordbot/i, /whatsapp/i, /twitterbot/i, /applebot/i,
  /crawl/i, /spider/i, /bot/i,
];

function isBotUserAgent(ua: string): boolean {
  return BOT_UA_PATTERNS.some(p => p.test(ua));
}

// ─── Event Category Split ──────────────────────────────────────────────────────

/**
 * Unique Events: one occurrence per visitor per scope per day.
 * Count Events: every click counts — no dedup at any layer.
 */
const UNIQUE_EVENT_TYPES = new Set(['menu_view', 'qr_scan', 'item_view'] as const);

// ─── Validation ────────────────────────────────────────────────────────────────

const analyticsEventTypeValues = [
  'menu_view',
  'qr_scan',
  'item_view',
  'whatsapp_click',
  'direction_click',
  'share_click',
  'like_click',
] as const;

const batchEventSchema = z.object({
  shopId:     z.string().uuid(),
  eventType:  z.enum(analyticsEventTypeValues),
  visitorId:  z.string().optional().nullable(),
  sessionId:  z.string().optional().nullable(),
  dedupKey:   z.string().optional().nullable(),
  occurredAt: z.string().datetime().optional(),
  metadata:   z.record(z.string(), z.unknown()).optional().nullable(),
});

const batchRequestSchema = z.object({
  events: z
    .array(batchEventSchema)
    .min(1, 'At least one event required')
    .max(100, 'Maximum 100 events per batch'),
});

// ─── Handler ──────────────────────────────────────────────────────────────────

/**
 * POST /api/analytics/batch
 *
 * Accepts batched analytics events from the browser. Performs:
 *  1. Bot filtering (User-Agent check — silent 200 discard)
 *  2. Bulk insert into analytics_events
 *  3. Unique visitor tracking via daily_unique_visitors (INSERT ON CONFLICT DO NOTHING)
 *  4. Upsert into daily_shop_stats and daily_item_stats aggregate tables
 *
 * Analytics errors never surface to customers.
 */
export async function POST(request: NextRequest) {
  // ── Bot filter — silent 200 (avoid retry storms) ───────────────────────────
  const ua = request.headers.get('user-agent') ?? '';
  if (isBotUserAgent(ua)) {
    return NextResponse.json({ ok: true });
  }

  // ── Payload size guard (100KB) ─────────────────────────────────────────────
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 100_000) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  // ── Parse body — support both application/json and text/plain (sendBeacon) ─
  let rawBody: unknown;
  try {
    const contentType = request.headers.get('content-type') ?? '';
    rawBody = contentType.includes('application/json')
      ? await request.json()
      : JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ── Validate ───────────────────────────────────────────────────────────────
  const parsed = batchRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { events } = parsed.data;
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD' UTC

  // ── Process — errors must never surface to customers ──────────────────────
  try {
    await analyticsService.processBatch(events, today);
  } catch (error) {
    console.error('[analytics/batch] Processing failed:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: events.length });
}
