import { z } from 'zod';

export const addressSchema = z.object({
  label: z
    .string('Label requis')
    .min(3, 'Minimum 3 caractères')
    .max(50, 'Maximum 50 caractères')
    .trim(),
  street: z
    .string('Rue requise')
    .min(5, 'Minimum 5 caractères')
    .trim(),
  city: z
    .string('Ville requise')
    .min(2, 'Minimum 2 caractères')
    .trim(),
  zipCode: z
    .string('Code postal requis')
    .regex(/^[0-9]{3,}$/, 'Code postal invalide'),
  country: z
    .string('Pays requis')
    .trim(),
  isDefault: z.boolean().optional(),
});

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
        price: z.number().positive(),
      })
    )
    .min(1, 'Au moins 1 article'),
  shippingAddressId: z.string('Adresse de livraison requise'),
  paymentMethod: z.enum(['card', 'transfer', 'cash']),
  notes: z.string().max(500, 'Maximum 500 caractères').optional(),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z
    .number()
    .int()
    .min(1, 'Minimum 1 étoile')
    .max(5, 'Maximum 5 étoiles'),
  title: z
    .string()
    .min(3, 'Minimum 3 caractères')
    .max(100, 'Maximum 100 caractères')
    .trim(),
  comment: z
    .string()
    .min(10, 'Minimum 10 caractères')
    .max(1000, 'Maximum 1000 caractères')
    .trim()
    .optional(),
});
