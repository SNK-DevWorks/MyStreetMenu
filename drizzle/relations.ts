import { relations } from 'drizzle-orm';
import { users } from './schema/users';
import { shops } from './schema/shops';
import { categories } from './schema/categories';
import { menuItems } from './schema/menu-items';
import { promotions } from './schema/promotions';
import { analyticsEvents } from './schema/analytics-events';
import { subscriptions } from './schema/subscriptions';

// ── User Relations ──────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  shops: many(shops),
}));

// ── Shop Relations ──────────────────────────────────────
export const shopsRelations = relations(shops, ({ one, many }) => ({
  user: one(users, {
    fields: [shops.userId],
    references: [users.id],
  }),
  categories: many(categories),
  menuItems: many(menuItems),
  promotions: many(promotions),
  analyticsEvents: many(analyticsEvents),
  subscriptions: many(subscriptions),
}));

// ── Category Relations ──────────────────────────────────
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  shop: one(shops, {
    fields: [categories.shopId],
    references: [shops.id],
  }),
  menuItems: many(menuItems),
}));

// ── Menu Item Relations ─────────────────────────────────
export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  shop: one(shops, {
    fields: [menuItems.shopId],
    references: [shops.id],
  }),
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
}));

// ── Promotion Relations ─────────────────────────────────
export const promotionsRelations = relations(promotions, ({ one }) => ({
  shop: one(shops, {
    fields: [promotions.shopId],
    references: [shops.id],
  }),
}));

// ── Analytics Event Relations ───────────────────────────
export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  shop: one(shops, {
    fields: [analyticsEvents.shopId],
    references: [shops.id],
  }),
}));

// ── Subscription Relations ──────────────────────────────
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  shop: one(shops, {
    fields: [subscriptions.shopId],
    references: [shops.id],
  }),
}));
