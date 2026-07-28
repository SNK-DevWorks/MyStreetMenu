import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { menuItems, type NewMenuItem } from '../../drizzle/schema/menu-items';

export const menuRepository = {
  async findById(id: string) {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item ?? null;
  },

  async findByShopId(shopId: string) {
    return db
      .select()
      .from(menuItems)
      .where(eq(menuItems.shopId, shopId))
      .orderBy(asc(menuItems.sortOrder));
  },

  async findByCategoryId(categoryId: string) {
    return db
      .select()
      .from(menuItems)
      .where(eq(menuItems.categoryId, categoryId))
      .orderBy(asc(menuItems.sortOrder));
  },

  async create(data: NewMenuItem) {
    const [item] = await db.insert(menuItems).values(data).returning();
    return item;
  },

  async update(id: string, data: Partial<NewMenuItem>) {
    const [item] = await db
      .update(menuItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return item ?? null;
  },

  async delete(id: string) {
    const [item] = await db.delete(menuItems).where(eq(menuItems.id, id)).returning();
    return item ?? null;
  },
};
