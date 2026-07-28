import { shopRepository } from '@/repositories';
import type { NewShop } from '../../drizzle/schema/shops';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const shopService = {
  /**
   * Create a new shop for a vendor.
   */
  async createShop(userId: string, data: Omit<NewShop, 'userId' | 'slug'>) {
    // Check if vendor already has a shop
    const existing = await shopRepository.findByUserId(userId);
    if (existing) {
      throw new Error('Vendor already has a shop');
    }

    // Generate slug from shop name
    let slug = generateSlug(data.name);
    const existingSlug = await shopRepository.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const shop = await shopRepository.create({
      ...data,
      userId,
      slug,
    });

    return shop;
  },

  /**
   * Update an existing shop. Only the shop owner can update.
   */
  async updateShop(userId: string, shopId: string, data: Partial<NewShop>) {
    const shop = await shopRepository.findById(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }
    if (shop.userId !== userId) {
      throw new Error('Unauthorized: You do not own this shop');
    }

    // If name changed, regenerate slug
    if (data.name && data.name !== shop.name) {
      let slug = generateSlug(data.name);
      const existingSlug = await shopRepository.findBySlug(slug);
      if (existingSlug && existingSlug.id !== shopId) {
        slug = `${slug}-${Date.now()}`;
      }
      data.slug = slug;
    }

    return shopRepository.update(shopId, data);
  },

  /**
   * Get shop by slug (public).
   */
  async getShopBySlug(slug: string) {
    const shop = await shopRepository.findBySlug(slug);
    if (!shop) {
      throw new Error('Shop not found');
    }
    return shop;
  },

  /**
   * Get the vendor's own shop.
   */
  async getVendorShop(userId: string) {
    return shopRepository.findByUserId(userId);
  },

  /**
   * Toggle shop active/inactive status (admin only).
   */
  async toggleShopStatus(shopId: string, isActive: boolean) {
    const shop = await shopRepository.update(shopId, { isActive });
    if (!shop) {
      throw new Error('Shop not found');
    }
    return shop;
  },

  /**
   * Get all shops (admin).
   */
  async getAllShops() {
    return shopRepository.findAll();
  },
};
