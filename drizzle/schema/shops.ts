import { pgTable, uuid, text, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const menuVisibilityEnum = pgEnum('menu_visibility', ['public', 'private']);

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
  openingHours: jsonb('opening_hours'), // { mon: "9:00-22:00", tue: "9:00-22:00", ... }
  theme: text('theme'),
  menuVisibility: menuVisibilityEnum('menu_visibility').notNull().default('public'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Shop = typeof shops.$inferSelect;
export type NewShop = typeof shops.$inferInsert;
