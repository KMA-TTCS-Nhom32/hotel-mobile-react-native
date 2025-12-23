import type { TFunction } from 'i18next';
import { z } from 'zod';

import {
  passwordValidation,
  phoneOrEmailValidation,
} from '@/components/forms/utils';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (Vietnamese phone numbers)
const PHONE_REGEX = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/;

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate phone number format (Vietnamese)
 */
export const isValidPhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone.trim());
};

// Login form schema using your validation utilities
export const createLoginSchema = (t: TFunction) =>
  z.object({
    emailOrPhone: phoneOrEmailValidation(t),
    password: passwordValidation(t),
  });

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

// Registration form schema with combined email/phone field
export const createRegisterSchema = (t: TFunction) =>
  z
    .object({
      name: z.string().min(1, { message: t('form.required') }),
      emailOrPhone: z
        .string()
        .min(1, { message: t('form.required') })
        .refine(
          value => {
            // Check if input contains '@' to determine if it's email or phone
            const trimmedValue = value.trim();
            if (trimmedValue.includes('@')) {
              // Validate as email
              return isValidEmail(trimmedValue);
            } else {
              // Validate as phone
              return isValidPhone(trimmedValue);
            }
          },
          {
            message: t('validation.phoneOrEmail'),
          }
        ),
      password: z.string().min(6, { message: t('form.passwordTooShort') }),
      confirmPassword: z.string().min(1, { message: t('form.required') }),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('form.passwordsNotMatch'),
      path: ['confirmPassword'],
    });

export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

// OTP verification schema (register mode - OTP only)
export const otpVerificationSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export type OTPVerificationFormData = z.infer<typeof otpVerificationSchema>;

// Forgot password schema (OTP + new password)
export const createForgotPasswordSchema = (t: TFunction) =>
  z
    .object({
      otp: z.string().length(6, t('form.otpInvalid')),
      newPassword: z.string().min(6, t('form.passwordTooShort')),
      confirmPassword: z.string().min(6, t('form.passwordTooShort')),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: t('form.passwordsNotMatch'),
      path: ['confirmPassword'],
    });

export type ForgotPasswordFormData = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;

// Email-only validation for forgot password initiation
export const createForgotPasswordEmailSchema = (t: TFunction) =>
  z.object({
    email: z.string().email(t('validation.email')).min(1, t('form.required')),
  });

export type ForgotPasswordEmailFormData = z.infer<
  ReturnType<typeof createForgotPasswordEmailSchema>
>;

// Update profile schema
export const createUpdateProfileSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t('form.required')),
    email: z.string().email(t('validation.email')).optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    birth_date: z.string().optional().or(z.literal('')),
  });

export type UpdateProfileFormData = z.infer<
  ReturnType<typeof createUpdateProfileSchema>
>;

// Change password schema
export const createChangePasswordSchema = (t: TFunction) =>
  z
    .object({
      currentPassword: z.string().min(6, t('form.passwordTooShort')),
      newPassword: z.string().min(6, t('form.passwordTooShort')),
      confirmPassword: z.string().min(6, t('form.passwordTooShort')),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: t('form.passwordsNotMatch'),
      path: ['confirmPassword'],
    });

export type ChangePasswordFormData = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;
