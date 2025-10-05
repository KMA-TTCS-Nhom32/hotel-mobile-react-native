import { TFunction } from 'i18next';
import { z } from 'zod';

import {
  passwordValidation,
  phoneOrEmailValidation,
} from '@/components/forms/utils';

// Login form schema using your validation utilities
export const createLoginSchema = (t: TFunction) =>
  z.object({
    emailOrPhone: phoneOrEmailValidation(t),
    password: passwordValidation(t),
  });

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
