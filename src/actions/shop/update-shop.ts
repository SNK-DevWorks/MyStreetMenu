'use server';

import { updateShopSchema } from '@/lib/validations/shop.schema';
import { shopService, publishService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import { resolveLocationInput } from '@/lib/resolve-maps';
import { createClient } from '@/lib/supabase/server';
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
    mapUrl: (formData.get('mapUrl') as string) || undefined,
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

    if (data.address) {
      const resolved = await resolveLocationInput(data.address);
      data.address = resolved.address;
      if (resolved.mapUrl) {
        data.mapUrl = resolved.mapUrl;
      }
    }

    const shop = await shopService.updateShop(userId, id, data);

    // Sync auth metadata
    try {
      const supabase = await createClient();
      await supabase.auth.updateUser({
        data: {
          ...(data.name && { shop_name: data.name }),
          ...(data.foodType && { food_type: data.foodType, category: data.foodType }),
          ...(data.phone && { phone: data.phone }),
          ...(data.whatsapp && { whatsapp: data.whatsapp }),
          ...(data.address && { address: data.address, location: data.address }),
          ...(data.mapUrl && { map_url: data.mapUrl }),
        },
      });
    } catch {
      // Auth metadata sync failsafe
    }

    // Republish: if menuVisibility changed to 'private', publishService will delete the R2 file
    if (shop) publishService.publishMenuBackground(shop.id);

    return { success: true, data: shop ?? undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update shop' };
  }
}
