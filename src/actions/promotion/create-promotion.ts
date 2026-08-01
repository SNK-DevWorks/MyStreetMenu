'use server';

import { createPromotionSchema } from '@/lib/validations/promotion.schema';
import { promotionService, publishService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { Promotion } from '../../../drizzle/schema/promotions';

export async function createPromotionAction(formData: FormData): Promise<ActionResponse<Promotion>> {
  const raw = {
    shopId: formData.get('shopId') as string,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    startDate: (formData.get('startDate') as string) || undefined,
    endDate: (formData.get('endDate') as string) || undefined,
  };

  const parsed = createPromotionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const promo = await promotionService.createPromotion(userId, {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    });
    publishService.publishMenuBackground(parsed.data.shopId);
    return { success: true, data: promo };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create promotion' };
  }
}
