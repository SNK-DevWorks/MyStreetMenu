import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { analyticsEvents, type NewAnalyticsEvent } from '../../drizzle/schema/analytics-events';
import { dailyShopStats } from '../../drizzle/schema/daily-shop-stats';
import { dailyItemStats } from '../../drizzle/schema/daily-item-stats';
import { dailyUniqueVisitors } from '../../drizzle/schema/daily-unique-visitors';

// ─── Event Category Constants ──────────────────────────────────────────────────

/** Item-scoped events that should upsert daily_item_stats. */
const ITEM_SCOPED_EVENTS = new Set(['item_view', 'like_click']);

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface BatchEvent {
  shopId:     string;
  eventType:  string;
  visitorId?: string | null;
  sessionId?: string | null;
  dedupKey?:  string | null;
  occurredAt?: string;
  metadata?:  Record<string, unknown> | null;
}

// ─── Repository ────────────────────────────────────────────────────────────────

export const analyticsRepository = {
  async recordEvent(data: NewAnalyticsEvent) {
    const [event] = await db.insert(analyticsEvents).values(data).returning();
    return event;
  },

  /**
   * Full batch processing pipeline:
   * 1. Bulk insert raw events into analytics_events
   * 2. For menu_view events: INSERT INTO daily_unique_visitors ON CONFLICT DO NOTHING
   *    → if a new row is inserted, increment daily_shop_stats.unique_visitors
   * 3. Upsert daily_shop_stats counters (all event types)
   * 4. Upsert daily_item_stats counters (item-scoped events only)
   *
   * All in a single transaction to ensure consistency.
   */
  async processBatch(events: BatchEvent[], today: string): Promise<void> {
    if (events.length === 0) return;

    await db.transaction(async (tx) => {
      // ── 1. Bulk insert raw events ──────────────────────────────────────────
      const rawEvents: NewAnalyticsEvent[] = events.map(e => ({
        shopId:    e.shopId,
        eventType: e.eventType as NewAnalyticsEvent['eventType'],
        visitorId: e.visitorId ?? null,
        sessionId: e.sessionId ?? null,
        dedupKey:  e.dedupKey ?? null,
        metadata:  e.metadata
          ? { ...e.metadata, occurredAt: e.occurredAt }
          : e.occurredAt
          ? { occurredAt: e.occurredAt }
          : null,
      }));
      await tx.insert(analyticsEvents).values(rawEvents);

      // ── 2. Unique visitor tracking ─────────────────────────────────────────
      // Group menu_view events by shopId+visitorId (deduplicate within same batch)
      const menuViewsByShop = new Map<string, Set<string>>();
      for (const e of events) {
        if (e.eventType === 'menu_view' && e.visitorId) {
          if (!menuViewsByShop.has(e.shopId)) menuViewsByShop.set(e.shopId, new Set());
          menuViewsByShop.get(e.shopId)!.add(e.visitorId);
        }
      }

      for (const [shopId, visitorIds] of menuViewsByShop) {
        for (const visitorId of visitorIds) {
          const result = await tx
            .insert(dailyUniqueVisitors)
            .values({ shopId, date: today, visitorId })
            .onConflictDoNothing()
            .returning();

          // Only increment if a new row was inserted (first visit today)
          if (result.length > 0) {
            await tx
              .insert(dailyShopStats)
              .values({ shopId, date: today, uniqueVisitors: 1 })
              .onConflictDoUpdate({
                target: [dailyShopStats.shopId, dailyShopStats.date],
                set: { uniqueVisitors: sql`${dailyShopStats.uniqueVisitors} + 1`, updatedAt: sql`now()` },
              });
          }
        }
      }

      // ── 3. Upsert daily_shop_stats counters ───────────────────────────────
      // Aggregate event counts per shop for this batch
      const shopCounts = new Map<string, {
        menuViews: number; qrScans: number; shareClicks: number;
        likeClicks: number; whatsappClicks: number; directionClicks: number;
      }>();

      for (const e of events) {
        if (!shopCounts.has(e.shopId)) {
          shopCounts.set(e.shopId, {
            menuViews: 0, qrScans: 0, shareClicks: 0,
            likeClicks: 0, whatsappClicks: 0, directionClicks: 0,
          });
        }
        const c = shopCounts.get(e.shopId)!;
        switch (e.eventType) {
          case 'menu_view':       c.menuViews++;       break;
          case 'qr_scan':         c.qrScans++;         break;
          case 'share_click':     c.shareClicks++;     break;
          case 'like_click':      c.likeClicks++;      break;
          case 'whatsapp_click':  c.whatsappClicks++;  break;
          case 'direction_click': c.directionClicks++; break;
        }
      }

      for (const [shopId, counts] of shopCounts) {
        await tx
          .insert(dailyShopStats)
          .values({ shopId, date: today, ...counts })
          .onConflictDoUpdate({
            target: [dailyShopStats.shopId, dailyShopStats.date],
            set: {
              menuViews:       sql`${dailyShopStats.menuViews}       + ${counts.menuViews}`,
              qrScans:         sql`${dailyShopStats.qrScans}         + ${counts.qrScans}`,
              shareClicks:     sql`${dailyShopStats.shareClicks}     + ${counts.shareClicks}`,
              likeClicks:      sql`${dailyShopStats.likeClicks}      + ${counts.likeClicks}`,
              whatsappClicks:  sql`${dailyShopStats.whatsappClicks}  + ${counts.whatsappClicks}`,
              directionClicks: sql`${dailyShopStats.directionClicks} + ${counts.directionClicks}`,
              updatedAt:       sql`now()`,
            },
          });
      }

      // ── 4. Upsert daily_item_stats (item-scoped events only) ──────────────
      const itemCounts = new Map<string, { shopId: string; views: number; likes: number; shares: number; uniqueViewVisitors: Set<string> }>();

      for (const e of events) {
        if (!ITEM_SCOPED_EVENTS.has(e.eventType)) continue;
        const itemId = e.metadata?.itemId as string | undefined;
        if (!itemId) continue;

        if (!itemCounts.has(itemId)) {
          itemCounts.set(itemId, { shopId: e.shopId, views: 0, likes: 0, shares: 0, uniqueViewVisitors: new Set() });
        }
        const c = itemCounts.get(itemId)!;
        if (e.eventType === 'item_view') {
          c.views++;
          if (e.visitorId) c.uniqueViewVisitors.add(e.visitorId);
        }
        if (e.eventType === 'like_click') c.likes++;
      }

      for (const [itemId, counts] of itemCounts) {
        // Note: unique_views increment uses the same ON CONFLICT pattern.
        // For simplicity we pass the count of unique visitors seen in this batch.
        const uniqueViewsIncrement = counts.uniqueViewVisitors.size;
        await tx
          .insert(dailyItemStats)
          .values({
            shopId: counts.shopId,
            itemId,
            date:   today,
            views:       counts.views,
            uniqueViews: uniqueViewsIncrement,
            likes:       counts.likes,
            shares:      counts.shares,
          })
          .onConflictDoUpdate({
            target: [dailyItemStats.itemId, dailyItemStats.date],
            set: {
              views:       sql`${dailyItemStats.views}       + ${counts.views}`,
              uniqueViews: sql`${dailyItemStats.uniqueViews} + ${uniqueViewsIncrement}`,
              likes:       sql`${dailyItemStats.likes}       + ${counts.likes}`,
              shares:      sql`${dailyItemStats.shares}      + ${counts.shares}`,
              updatedAt:   sql`now()`,
            },
          });
      }
    });
  },

  async getEventsByShopId(shopId: string) {
    return db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.shopId, shopId));
  },
};
