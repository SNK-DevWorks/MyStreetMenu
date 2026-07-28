import { z } from 'zod';

export const createCategorySchema = z.object({
  shopId: z.string().uuid(),
  name: z.string().min(1, 'Category name is required'),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Category name is required').optional(),
  sortOrder: z.number().int().optional(),
});

export const reorderCategoriesSchema = z.object({
  shopId: z.string().uuid(),
  categoryIds: z.array(z.string().uuid()),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
