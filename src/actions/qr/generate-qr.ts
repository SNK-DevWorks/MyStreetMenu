'use server';

import { qrService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';

export async function generateQRAction(): Promise<ActionResponse<{ url: string; dataUrl: string }>> {
  try {
    const userId = await getCurrentUserId();
    const result = await qrService.generateQRCodeForVendor(userId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate QR code' };
  }
}
