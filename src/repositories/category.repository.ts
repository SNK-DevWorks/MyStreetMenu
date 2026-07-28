import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, type NewCategory } from '../../drizzle/schema/categories';

export const categoryRepository = {
  async findById(id: string) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category ?? null;
  },

  async findByShopId(shopId: string) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.shopId, shopId))
      .orderBy(asc(categories.sortOrder));
  },

  async create(data: NewCategory) {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  },

  async update(id: string, data: Partial<NewCategory>) {
    const [category] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category ?? null;
  },

  async delete(id: string) {
    const [category] = await db.delete(categories).where(eq(categories.id, id)).returning();
    return category ?? null;
  },

  async reorder(categoryIds: string[]) {
    const updates = categoryIds.map((id, index) =>
      db
        .update(categories)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(eq(categories.id, id))
    );
    await Promise.all(updates);
  },
};
