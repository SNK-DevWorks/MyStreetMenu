import { z } from 'zod';

export const createMenuItemSchema = z.object({
  shopId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  isBestSeller: z.boolean().optional(),
  isSoldOut: z.boolean().optional(),
  isTodaysSpecial: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial().extend({
  id: z.string().uuid(),
});

export const toggleSoldOutSchema = z.object({
  id: z.string().uuid(),
  isSoldOut: z.boolean(),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type ToggleSoldOutInput = z.infer<typeof toggleSoldOutSchema>;
