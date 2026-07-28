'use server';

import { createShopSchema } from '@/lib/validations/shop.schema';
import { shopService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { Shop } from '../../../drizzle/schema/shops';

export async function createShopAction(formData: FormData): Promise<ActionResponse<Shop>> {
  const raw = {
    name: formData.get('name') as string,
    foodType: (formData.get('foodType') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    whatsapp: (formData.get('whatsapp') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
  };

  const parsed = createShopSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const shop = await shopService.createShop(userId, parsed.data);
    return { success: true, data: shop };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create shop' };
  }
}
