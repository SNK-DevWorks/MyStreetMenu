import { z } from 'zod';

export const FOOD_TYPES = ['veg', 'non-veg', 'egg'] as const;
export type FoodType = (typeof FOOD_TYPES)[number];

export const createMenuItemSchema = z.object({
  shopId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1, 'Item name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  foodType: z.enum(FOOD_TYPES).default('veg'),
  isBestSeller: z.boolean().optional().default(false),
  isSoldOut: z.boolean().optional().default(false),
  isTodaysSpecial: z.boolean().optional().default(false),
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

