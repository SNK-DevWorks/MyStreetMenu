import { pgTable, uuid, date, integer, primaryKey } from 'drizzle-orm/pg-core';
import { shops } from './shops';

/**
 * Atomic daily token counter per shop.
 * Used by generateToken() to produce sequential tokens: A01, A02...
 * Resets automatically each day via the `date` column.
 *
 * Uses INSERT … ON CONFLICT DO UPDATE (upsert) so token generation
 * is fully race-condition-safe without application-level locks.
 */
export const shopTokenCounters = pgTable(
  'shop_token_counters',
  {
    shopId:  uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
    date:    date('date').notNull(),          // "2026-08-07" — resets counter each day
    counter: integer('counter').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.shopId, table.date] })],
);

export type ShopTokenCounter = typeof shopTokenCounters.$inferSelect;
