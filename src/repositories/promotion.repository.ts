import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { promotions, type NewPromotion } from '../../drizzle/schema/promotions';

export const promotionRepository = {
  async findById(id: string) {
    const [promo] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promo ?? null;
  },

  async findByShopId(shopId: string) {
    return db.select().from(promotions).where(eq(promotions.shopId, shopId));
  },

  async findActive(shopId: string) {
    return db
      .select()
      .from(promotions)
      .where(and(eq(promotions.shopId, shopId), eq(promotions.isActive, true)));
  },

  async create(data: NewPromotion) {
    const [promo] = await db.insert(promotions).values(data).returning();
    return promo;
  },

  async update(id: string, data: Partial<NewPromotion>) {
    const [promo] = await db
      .update(promotions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(promotions.id, id))
      .returning();
    return promo ?? null;
  },

  async delete(id: string) {
    const [promo] = await db.delete(promotions).where(eq(promotions.id, id)).returning();
    return promo ?? null;
  },
};
