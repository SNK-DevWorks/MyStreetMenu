'use server';

import { updateCategorySchema } from '@/lib/validations/category.schema';
import { categoryService, publishService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { Category } from '../../../drizzle/schema/categories';

export async function updateCategoryAction(formData: FormData): Promise<ActionResponse<Category>> {
  const raw = {
    id: formData.get('id') as string,
    name: (formData.get('name') as string) || undefined,
  };

  const parsed = updateCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const { id, ...data } = parsed.data;
    const category = await categoryService.updateCategory(userId, id, data);
    if (category) publishService.publishMenuBackground(category.shopId);
    return { success: true, data: category ?? undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update category' };
  }
}
