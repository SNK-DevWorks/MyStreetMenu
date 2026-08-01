'use server';

import { reorderCategoriesSchema } from '@/lib/validations/category.schema';
import { categoryService, publishService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';

export async function reorderCategoriesAction(
  shopId: string,
  categoryIds: string[]
): Promise<ActionResponse> {
  const parsed = reorderCategoriesSchema.safeParse({ shopId, categoryIds });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    await categoryService.reorderCategories(userId, parsed.data.shopId, parsed.data.categoryIds);
    publishService.publishMenuBackground(parsed.data.shopId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reorder categories' };
  }
}
