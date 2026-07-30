import { pgTable, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { users } from './users';

export const subscriptionPlanEnum = pgEnum('subscription_plan', ['free', 'basic', 'premium']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'expired', 'cancelled']);

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  plan: subscriptionPlanEnum('plan').notNull().default('free'),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull().defaultNow(),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
