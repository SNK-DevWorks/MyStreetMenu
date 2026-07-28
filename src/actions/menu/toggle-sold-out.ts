'use server';

import { toggleSoldOutSchema } from '@/lib/validations/menu.schema';
import { menuService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { MenuItem } from '../../../drizzle/schema/menu-items';

export async function toggleSoldOutAction(
  itemId: string,
  isSoldOut: boolean
): Promise<ActionResponse<MenuItem>> {
  const parsed = toggleSoldOutSchema.safeParse({ id: itemId, isSoldOut });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const item = await menuService.toggleSoldOut(userId, parsed.data.id, parsed.data.isSoldOut);
    return { success: true, data: item ?? undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to toggle sold out' };
  }
}
