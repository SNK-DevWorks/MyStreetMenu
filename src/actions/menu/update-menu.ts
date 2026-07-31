'use server';

import { updateMenuItemSchema } from '@/lib/validations/menu.schema';
import { menuService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { MenuItem } from '../../../drizzle/schema/menu-items';

export async function updateMenuAction(formData: FormData): Promise<ActionResponse<MenuItem>> {
  const raw = {
    id: formData.get('id') as string,
    name: (formData.get('name') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    price: (formData.get('price') as string) || undefined,
    imageUrl: (formData.get('imageUrl') as string) || undefined,
    foodType: (formData.get('foodType') as string) || undefined,
    categoryId: (formData.get('categoryId') as string) || undefined,
    isBestSeller: formData.has('isBestSeller') ? formData.get('isBestSeller') === 'true' : undefined,
    isSoldOut: formData.has('isSoldOut') ? formData.get('isSoldOut') === 'true' : undefined,
    isTodaysSpecial: formData.has('isTodaysSpecial') ? formData.get('isTodaysSpecial') === 'true' : undefined,
  };

  const parsed = updateMenuItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const { id, ...data } = parsed.data;
    const item = await menuService.updateMenuItem(userId, id, data);
    return { success: true, data: item ?? undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update menu item' };
  }
}

