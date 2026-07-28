import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { shops, type NewShop } from '../../drizzle/schema/shops';

export const shopRepository = {
  async findById(id: string) {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop ?? null;
  },

  async findByUserId(userId: string) {
    const [shop] = await db.select().from(shops).where(eq(shops.userId, userId));
    return shop ?? null;
  },

  async findBySlug(slug: string) {
    const [shop] = await db.select().from(shops).where(eq(shops.slug, slug));
    return shop ?? null;
  },

  async findAll() {
    return db.select().from(shops);
  },

  async create(data: NewShop) {
    const [shop] = await db.insert(shops).values(data).returning();
    return shop;
  },

  async update(id: string, data: Partial<NewShop>) {
    const [shop] = await db
      .update(shops)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shops.id, id))
      .returning();
    return shop ?? null;
  },

  async delete(id: string) {
    const [shop] = await db.delete(shops).where(eq(shops.id, id)).returning();
    return shop ?? null;
  },
};
