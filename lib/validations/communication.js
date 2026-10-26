import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string('Nom requis')
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères')
    .trim(),
  email: z
    .string('Email requis')
    .email('Format email invalide')
    .toLowerCase()
    .trim(),
  subject: z
    .string('Sujet requis')
    .min(5, 'Minimum 5 caractères')
    .max(100, 'Maximum 100 caractères')
    .trim(),
  message: z
    .string('Message requis')
    .min(10, 'Minimum 10 caractères')
    .max(2000, 'Maximum 2000 caractères')
    .trim(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,}$/, 'Numéro invalide')
    .optional()
    .or(z.literal('')),
});

export const productRequestSchema = z.object({
  productName: z
    .string('Nom du produit requis')
    .min(3, 'Minimum 3 caractères')
    .max(100, 'Maximum 100 caractères')
    .trim(),
  brand: z
    .string()
    .optional(),
  description: z
    .string()
    .max(500, 'Maximum 500 caractères')
    .optional(),
  email: z
    .string('Email requis')
    .email('Format email invalide')
    .toLowerCase()
    .trim(),
});

export const newsletterSchema = z.object({
  email: z
    .string('Email requis')
    .email('Format email invalide')
    .toLowerCase()
    .trim(),
});
