import { pgTable, uuid, text, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const menuVisibilityEnum = pgEnum('menu_visibility', ['public', 'private']);

/**
 * Tracks the current publish state of a shop's public menu in Cloudflare R2.
 *
 * idle       – never published, or no pending changes
 * publishing – publish job is currently running
 * published  – last publish succeeded
 * failed     – last publish failed (see server logs for details)
 */
export const publishStatusEnum = pgEnum('publish_status', ['idle', 'publishing', 'published', 'failed']);

export const shops = pgTable('shops', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logoUrl: text('logo_url'),
  coverImage: text('cover_image'),
  foodType: text('food_type'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  address: text('address'),
  mapUrl: text('map_url'),
  openingHours: jsonb('opening_hours'), // { mon: "9:00-22:00", tue: "9:00-22:00", ... }
  theme: text('theme'),
  menuVisibility: menuVisibilityEnum('menu_visibility').notNull().default('public'),
  isActive: boolean('is_active').notNull().default(true),
  // ── Publish tracking ──────────────────────────────────────────────────────
  publishStatus: publishStatusEnum('publish_status').notNull().default('idle'),
  lastPublishedAt: timestamp('last_published_at', { withTimezone: true }),
  // ─────────────────────────────────────────────────────────────────────────
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Shop = typeof shops.$inferSelect;
export type NewShop = typeof shops.$inferInsert;
export type PublishStatus = 'idle' | 'publishing' | 'published' | 'failed';

