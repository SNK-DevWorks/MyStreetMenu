'use server';

import { z } from 'zod';
import { FOOD_TYPES } from '@/lib/validations/menu.schema';
import { menuService, publishService } from '@/services';
import { getCurrentUserId } from '@/lib/auth/get-user';
import type { ActionResponse } from '@/types/action-response';
import type { MenuItem } from '../../../drizzle/schema/menu-items';

// --- Per-item validation schema ---

const batchItemSchema = z.object({
  categoryId: z.string().uuid('Invalid category'),
  name: z.string().min(1, 'Item name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  imageUrl: z.string().max(500, 'Image key too long').optional().or(z.literal('')),
  foodType: z.enum(FOOD_TYPES).default('veg'),
  isBestSeller: z.boolean().optional().default(false),
  isSoldOut: z.boolean().optional().default(false),
  isTodaysSpecial: z.boolean().optional().default(false),
});

// --- Action ---

/**
 * Batch-creates multiple menu items in a single DB transaction.
 * Images must already be uploaded to R2 before calling this action.
 * A single publishMenuBackground call is made after all items are saved.
 */
export async function createMenuItemsBatchAction(
  shopId: string,
  rawItems: unknown[],
): Promise<ActionResponse<MenuItem[]>> {
  if (!shopId) return { success: false, error: 'Missing shopId.' };
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { success: false, error: 'No items provided.' };
  }

  const parsed = z.array(batchItemSchema).min(1).max(50).safeParse(rawItems);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    const items = await menuService.createMenuItemsBatch(userId, shopId, parsed.data);
    // ONE publish for the entire batch
    publishService.publishMenuBackground(shopId);
    return { success: true, data: items };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create menu items',
    };
  }
}
