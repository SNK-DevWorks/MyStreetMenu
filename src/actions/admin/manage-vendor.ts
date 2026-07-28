'use server';

import { adminService } from '@/services';
import type { ActionResponse } from '@/types/action-response';

export async function activateVendorAction(userId: string): Promise<ActionResponse> {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    await adminService.updateVendorStatus(userId, true);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to activate vendor' };
  }
}

export async function deactivateVendorAction(userId: string): Promise<ActionResponse> {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    await adminService.updateVendorStatus(userId, false);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to deactivate vendor' };
  }
}

export async function deleteVendorAction(userId: string): Promise<ActionResponse> {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    await adminService.deleteVendor(userId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete vendor' };
  }
}
