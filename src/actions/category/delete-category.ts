'use server';

import { categoryService, publishService } from '@/services';
import { categoryRepository } from '@/repositories';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';

export async function deleteCategoryAction(categoryId: string): Promise<ActionResponse> {
  if (!categoryId) {
    return { success: false, error: 'Category ID is required' };
  }

  try {
    const userId = await getCurrentUserId();

    // Fetch shopId before deletion — row won't exist after deleteCategory
    const category = await categoryRepository.findById(categoryId);
    const shopId = category?.shopId;

    await categoryService.deleteCategory(userId, categoryId);

    if (shopId) publishService.publishMenuBackground(shopId);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete category' };
  }
}
