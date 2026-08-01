import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyticsService } from '@/services';

// ─── Validation ───────────────────────────────────────────────────────────────

const analyticsEventTypeValues = [
  'menu_view',
  'qr_scan',
  'item_view',
  'whatsapp_click',
  'direction_click',
  'share_click',
] as const;

const batchEventSchema = z.object({
  shopId: z.string().uuid(),
  eventType: z.enum(analyticsEventTypeValues),
  sessionId: z.string().optional().nullable(),
  occurredAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
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
 * Accepts an array of analytics events from the browser and bulk-inserts them
 * in a single SQL INSERT. This keeps analytics decoupled from menu delivery
 * — the menu page never waits for analytics writes.
 *
 * Supports both application/json and text/plain (navigator.sendBeacon sends text/plain).
 *
 * Abuse protection:
 *  - Maximum 100 events per request (enforced by Zod before any DB work)
 *  - Maximum 100KB payload (enforced before parsing)
 */
export async function POST(request: NextRequest) {
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

  // ── Bulk insert — single DB round-trip ────────────────────────────────────
  try {
    await analyticsService.trackBatch(
      events.map((e) => ({
        shopId: e.shopId,
        eventType: e.eventType,
        sessionId: e.sessionId ?? null,
        metadata: e.metadata
          ? { ...e.metadata, occurredAt: e.occurredAt }
          : e.occurredAt
            ? { occurredAt: e.occurredAt }
            : null,
      })),
    );
  } catch (error) {
    // Analytics errors must never surface to customers
    console.error('[analytics/batch] Insert failed:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: events.length });
}
