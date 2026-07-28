import { eq, count, sql, and, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { analyticsEvents } from '../../drizzle/schema/analytics-events';

/**
 * Aggregated event counts by type for a shop.
 */
export async function getShopEventCounts(shopId: string) {
  const results = await db
    .select({
      eventType: analyticsEvents.eventType,
      count: count(),
    })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.shopId, shopId))
    .groupBy(analyticsEvents.eventType);

  return results;
}

/**
 * Event counts for a shop within a date range.
 */
export async function getShopEventCountsByDateRange(
  shopId: string,
  startDate: Date,
  endDate: Date
) {
  const results = await db
    .select({
      eventType: analyticsEvents.eventType,
      count: count(),
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.shopId, shopId),
        gte(analyticsEvents.createdAt, startDate),
        sql`${analyticsEvents.createdAt} <= ${endDate}`
      )
    )
    .groupBy(analyticsEvents.eventType);

  return results;
}

/**
 * Daily event trend for a shop (last N days).
 */
export async function getShopDailyTrend(shopId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const results = await db
    .select({
      date: sql<string>`DATE(${analyticsEvents.createdAt})`.as('date'),
      eventType: analyticsEvents.eventType,
      count: count(),
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.shopId, shopId),
        gte(analyticsEvents.createdAt, startDate)
      )
    )
    .groupBy(sql`DATE(${analyticsEvents.createdAt})`, analyticsEvents.eventType)
    .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

  return results;
}
