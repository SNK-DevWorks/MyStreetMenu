'use server';

import { createMenuItemSchema } from '@/lib/validations/menu.schema';
import { menuService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { MenuItem } from '../../../drizzle/schema/menu-items';

export async function createMenuAction(formData: FormData): Promise<ActionResponse<MenuItem>> {
  const raw = {
    shopId: formData.get('shopId') as string,
    categoryId: formData.get('categoryId') as string,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    price: formData.get('price') as string,
    imageUrl: (formData.get('imageUrl') as string) || undefined,
    foodType: (formData.get('foodType') as string) || 'veg',
    isBestSeller: formData.get('isBestSeller') === 'true',
    isSoldOut: formData.get('isSoldOut') === 'true',
    isTodaysSpecial: formData.get('isTodaysSpecial') === 'true',
  };

  const parsed = createMenuItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const item = await menuService.createMenuItem(userId, {
      ...parsed.data,
      price: parsed.data.price,
    });
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create menu item' };
  }
}

