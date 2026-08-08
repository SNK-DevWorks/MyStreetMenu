'use server';

import { adminService } from '@/services';
import { getAdminVendorDetail } from '@/queries';
import type { ActionResponse } from '@/types/action-response';

export async function getAdminVendorsAction(): Promise<ActionResponse<Awaited<ReturnType<typeof adminService.getAllVendors>>>> {
  try {
    const vendors = await adminService.getAllVendors();
    return { success: true, data: vendors };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch vendors' };
  }
}

export async function getVendorDetailAction(userId: string): Promise<ActionResponse<Awaited<ReturnType<typeof getAdminVendorDetail>>>> {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    const data = await getAdminVendorDetail(userId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch vendor detail' };
  }
}

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

export async function updateVendorDetailsAction(data: {
  userId: string;
  owner?: string;
  phone?: string;
  shopName?: string;
  foodType?: string;
  whatsapp?: string;
  mapUrl?: string;
  address?: string;
  isActive?: boolean;
}): Promise<ActionResponse> {
  if (!data.userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    await adminService.updateVendorDetails(data.userId, data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update vendor' };
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
