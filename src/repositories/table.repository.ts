import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { shopTables, type NewShopTable } from '../../drizzle/schema/shop-tables';

export const tableRepository = {
  /** All active tables for a shop, ordered by sortOrder then createdAt. */
  async findByShopId(shopId: string) {
    return db
      .select()
      .from(shopTables)
      .where(and(eq(shopTables.shopId, shopId), eq(shopTables.isActive, true)))
      .orderBy(shopTables.sortOrder, shopTables.createdAt);
  },

  /**
   * Validate a table UUID belongs to this shop and is active.
   * Returns the row (with label) or null.
   */
  async findByIdAndShop(id: string, shopId: string) {
    const [row] = await db
      .select()
      .from(shopTables)
      .where(
        and(
          eq(shopTables.id, id),
          eq(shopTables.shopId, shopId),
          eq(shopTables.isActive, true),
        ),
      );
    return row ?? null;
  },

  async create(data: NewShopTable) {
    const [row] = await db.insert(shopTables).values(data).returning();
    return row;
  },

  async delete(id: string, shopId: string) {
    const [row] = await db
      .delete(shopTables)
      .where(and(eq(shopTables.id, id), eq(shopTables.shopId, shopId)))
      .returning();
    return row ?? null;
  },

  async countByShopId(shopId: string) {
    const rows = await db
      .select({ id: shopTables.id })
      .from(shopTables)
      .where(and(eq(shopTables.shopId, shopId), eq(shopTables.isActive, true)));
    return rows.length;
  },
};
