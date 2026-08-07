import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { shops } from './shops';

/**
 * Vendor-defined tables (physical seating locations).
 * Each row represents one table the vendor has registered (e.g. "Table 4", "VIP", "Terrace-2").
 *
 * The table's UUID is embedded in QR codes (?t=<id>).
 * This makes QR codes tamper-proof: guessing or crafting a fake UUID
 * will fail validation in the Order Service.
 */
export const shopTables = pgTable('shop_tables', {
  id:        uuid('id').primaryKey().defaultRandom(),
  shopId:    uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),

  label:     text('label').notNull(),         // "4", "VIP", "Terrace-2"
  sortOrder: integer('sort_order').notNull().default(0),
  isActive:  boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ShopTable    = typeof shopTables.$inferSelect;
export type NewShopTable = typeof shopTables.$inferInsert;
