'use server';

import { promotionService, publishService } from '@/services';
import { promotionRepository } from '@/repositories';
import { imageUploadService } from '@/services/image-upload.service';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';

export async function deletePromotionAction(promotionId: string): Promise<ActionResponse> {
  if (!promotionId) {
    return { success: false, error: 'Promotion ID is required' };
  }

  try {
    const userId = await getCurrentUserId();

    // Fetch promotion BEFORE deletion — capture shopId and bannerImage key
    const promo = await promotionRepository.findById(promotionId);
    const shopId = promo?.shopId;
    const bannerKey = promo?.bannerImage ?? null;

    await promotionService.deletePromotion(userId, promotionId);

    // Fire-and-forget banner cleanup from R2
    if (bannerKey) {
      imageUploadService.deleteImage(bannerKey).catch(() => {
        // Best-effort cleanup — don't block response on R2 failure
      });
    }

    if (shopId) publishService.publishMenuBackground(shopId);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete promotion' };
  }
}
