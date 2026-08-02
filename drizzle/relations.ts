import { relations } from 'drizzle-orm';
import { users } from './schema/users';
import { shops } from './schema/shops';
import { categories } from './schema/categories';
import { menuItems } from './schema/menu-items';
import { promotions } from './schema/promotions';
import { analyticsEvents } from './schema/analytics-events';
import { subscriptions } from './schema/subscriptions';
import { dailyShopStats } from './schema/daily-shop-stats';
import { dailyItemStats } from './schema/daily-item-stats';
import { dailyUniqueVisitors } from './schema/daily-unique-visitors';

// ── User Relations ──────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  shops: many(shops),
  creator: one(users, {
    fields: [users.createdBy],
    references: [users.id],
  }),
}));

// ── Shop Relations ──────────────────────────────────────
export const shopsRelations = relations(shops, ({ one, many }) => ({
  user: one(users, {
    fields: [shops.userId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [shops.createdBy],
    references: [users.id],
  }),
  categories: many(categories),
  menuItems: many(menuItems),
  promotions: many(promotions),
  analyticsEvents: many(analyticsEvents),
  subscriptions: many(subscriptions),
  dailyShopStats: many(dailyShopStats),
  dailyUniqueVisitors: many(dailyUniqueVisitors),
}));

// ── Category Relations ──────────────────────────────────
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  shop: one(shops, {
    fields: [categories.shopId],
    references: [shops.id],
  }),
  creator: one(users, {
    fields: [categories.createdBy],
    references: [users.id],
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
  creator: one(users, {
    fields: [menuItems.createdBy],
    references: [users.id],
  }),
}));

// ── Promotion Relations ─────────────────────────────────
export const promotionsRelations = relations(promotions, ({ one }) => ({
  shop: one(shops, {
    fields: [promotions.shopId],
    references: [shops.id],
  }),
  creator: one(users, {
    fields: [promotions.createdBy],
    references: [users.id],
  }),
}));

// ── Analytics Event Relations ───────────────────────────
export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  shop: one(shops, {
    fields: [analyticsEvents.shopId],
    references: [shops.id],
  }),
  creator: one(users, {
    fields: [analyticsEvents.createdBy],
    references: [users.id],
  }),
}));

// ── Subscription Relations ──────────────────────────────
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  shop: one(shops, {
    fields: [subscriptions.shopId],
    references: [shops.id],
  }),
  creator: one(users, {
    fields: [subscriptions.createdBy],
    references: [users.id],
  }),
}));

// ── Daily Shop Stats Relations ──────────────────────────
export const dailyShopStatsRelations = relations(dailyShopStats, ({ one }) => ({
  shop: one(shops, {
    fields: [dailyShopStats.shopId],
    references: [shops.id],
  }),
}));

// ── Daily Item Stats Relations ──────────────────────────
export const dailyItemStatsRelations = relations(dailyItemStats, ({ one }) => ({
  shop: one(shops, {
    fields: [dailyItemStats.shopId],
    references: [shops.id],
  }),
  item: one(menuItems, {
    fields: [dailyItemStats.itemId],
    references: [menuItems.id],
  }),
}));

// ── Daily Unique Visitors Relations ────────────────────
export const dailyUniqueVisitorsRelations = relations(dailyUniqueVisitors, ({ one }) => ({
  shop: one(shops, {
    fields: [dailyUniqueVisitors.shopId],
    references: [shops.id],
  }),
}));

