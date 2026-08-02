import { pgTable, uuid, integer, date, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { shops } from './shops';

/**
 * Pre-aggregated daily stats per shop.
 * Updated via ON CONFLICT DO UPDATE on every batch write.
 * Dashboard reads ONE ROW — never does a GROUP BY on raw events.
 */
export const dailyShopStats = pgTable('daily_shop_stats', {
  id:              uuid('id').primaryKey().defaultRandom(),
  shopId:          uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  date:            date('date').notNull(),                   // 'YYYY-MM-DD' UTC
  menuViews:       integer('menu_views').notNull().default(0),
  uniqueVisitors:  integer('unique_visitors').notNull().default(0),
  qrScans:         integer('qr_scans').notNull().default(0),
  shareClicks:     integer('share_clicks').notNull().default(0),
  likeClicks:      integer('like_clicks').notNull().default(0),
  whatsappClicks:  integer('whatsapp_clicks').notNull().default(0),
  directionClicks: integer('direction_clicks').notNull().default(0),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('daily_shop_stats_shop_date_idx').on(t.shopId, t.date),
]);

export type DailyShopStats = typeof dailyShopStats.$inferSelect;
export type NewDailyShopStats = typeof dailyShopStats.$inferInsert;
