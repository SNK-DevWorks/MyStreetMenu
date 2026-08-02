import { pgTable, uuid, text, date, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { shops } from './shops';

/**
 * Lightweight junction table that tracks which visitors have been seen today per shop.
 *
 * The composite primary key on (shopId, date, visitorId) IS the unique constraint —
 * no separate index needed. This enables the pattern:
 *
 *   INSERT INTO daily_unique_visitors ... ON CONFLICT DO NOTHING
 *
 * If rowCount > 0  → new unique visitor today  → increment daily_shop_stats.unique_visitors
 * If rowCount === 0 → already counted          → do nothing
 *
 * No scanning of analytics_events. No extra SELECT. The DB enforces correctness.
 * Rows are pruned by the same 90-day cleanup job as analytics_events.
 */
export const dailyUniqueVisitors = pgTable('daily_unique_visitors', {
  shopId:      uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  date:        date('date').notNull(),            // 'YYYY-MM-DD' UTC
  visitorId:   text('visitor_id').notNull(),      // msm_vid value
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.shopId, t.date, t.visitorId] }),
]);

export type DailyUniqueVisitor = typeof dailyUniqueVisitors.$inferSelect;
export type NewDailyUniqueVisitor = typeof dailyUniqueVisitors.$inferInsert;
