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
   * Update full vendor & shop details (admin edit).
   */
  async updateVendorDetails(
    userId: string,
    data: {
      owner?: string;
      phone?: string;
      shopName?: string;
      foodType?: string;
      whatsapp?: string;
      mapUrl?: string;
      address?: string;
      isActive?: boolean;
    }
  ) {
    const userUpdates: Record<string, unknown> = {};
    if (data.owner !== undefined) userUpdates.name = data.owner;
    if (data.phone !== undefined) userUpdates.phone = data.phone;
    if (data.isActive !== undefined) userUpdates.isActive = data.isActive;

    if (Object.keys(userUpdates).length > 0) {
      await userRepository.update(userId, userUpdates);
    }

    const shop = await shopRepository.findByUserId(userId);
    if (shop) {
      const shopUpdates: Record<string, unknown> = {};
      if (data.shopName !== undefined) shopUpdates.name = data.shopName;
      if (data.foodType !== undefined) shopUpdates.foodType = data.foodType;
      if (data.phone !== undefined) shopUpdates.phone = data.phone;
      if (data.whatsapp !== undefined) shopUpdates.whatsapp = data.whatsapp;
      if (data.mapUrl !== undefined) shopUpdates.mapUrl = data.mapUrl;
      if (data.address !== undefined) shopUpdates.address = data.address;
      if (data.isActive !== undefined) shopUpdates.isActive = data.isActive;

      if (Object.keys(shopUpdates).length > 0) {
        await shopRepository.update(shop.id, shopUpdates);
      }
    }
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
