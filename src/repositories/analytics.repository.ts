import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { analyticsEvents, type NewAnalyticsEvent } from '../../drizzle/schema/analytics-events';

export const analyticsRepository = {
  async recordEvent(data: NewAnalyticsEvent) {
    const [event] = await db.insert(analyticsEvents).values(data).returning();
    return event;
  },

  /**
   * Bulk-insert many events in a single SQL round-trip.
   * Used by POST /api/analytics/batch to handle browser-batched event flushes.
   */
  async recordBatch(events: NewAnalyticsEvent[]): Promise<void> {
    if (events.length === 0) return;
    await db.insert(analyticsEvents).values(events);
  },

  async getEventsByShopId(shopId: string) {
    return db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.shopId, shopId));
  },
};
