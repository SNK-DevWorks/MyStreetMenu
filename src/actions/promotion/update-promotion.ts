'use server';

import { updatePromotionSchema } from '@/lib/validations/promotion.schema';
import { promotionService, publishService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { Promotion } from '../../../drizzle/schema/promotions';

export async function updatePromotionAction(formData: FormData): Promise<ActionResponse<Promotion>> {
  const raw = {
    id: formData.get('id') as string,
    type: (formData.get('type') as string) || undefined,
    title: (formData.get('title') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    startDate: (formData.get('startDate') as string) || undefined,
    endDate: (formData.get('endDate') as string) || undefined,
    isActive: formData.has('isActive') ? formData.get('isActive') === 'true' : undefined,
  };

  const parsed = updatePromotionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const { id, startDate, endDate, ...rest } = parsed.data;
    const promo = await promotionService.updatePromotion(userId, id, {
      ...rest,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
    if (promo) publishService.publishMenuBackground(promo.shopId);
    return { success: true, data: promo ?? undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update promotion' };
  }
}
