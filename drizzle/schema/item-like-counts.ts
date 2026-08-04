import { pgTable, uuid, integer, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { menuItems } from './menu-items';

export const itemLikeCounts = pgTable(
  'item_like_counts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    shopId: uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
    likes: integer('likes').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('item_like_counts_shop_item_idx').on(table.shopId, table.itemId),
    index('item_like_counts_shop_idx').on(table.shopId),
  ]
);

export type ItemLikeCount = typeof itemLikeCounts.$inferSelect;
export type NewItemLikeCount = typeof itemLikeCounts.$inferInsert;
