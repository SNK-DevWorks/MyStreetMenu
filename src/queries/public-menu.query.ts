import { eq, asc } from 'drizzle-orm';
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
