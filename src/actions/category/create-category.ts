'use server';

import { createCategorySchema } from '@/lib/validations/category.schema';
import { categoryService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { Category } from '../../../drizzle/schema/categories';

export async function createCategoryAction(formData: FormData): Promise<ActionResponse<Category>> {
  const raw = {
    shopId: formData.get('shopId') as string,
    name: formData.get('name') as string,
  };

  const parsed = createCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const category = await categoryService.createCategory(userId, parsed.data);
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create category' };
  }
}
