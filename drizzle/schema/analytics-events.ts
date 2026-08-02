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
  'like_click',
]);

export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  visitorId: text('visitor_id'),         // persistent anonymous visitor (cookie/localStorage, 365d)
  sessionId: text('session_id'),         // session-scoped (30-min inactivity expiry)
  dedupKey: text('dedup_key'),           // format: visitorId|eventType|scopeId|YYYY-MM-DD (no UNIQUE — window-based)
  eventType: analyticsEventTypeEnum('event_type').notNull(),
  metadata: jsonb('metadata'),           // flexible: { itemId?, ua, source?, tableNo?, campaign?, ... }
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
