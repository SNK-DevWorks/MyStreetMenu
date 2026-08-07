'use server';

import { z } from 'zod';
import { getCurrentUserId } from '@/lib/auth/get-user';
import { tableService } from '@/services/table.service';
import type { ActionResponse } from '@/types/action-response';

const deleteTableSchema = z.object({
  tableId: z.string().uuid('Invalid table ID'),
});

/**
 * Authenticated vendor action — delete one of their tables.
 * Existing orders are NOT affected — they retain the tableLabel snapshot.
 */
export async function deleteTableAction(
  input: unknown,
): Promise<ActionResponse<void>> {
  const parsed = deleteTableSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    await tableService.deleteTable(userId, parsed.data.tableId);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete table',
    };
  }
}
