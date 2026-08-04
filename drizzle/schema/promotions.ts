import { pgTable, uuid, text, boolean, timestamp, date, time, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { shops } from './shops';
import { users } from './users';

export const promotionTypeEnum = pgEnum('promotion_type', ['announcement', 'offer', 'todays_special']);

export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),

  // Promotion meta
  type: promotionTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  /** R2 object key for the optional banner image, e.g. "shops/{shopId}/offers/{id}.webp" */
  bannerImage: text('banner_image'),
  isActive: boolean('is_active').notNull().default(true),

  // ── Offer fields (only used when type = 'offer') ──────────────────────────
  /** 'percentage' | 'flat' | 'bxgy' */
  offerType: text('offer_type'),
  /** 20 for 20%, 50 for ₹50, 1 for Buy-1-Get-1 */
  offerValue: numeric('offer_value', { precision: 10, scale: 2 }),

  // ── Targeting ─────────────────────────────────────────────────────────────
  /** 'all' | 'category' | 'item' */
  targetType: text('target_type').default('all'),
  /** UUID[] of category or item ids — stored as JSON text array */
  targetIds: text('target_ids').array(),

  // ── Priority (higher wins when multiple offers at same specificity) ────────
  priority: integer('priority').notNull().default(0),

  // ── Schedule ──────────────────────────────────────────────────────────────
  /** Date the offer becomes active (NULL = always from creation) */
  startDate: date('start_date'),
  /** Date the offer expires (NULL = never expires) */
  endDate: date('end_date'),
  /** Daily time window start — e.g. Happy Hours "18:00" (NULL = all day) */
  startTime: time('start_time'),
  /** Daily time window end — e.g. Happy Hours "21:00" */
  endTime: time('end_time'),

  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Promotion = typeof promotions.$inferSelect;
export type NewPromotion = typeof promotions.$inferInsert;

/** The resolved offer attached to each item in the published JSON */
export interface ResolvedOffer {
  id: string;
  title: string;
  type: 'percentage' | 'flat' | 'bxgy';
  value: number;
  badge: string; // e.g. "20% OFF", "₹50 OFF", "Buy 1 Get 1"
}
