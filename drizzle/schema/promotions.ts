import { pgTable, uuid, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { users } from './users';

export const promotionTypeEnum = pgEnum('promotion_type', ['announcement', 'offer', 'todays_special']);

export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  type: promotionTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Promotion = typeof promotions.$inferSelect;
export type NewPromotion = typeof promotions.$inferInsert;
