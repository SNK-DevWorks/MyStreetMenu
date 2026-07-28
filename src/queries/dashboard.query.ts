import { eq, count, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { shops } from '../../drizzle/schema/shops';
import { menuItems } from '../../drizzle/schema/menu-items';
import { categories } from '../../drizzle/schema/categories';
import { promotions } from '../../drizzle/schema/promotions';
import { analyticsEvents } from '../../drizzle/schema/analytics-events';

/**
 * Vendor dashboard stats — menu count, category count, views, scans, active promotions.
 */
export async function getVendorDashboardStats(shopId: string) {
  const [menuCount] = await db
    .select({ count: count() })
    .from(menuItems)
    .where(eq(menuItems.shopId, shopId));

  const [categoryCount] = await db
    .select({ count: count() })
    .from(categories)
    .where(eq(categories.shopId, shopId));

  const [activePromotionCount] = await db
    .select({ count: count() })
    .from(promotions)
    .where(eq(promotions.shopId, shopId));

  const [totalViews] = await db
    .select({ count: count() })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.shopId, shopId));

  const [qrScans] = await db
    .select({ count: count() })
    .from(analyticsEvents)
    .where(sql`${analyticsEvents.shopId} = ${shopId} AND ${analyticsEvents.eventType} = 'qr_scan'`);

  return {
    menuItemCount: menuCount?.count ?? 0,
    categoryCount: categoryCount?.count ?? 0,
    activePromotionCount: activePromotionCount?.count ?? 0,
    totalViews: totalViews?.count ?? 0,
    qrScans: qrScans?.count ?? 0,
  };
}

/**
 * Get vendor's shop with all related data for the dashboard.
 */
export async function getVendorDashboardData(userId: string) {
  const shop = await db.query.shops.findFirst({
    where: eq(shops.userId, userId),
    with: {
      categories: true,
      menuItems: true,
      promotions: true,
      subscriptions: true,
    },
  });

  return shop ?? null;
}
