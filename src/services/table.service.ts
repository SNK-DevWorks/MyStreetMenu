import { shopRepository, tableRepository } from '@/repositories';
import type { ShopTable } from '../../drizzle/schema/shop-tables';

const MAX_TABLES = 50;

export const tableService = {
  /**
   * Get all active tables for the authenticated vendor's shop.
   */
  async getTablesForVendor(userId: string): Promise<ShopTable[]> {
    const shop = await shopRepository.findByUserId(userId);
    if (!shop) throw new Error('Shop not found');
    return tableRepository.findByShopId(shop.id);
  },

  /**
   * Add a new table to the vendor's shop.
   * Enforces a max of 50 active tables.
   */
  async addTable(userId: string, label: string): Promise<ShopTable> {
    const trimmed = label.trim();
    if (!trimmed) throw new Error('Table label cannot be empty');
    if (trimmed.length > 50) throw new Error('Table label too long (max 50 chars)');

    const shop = await shopRepository.findByUserId(userId);
    if (!shop) throw new Error('Shop not found');

    const count = await tableRepository.countByShopId(shop.id);
    if (count >= MAX_TABLES) {
      throw new Error(`Maximum ${MAX_TABLES} tables allowed`);
    }

    return tableRepository.create({
      shopId: shop.id,
      label: trimmed,
      sortOrder: count, // append at end
    });
  },

  /**
   * Delete a table from the vendor's shop.
   * This does NOT delete order history — orders snapshot tableLabel at placement time.
   */
  async deleteTable(userId: string, tableId: string): Promise<void> {
    const shop = await shopRepository.findByUserId(userId);
    if (!shop) throw new Error('Shop not found');

    const deleted = await tableRepository.delete(tableId, shop.id);
    if (!deleted) throw new Error('Table not found or unauthorized');
  },

  /**
   * Validate a table UUID belongs to a shop and is active.
   * Returns { id, label } if valid, null otherwise.
   * Used by Order Service — the ONLY validation point.
   */
  async resolveTable(
    shopId: string,
    tableUuid: string,
  ): Promise<{ id: string; label: string } | null> {
    const row = await tableRepository.findByIdAndShop(tableUuid, shopId);
    if (!row) return null;
    return { id: row.id, label: row.label };
  },
};
