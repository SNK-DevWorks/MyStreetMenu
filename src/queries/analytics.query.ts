import { eq, count, sql, and, gte, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { analyticsEvents } from '../../drizzle/schema/analytics-events';
import { dailyShopStats } from '../../drizzle/schema/daily-shop-stats';
import { dailyItemStats } from '../../drizzle/schema/daily-item-stats';
import { menuItems } from '../../drizzle/schema/menu-items';

// ─── Aggregate Queries (fast — single row reads) ───────────────────────────────

/**
 * Get daily shop stats for a date range.
 * Returns rows ordered by date ascending (most recent last).
 */
export async function getDailyShopStats(shopId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  const startStr = startDate.toISOString().slice(0, 10);

  return db
    .select()
    .from(dailyShopStats)
    .where(
      and(
        eq(dailyShopStats.shopId, shopId),
        gte(dailyShopStats.date, startStr),
      ),
    )
    .orderBy(dailyShopStats.date);
}

/**
 * Get today's and yesterday's shop stats in one query.
 * Used by dashboard cards for current values + delta.
 */
export async function getShopStatsByDates(shopId: string, dates: string[]) {
  return db
    .select()
    .from(dailyShopStats)
    .where(
      and(
        eq(dailyShopStats.shopId, shopId),
        sql`${dailyShopStats.date} = ANY(ARRAY[${sql.join(dates.map(d => sql`${d}`), sql`, `)}]::date[])`,
      ),
    );
}

/**
 * Get item stats with name + trend score computed in SQL.
 * Trend formula: (views * 0.5) + (likes * 3.0) + (shares * 4.0)
 * Changing weights = update this query only. Zero migrations.
 */
export async function getDailyItemStats(shopId: string, date: string, limit = 10) {
  const trendScore = sql<number>`
    (${dailyItemStats.views} * 0.5)
    + (${dailyItemStats.likes} * 3.0)
    + (${dailyItemStats.shares} * 4.0)
  `.as('trend_score');

  return db
    .select({
      itemId:      dailyItemStats.itemId,
      itemName:    menuItems.name,
      views:       dailyItemStats.views,
      uniqueViews: dailyItemStats.uniqueViews,
      likes:       dailyItemStats.likes,
      shares:      dailyItemStats.shares,
      clicks:      dailyItemStats.clicks,
      trendScore,
    })
    .from(dailyItemStats)
    .innerJoin(menuItems, eq(dailyItemStats.itemId, menuItems.id))
    .where(
      and(
        eq(dailyItemStats.shopId, shopId),
        eq(dailyItemStats.date, date),
      ),
    )
    .orderBy(desc(trendScore))
    .limit(limit);
}

/**
 * Top trending items for a shop today (by computed score).
 */
export async function getTrendingItems(shopId: string, limit = 10) {
  const today = new Date().toISOString().slice(0, 10);
  return getDailyItemStats(shopId, today, limit);
}

// ─── Legacy Raw-Event Queries (kept for backward compatibility) ────────────────

/**
 * Aggregated event counts by type for a shop (from raw events).
 * @deprecated Prefer getDailyShopStats() for dashboard — reads aggregate table.
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
 * Daily event trend for a shop (last N days) from raw events.
 * @deprecated Prefer getDailyShopStats() — much faster at scale.
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
        gte(analyticsEvents.createdAt, startDate),
      ),
    )
    .groupBy(sql`DATE(${analyticsEvents.createdAt})`, analyticsEvents.eventType)
    .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

  return results;
}
