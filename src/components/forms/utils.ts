import { TFunction } from 'i18next';
import { z } from 'zod';

// Utility functions for common validation schemas

/**
 * Password validation: at least 8 characters, one uppercase, one lowercase, one number, one special character
 */
export const passwordValidation = (t: TFunction) =>
  z
    .string()
    .min(8, { message: t('validation.password') })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
      message: t('validation.password'),
    });

/**
 * Email validation
 */
export const emailValidation = (t: TFunction) =>
  z.email({ message: t('validation.email') });

/**
 * phone number validation (simple regex for demonstration)
 */
export const phoneValidation = (t: TFunction) =>
  z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: t('validation.phone') });

/**
 * Phone or Email validation (union of phone and email)
 */
export const phoneOrEmailValidation = (t: TFunction) =>
  z.union([emailValidation(t), phoneValidation(t)], {
    message: t('validation.phoneOrEmail'),
  });
