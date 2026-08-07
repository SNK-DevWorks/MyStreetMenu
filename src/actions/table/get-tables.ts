'use server';

import { getCurrentUserId } from '@/lib/auth/get-user';
import { tableService } from '@/services/table.service';
import type { ActionResponse } from '@/types/action-response';
import type { ShopTable } from '../../../drizzle/schema/shop-tables';

/**
 * Authenticated vendor action — fetch all active tables for their shop.
 */
export async function getTablesAction(): Promise<ActionResponse<ShopTable[]>> {
  try {
    const userId = await getCurrentUserId();
    const tables = await tableService.getTablesForVendor(userId);
    return { success: true, data: tables };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tables',
    };
  }
}
