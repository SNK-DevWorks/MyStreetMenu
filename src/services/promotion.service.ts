import { promotionRepository, shopRepository } from '@/repositories';
import type { NewPromotion } from '../../drizzle/schema/promotions';

export const promotionService = {
  /**
   * Create a promotion. Vendor must own the shop.
   */
  async createPromotion(userId: string, data: Omit<NewPromotion, 'id'>) {
    const shop = await shopRepository.findById(data.shopId);
    if (!shop) throw new Error('Shop not found');
    if (shop.userId !== userId) throw new Error('Unauthorized');

    return promotionRepository.create(data);
  },

  /**
   * Update a promotion.
   */
  async updatePromotion(userId: string, promotionId: string, data: Partial<NewPromotion>) {
    const promo = await promotionRepository.findById(promotionId);
    if (!promo) throw new Error('Promotion not found');

    const shop = await shopRepository.findById(promo.shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    return promotionRepository.update(promotionId, data);
  },

  /**
   * Delete a promotion.
   */
  async deletePromotion(userId: string, promotionId: string) {
    const promo = await promotionRepository.findById(promotionId);
    if (!promo) throw new Error('Promotion not found');

    const shop = await shopRepository.findById(promo.shopId);
    if (!shop || shop.userId !== userId) throw new Error('Unauthorized');

    return promotionRepository.delete(promotionId);
  },

  /**
   * Get active promotions for a shop.
   */
  async getActivePromotions(shopId: string) {
    return promotionRepository.findActive(shopId);
  },
};
