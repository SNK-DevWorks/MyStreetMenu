import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { users } from './users';

export const analyticsEventTypeEnum = pgEnum('analytics_event_type', [
  'menu_view',
  'qr_scan',
  'item_view',
  'share_click',
  'direction_click',
  'whatsapp_click',
]);

export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  eventType: analyticsEventTypeEnum('event_type').notNull(),
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
