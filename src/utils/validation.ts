import * as yup from 'yup';

// Common validation rules
export const commonValidation = {
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),

  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    )
    .required('Password is required'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),

  phone: yup
    .string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional(),

  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces')
    .required('Name is required'),

  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date (YYYY-MM-DD)')
    .required('Date is required'),

  adults: yup
    .number()
    .min(1, 'At least 1 adult is required')
    .max(10, 'Maximum 10 adults allowed')
    .required('Number of adults is required'),

  children: yup
    .number()
    .min(0, 'Number of children cannot be negative')
    .max(10, 'Maximum 10 children allowed')
    .required('Number of children is required'),

  rooms: yup
    .number()
    .min(1, 'At least 1 room is required')
    .max(10, 'Maximum 10 rooms allowed')
    .required('Number of rooms is required'),
};

// Auth schemas
export const loginSchema = yup.object({
  email: commonValidation.email,
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object({
  firstName: commonValidation.name,
  lastName: commonValidation.name,
  email: commonValidation.email,
  password: commonValidation.password,
  confirmPassword: commonValidation.confirmPassword,
  phone: commonValidation.phone,
});

export const forgotPasswordSchema = yup.object({
  email: commonValidation.email,
});

export const resetPasswordSchema = yup.object({
  password: commonValidation.password,
  confirmPassword: commonValidation.confirmPassword,
});
