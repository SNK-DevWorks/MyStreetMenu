'use server';

import { updateShopSchema } from '@/lib/validations/shop.schema';
import { shopService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { Shop } from '../../../drizzle/schema/shops';

export async function updateShopAction(formData: FormData): Promise<ActionResponse<Shop>> {
  const raw = {
    id: formData.get('id') as string,
    name: (formData.get('name') as string) || undefined,
    foodType: (formData.get('foodType') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    whatsapp: (formData.get('whatsapp') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    theme: (formData.get('theme') as string) || undefined,
    menuVisibility: (formData.get('menuVisibility') as 'public' | 'private') || undefined,
  };

  const parsed = updateShopSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const { id, ...data } = parsed.data;
    const shop = await shopService.updateShop(userId, id, data);
    return { success: true, data: shop ?? undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update shop' };
  }
}
