'use server';

import { createPromotionSchema } from '@/lib/validations/promotion.schema';
import { promotionService, publishService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { Promotion } from '../../../drizzle/schema/promotions';

export async function createPromotionAction(formData: FormData): Promise<ActionResponse<Promotion>> {
  const targetIdsRaw = formData.get('targetIds') as string | null;
  const targetIds = targetIdsRaw ? JSON.parse(targetIdsRaw) : undefined;

  const raw = {
    shopId: formData.get('shopId') as string,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,

    // Offer fields
    offerType: (formData.get('offerType') as string) || undefined,
    offerValue: (formData.get('offerValue') as string) || undefined,

    // Targeting
    targetType: (formData.get('targetType') as string) || 'all',
    targetIds,

    // Priority
    priority: (formData.get('priority') as string) || '0',

    // Schedule
    startDate: (formData.get('startDate') as string) || undefined,
    endDate: (formData.get('endDate') as string) || undefined,
    startTime: (formData.get('startTime') as string) || undefined,
    endTime: (formData.get('endTime') as string) || undefined,

    // Banner
    bannerImage: (formData.get('bannerImage') as string) || undefined,
  };

  const parsed = createPromotionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const promo = await promotionService.createPromotion(userId, {
      ...parsed.data,
      offerValue: parsed.data.offerValue != null ? String(parsed.data.offerValue) : null,
      startDate: parsed.data.startDate || null,
      endDate: parsed.data.endDate || null,
      startTime: parsed.data.startTime || null,
      endTime: parsed.data.endTime || null,
      targetIds: parsed.data.targetIds?.length ? parsed.data.targetIds : null,
    });
    publishService.publishMenuBackground(parsed.data.shopId);
    return { success: true, data: promo };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create promotion' };
  }
}
