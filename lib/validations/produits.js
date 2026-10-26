import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string('Nom requis')
    .min(3, 'Minimum 3 caractères')
    .max(100, 'Maximum 100 caractères')
    .trim(),
  description: z
    .string('Description requise')
    .min(10, 'Minimum 10 caractères')
    .max(2000, 'Maximum 2000 caractères')
    .trim(),
  price: z
    .number('Prix requis')
    .positive('Prix doit être positif')
    .multipleOf(0.01, 'Maximum 2 décimales'),
  stock: z
    .number('Stock requis')
    .int('Stock doit être un entier')
    .min(0, 'Stock ne peut pas être négatif'),
  category: z
    .string('Catégorie requise')
    .trim(),
  image: z
    .string('Image requise')
    .url('URL d\'image invalide'),
  discount: z
    .number()
    .min(0)
    .max(100)
    .optional(),
});

export const productEditorSchema = productSchema.extend({
  id: z.string().optional(),
});
