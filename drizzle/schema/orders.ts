import { pgTable, uuid, text, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { shopTables } from './shop-tables';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum('order_status', [
  'new',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'counter_cash',
  'counter_card',
  'counter_upi',
  'online_upi',
  'online_card',
]);

export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid']);

export const orderSourceEnum = pgEnum('order_source', [
  'qr',
  'direct_link',
  'manual',
  'admin',
]);

// ── Table ─────────────────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),

  // Order identity
  token: text('token').notNull(),           // "A01", "A02" — daily sequential per shop

  // Lifecycle
  status: orderStatusEnum('status').notNull().default('new'),

  // Customer info (snapshot at time of order)
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),

  // Table — two columns for full integrity:
  //   tableId    = FK to shop_tables (null if table deleted or walk-in)
  //   tableLabel = snapshot of the label at order time (never goes blank)
  tableId:    uuid('table_id').references(() => shopTables.id, { onDelete: 'set null' }),
  tableLabel: text('table_label'),          // snapshot: "Table 4", "VIP", "Counter"
  customerNotes: text('customer_notes'),    // customer-facing notes

  // Payment
  paymentMethod: paymentMethodEnum('payment_method').default('counter_cash'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),

  // Analytics
  orderSource: orderSourceEnum('order_source').notNull().default('direct_link'),

  // Financials (snapshot at time of order)
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull().default('0'),
  discount: numeric('discount', { precision: 10, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull().default('0'),

  // Timestamps — full lifecycle for analytics
  placedAt:     timestamp('placed_at',     { withTimezone: true }).notNull().defaultNow(),
  preparingAt:  timestamp('preparing_at',  { withTimezone: true }),   // vendor accepted
  readyAt:      timestamp('ready_at',      { withTimezone: true }),   // vendor marked ready
  completedAt:  timestamp('completed_at',  { withTimezone: true }),   // order done

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
