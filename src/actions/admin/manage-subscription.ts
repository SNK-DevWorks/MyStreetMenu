'use server';

import { adminService } from '@/services';
import type { ActionResponse } from '@/types/action-response';

export async function manageSubscriptionAction(
  shopId: string,
  data: { plan?: string; status?: string; expiryDate?: string }
): Promise<ActionResponse> {
  if (!shopId) {
    return { success: false, error: 'Shop ID is required' };
  }

  try {
    await adminService.manageSubscription(shopId, {
      plan: data.plan,
      status: data.status,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to manage subscription' };
  }
}
