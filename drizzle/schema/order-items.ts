import { pgTable, uuid, text, numeric, integer, timestamp } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { menuItems } from './menu-items';

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),

  // Nullable: menu item may be deleted after order is placed
  menuItemId: uuid('menu_item_id').references(() => menuItems.id, { onDelete: 'set null' }),

  // Snapshot at time of order — immutable record of what was ordered
  name:     text('name').notNull(),
  image:    text('image'),
  price:    numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
