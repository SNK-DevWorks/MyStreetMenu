import { z } from 'zod';

export const createShopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  foodType: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  coverImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  openingHours: z.record(z.string(), z.string()).optional(),
  theme: z.string().optional(),
  menuVisibility: z.enum(['public', 'private']).optional(),
});

export const updateShopSchema = createShopSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
