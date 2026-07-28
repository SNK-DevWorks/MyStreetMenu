import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { analyticsEvents, type NewAnalyticsEvent } from '../../drizzle/schema/analytics-events';

export const analyticsRepository = {
  async recordEvent(data: NewAnalyticsEvent) {
    const [event] = await db.insert(analyticsEvents).values(data).returning();
    return event;
  },

  async getEventsByShopId(shopId: string) {
    return db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.shopId, shopId));
  },
};
