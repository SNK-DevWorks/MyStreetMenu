import { z } from 'zod';

export const createPromotionSchema = z.object({
  shopId: z.string().uuid(),
  type: z.enum(['announcement', 'offer', 'todays_special']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updatePromotionSchema = createPromotionSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
