import { pgTable, uuid, integer, date, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { menuItems } from './menu-items';

/**
 * Pre-aggregated daily stats per menu item.
 * Updated via ON CONFLICT DO UPDATE on every batch write that contains item-scoped events.
 *
 * Trend score is NOT stored here — it is computed at query time:
 *   (views * 0.5) + (likes * 3.0) + (shares * 4.0)
 * This means changing the formula never requires a migration.
 */
export const dailyItemStats = pgTable('daily_item_stats', {
  id:          uuid('id').primaryKey().defaultRandom(),
  shopId:      uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  itemId:      uuid('item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  date:        date('date').notNull(),             // 'YYYY-MM-DD' UTC
  views:       integer('views').notNull().default(0),
  uniqueViews: integer('unique_views').notNull().default(0),
  likes:       integer('likes').notNull().default(0),
  shares:      integer('shares').notNull().default(0),
  clicks:      integer('clicks').notNull().default(0),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('daily_item_stats_item_date_idx').on(t.itemId, t.date),
]);

export type DailyItemStats = typeof dailyItemStats.$inferSelect;
export type NewDailyItemStats = typeof dailyItemStats.$inferInsert;
