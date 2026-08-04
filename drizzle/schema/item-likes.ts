import { pgTable, uuid, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { menuItems } from './menu-items';

export const itemLikes = pgTable(
  'item_likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    shopId: uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
    visitorId: text('visitor_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('item_likes_shop_item_visitor_idx').on(table.shopId, table.itemId, table.visitorId),
    index('item_likes_shop_idx').on(table.shopId),
    index('item_likes_item_idx').on(table.itemId),
    index('item_likes_visitor_idx').on(table.visitorId),
  ]
);

export type ItemLike = typeof itemLikes.$inferSelect;
export type NewItemLike = typeof itemLikes.$inferInsert;
