import { z } from 'zod';

export const createPromotionSchema = z.object({
  shopId: z.string().uuid(),
  type: z.enum(['announcement', 'offer', 'todays_special']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),

  // ── Offer-specific fields ─────────────────────────────────────────────────
  offerType: z.enum(['percentage', 'flat', 'bxgy']).optional(),
  offerValue: z.coerce.number().min(0).optional(),

  // ── Targeting ─────────────────────────────────────────────────────────────
  targetType: z.enum(['all', 'category', 'item']).optional().default('all'),
  targetIds: z.array(z.string().uuid()).optional(),

  // ── Priority ──────────────────────────────────────────────────────────────
  priority: z.coerce.number().int().min(0).optional().default(0),

  // ── Schedule — DATE strings (YYYY-MM-DD) and TIME strings (HH:MM) ─────────
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),

  // ── Banner ────────────────────────────────────────────────────────────────
  /** R2 object key for the optional banner image */
  bannerImage: z.string().max(500, 'Banner key too long').optional(),
});

export const updatePromotionSchema = createPromotionSchema
  .omit({ shopId: true })
  .partial()
  .extend({
    id: z.string().uuid(),
  });

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
