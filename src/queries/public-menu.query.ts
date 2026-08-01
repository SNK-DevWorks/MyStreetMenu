import { eq, asc, and, or, isNull, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { shops } from '../../drizzle/schema/shops';
import { categories } from '../../drizzle/schema/categories';
import { menuItems } from '../../drizzle/schema/menu-items';
import { promotions } from '../../drizzle/schema/promotions';

/**
 * Full public menu page data: shop + categories + items + active promotions.
 * This is the main query for /menu/[slug] and /shop/[slug].
 */
export async function getPublicMenuData(shopSlug: string) {
  // Get shop
  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.slug, shopSlug));

  if (!shop) return null;

  // Get categories with their menu items
  const shopCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.shopId, shop.id))
    .orderBy(asc(categories.sortOrder));

  const shopMenuItems = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.shopId, shop.id))
    .orderBy(asc(menuItems.sortOrder));

  const activePromotions = await db
    .select()
    .from(promotions)
    .where(eq(promotions.shopId, shop.id));

  // Group items by category
  const categoriesWithItems = shopCategories.map((category) => ({
    ...category,
    items: shopMenuItems.filter((item) => item.categoryId === category.id),
  }));

  return {
    shop,
    categories: categoriesWithItems,
    promotions: activePromotions.filter((p) => p.isActive),
    todaysSpecials: shopMenuItems.filter((item) => item.isTodaysSpecial),
    bestSellers: shopMenuItems.filter((item) => item.isBestSeller),
  };
}

/**
 * Snapshot query used exclusively by publishService to build the published JSON file.
 *
 * - Queries by shopId (stable UUID) — never by slug, which can change on rename.
 * - Runs all four fetches in parallel for speed.
 * - Filters promotions to only those that are active and not yet expired.
 * - Returns null when the shop does not exist (publish service treats this as a no-op).
 */
export async function getPublicMenuSnapshot(shopId: string) {
  const now = new Date();

  const [[shop], shopCategories, shopMenuItems, activePromotions] = await Promise.all([
    db.select().from(shops).where(eq(shops.id, shopId)),

    db
      .select()
      .from(categories)
      .where(eq(categories.shopId, shopId))
      .orderBy(asc(categories.sortOrder)),

    db
      .select()
      .from(menuItems)
      .where(eq(menuItems.shopId, shopId))
      .orderBy(asc(menuItems.sortOrder)),

    // Only include promotions that are marked active and haven't expired yet
    db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.shopId, shopId),
          eq(promotions.isActive, true),
          or(isNull(promotions.endDate), gte(promotions.endDate, now)),
        ),
      ),
  ]);

  if (!shop) return null;

  const categoriesWithItems = shopCategories.map((category) => ({
    ...category,
    items: shopMenuItems.filter((item) => item.categoryId === category.id),
  }));

  return {
    shop,
    categories: categoriesWithItems,
    promotions: activePromotions,
    allItems: shopMenuItems,
  };
}
