import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email requis' })
    .email('Format email invalide')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Mot de passe requis' })
    .min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Nom requis' })
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères')
    .trim(),
  email: z
    .string({ required_error: 'Email requis' })
    .email('Format email invalide')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Mot de passe requis' })
    .min(6, 'Minimum 6 caractères'),
  confirmPassword: z.string({ required_error: 'Confirmation requise' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères')
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email requis' })
    .email('Format email invalide')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'Code de réinitialisation requis' })
    .min(4, 'Code invalide'),
  password: z
    .string({ required_error: 'Nouveau mot de passe requis' })
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Minimum 1 majuscule')
    .regex(/[0-9]/, 'Minimum 1 chiffre'),
  confirmPassword: z.string({ required_error: 'Confirmation requise' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const otpSchema = z.object({
  code: z
    .string({ required_error: 'Code OTP requis' })
    .length(6, 'Le code doit comporter exactement 6 chiffres')
    .regex(/^[0-9]+$/, 'Le code doit être uniquement numérique'),
});
