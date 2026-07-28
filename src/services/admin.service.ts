import { userRepository, shopRepository } from '@/repositories';
import { getAdminVendorList, getAdminDashboardStats } from '@/queries';

export const adminService = {
  /**
   * Get admin dashboard stats.
   */
  async getDashboardStats() {
    return getAdminDashboardStats();
  },

  /**
   * Get all vendors with their shop + subscription data.
   */
  async getAllVendors() {
    return getAdminVendorList();
  },

  /**
   * Activate or deactivate a vendor.
   */
  async updateVendorStatus(userId: string, isActive: boolean) {
    const user = await userRepository.update(userId, { isActive });
    if (!user) throw new Error('Vendor not found');

    // Also toggle their shop
    const shop = await shopRepository.findByUserId(userId);
    if (shop) {
      await shopRepository.update(shop.id, { isActive });
    }

    return user;
  },

  /**
   * Delete a vendor and their shop (cascade).
   */
  async deleteVendor(userId: string) {
    const user = await userRepository.delete(userId);
    if (!user) throw new Error('Vendor not found');
    return user;
  },

  /**
   * Manage a vendor's subscription (admin).
   */
  async manageSubscription(
    shopId: string,
    data: { plan?: string; status?: string; expiryDate?: Date }
  ) {
    // Import subscription repository inline to avoid circular deps
    const { eq } = await import('drizzle-orm');
    const { db } = await import('@/lib/db');
    const { subscriptions } = await import('../../drizzle/schema/subscriptions');

    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.shopId, shopId));

    if (!existing) {
      // Create subscription
      const [sub] = await db
        .insert(subscriptions)
        .values({
          shopId,
          plan: (data.plan as 'free' | 'basic' | 'premium') ?? 'free',
          status: (data.status as 'active' | 'expired' | 'cancelled') ?? 'active',
          expiryDate: data.expiryDate,
        })
        .returning();
      return sub;
    }

    // Update subscription
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.plan) updateData.plan = data.plan;
    if (data.status) updateData.status = data.status;
    if (data.expiryDate) updateData.expiryDate = data.expiryDate;

    const [sub] = await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.id, existing.id))
      .returning();

    return sub;
  },
};
