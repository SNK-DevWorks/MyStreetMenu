import { eq, count, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '../../drizzle/schema/users';
import { shops } from '../../drizzle/schema/shops';
import { subscriptions } from '../../drizzle/schema/subscriptions';
import { menuItems } from '../../drizzle/schema/menu-items';

/**
 * Admin vendor list — shops joined with users, subscriptions, and menu item count.
 */
export async function getAdminVendorList() {
  const vendorList = await db
    .select({
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
      userIsActive: users.isActive,
      userCreatedAt: users.createdAt,
      shopId: shops.id,
      shopName: shops.name,
      shopSlug: shops.slug,
      shopLogoUrl: shops.logoUrl,
      shopFoodType: shops.foodType,
      shopAddress: shops.address,
      shopPhone: shops.phone,
      shopWhatsapp: shops.whatsapp,
      shopMapUrl: shops.mapUrl,
      shopIsActive: shops.isActive,
      shopCreatedAt: shops.createdAt,
      subscriptionPlan: subscriptions.plan,
      subscriptionStatus: subscriptions.status,
      subscriptionExpiry: subscriptions.expiryDate,
    })
    .from(users)
    .leftJoin(shops, eq(shops.userId, users.id))
    .leftJoin(subscriptions, eq(subscriptions.shopId, shops.id))
    .where(eq(users.role, 'vendor'))
    .orderBy(desc(users.createdAt));

  return vendorList;
}

/**
 * Admin vendor detail — single vendor with full shop + subscription data.
 */
export async function getAdminVendorDetail(userId: string) {
  const vendor = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!vendor) return null;

  const shop = await db.query.shops.findFirst({
    where: eq(shops.userId, userId),
    with: {
      categories: true,
      menuItems: true,
      promotions: true,
      subscriptions: true,
    },
  });

  return { vendor, shop };
}

/**
 * Admin dashboard stats — total vendors, active vendors, total revenue placeholder.
 */
export async function getAdminDashboardStats() {
  const [totalVendors] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, 'vendor'));

  const [activeVendors] = await db
    .select({ count: count() })
    .from(shops)
    .where(eq(shops.isActive, true));

  const [totalMenuItems] = await db.select({ count: count() }).from(menuItems);

  return {
    totalVendors: totalVendors?.count ?? 0,
    activeVendors: activeVendors?.count ?? 0,
    totalMenuItems: totalMenuItems?.count ?? 0,
  };
}
