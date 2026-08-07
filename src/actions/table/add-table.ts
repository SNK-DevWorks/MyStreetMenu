'use server';

import { z } from 'zod';
import { getCurrentUserId } from '@/lib/auth/get-user';
import { tableService } from '@/services/table.service';
import type { ActionResponse } from '@/types/action-response';
import type { ShopTable } from '../../../drizzle/schema/shop-tables';

const addTableSchema = z.object({
  label: z.string().min(1, 'Table label required').max(50, 'Label too long'),
});

/**
 * Authenticated vendor action — add a new table to their shop.
 */
export async function addTableAction(
  input: unknown,
): Promise<ActionResponse<ShopTable>> {
  const parsed = addTableSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const table = await tableService.addTable(userId, parsed.data.label);
    return { success: true, data: table };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add table',
    };
  }
}
