'use server';

import { updatePromotionSchema } from '@/lib/validations/promotion.schema';
import { promotionService, publishService } from '@/services';
import { promotionRepository } from '@/repositories';
import { imageUploadService } from '@/services/image-upload.service';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { Promotion } from '../../../drizzle/schema/promotions';

export async function updatePromotionAction(formData: FormData): Promise<ActionResponse<Promotion>> {
  const targetIdsRaw = formData.get('targetIds') as string | null;
  const targetIds = targetIdsRaw ? JSON.parse(targetIdsRaw) : undefined;

  const raw = {
    id: formData.get('id') as string,
    type: (formData.get('type') as string) || undefined,
    title: (formData.get('title') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    isActive: formData.has('isActive') ? formData.get('isActive') === 'true' : undefined,

    // Offer fields
    offerType: (formData.get('offerType') as string) || undefined,
    offerValue: (formData.get('offerValue') as string) || undefined,

    // Targeting
    targetType: (formData.get('targetType') as string) || undefined,
    targetIds,

    // Priority
    priority: formData.has('priority') ? (formData.get('priority') as string) : undefined,

    // Schedule
    startDate: (formData.get('startDate') as string) || undefined,
    endDate: (formData.get('endDate') as string) || undefined,
    startTime: (formData.get('startTime') as string) || undefined,
    endTime: (formData.get('endTime') as string) || undefined,

    // Banner
    bannerImage: (formData.get('bannerImage') as string) || undefined,
  };

  const parsed = updatePromotionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const { id, offerValue, targetIds: tIds, startDate, endDate, startTime, endTime, ...rest } = parsed.data;

    // ── Fetch old banner key BEFORE updating (safe deletion order) ────────────
    const oldPromo = await promotionRepository.findById(id);
    const oldBannerKey = oldPromo?.bannerImage ?? null;

    const promo = await promotionService.updatePromotion(userId, id, {
      ...rest,
      offerValue: offerValue != null ? String(offerValue) : undefined,
      targetIds: tIds?.length ? tIds : tIds === undefined ? undefined : null,
      startDate: startDate !== undefined ? (startDate || null) : undefined,
      endDate: endDate !== undefined ? (endDate || null) : undefined,
      startTime: startTime !== undefined ? (startTime || null) : undefined,
      endTime: endTime !== undefined ? (endTime || null) : undefined,
    });

    // ── After successful DB update: fire-and-forget old banner deletion ───────
    // Safe order: Upload new (done client-side) → DB update → delete old
    // Never delete first — if upload fails, old banner is still intact
    const newBannerKey = parsed.data.bannerImage;
    const bannerChanged = newBannerKey !== undefined && newBannerKey !== oldBannerKey;
    if (bannerChanged && oldBannerKey) {
      imageUploadService.deleteImage(oldBannerKey).catch(() => {
        // Fire-and-forget — deletion failure shouldn't block the response
      });
    }

    if (promo) publishService.publishMenuBackground(promo.shopId);
    return { success: true, data: promo ?? undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update promotion' };
  }
}
