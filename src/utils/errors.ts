import type { AxiosError } from 'axios';

import i18n from '@/i18n';

import { showErrorToast } from './toast';

/**
 * Unified error class for the app
 * Provides consistent error format for both server errors and network errors
 */
export class AppError extends Error {
  /** HTTP status code (e.g., 400, 401, 409, 500) */
  status: number;
  /** Raw backend error code (e.g., "userNotFound") */
  code: string;

  constructor(status: number, message: string, code: string = '') {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }

  /**
   * Check if error is a specific status
   */
  is(status: number): boolean {
    return this.status === status;
  }

  /**
   * Check if error is an auth error (401)
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is a conflict error (409)
   */
  isConflict(): boolean {
    return this.status === 409;
  }

  /**
   * Check if error is a network error (0)
   */
  isNetworkError(): boolean {
    return this.status === 0;
  }
}

// Common status codes
export const HttpStatus = {
  NETWORK_ERROR: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Backend error message enums - mapped to i18n translation keys
 * Format: backendErrorCode -> i18n key in errors namespace
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Network errors
  networkError: 'errors.networkError',
  timeout: 'errors.timeout',

  // Common errors
  notFound: 'errors.notFound',
  eitherPhoneOrEmailIsRequired: 'errors.eitherPhoneOrEmailIsRequired',
  emailExisted: 'errors.emailExisted',
  phoneExisted: 'errors.phoneExisted',
  userNotFound: 'errors.userNotFound',
  phoneLengthError: 'errors.phoneLengthError',
  invalidPhoneFormat: 'errors.invalidPhoneFormat',
  nameTooShort: 'errors.nameTooShort',
  nameTooLong: 'errors.nameTooLong',
  invalidAvatarUrl: 'errors.invalidAvatarUrl',
  emptyUpdatePayload: 'errors.emptyUpdatePayload',
  userHasActiveBookings: 'errors.userHasActiveBookings',
  imageNotFound: 'errors.imageNotFound',
  getImageFailed: 'errors.getImageFailed',
  requestFailed: 'errors.requestFailed',

  // Role errors
  roleNotFound: 'errors.roleNotFound',
  cannotBeAdmin: 'errors.cannotBeAdmin',
  cannotBeStaff: 'errors.cannotBeStaff',
  cannotBeCustomer: 'errors.cannotBeCustomer',
  invalidRoleChange: 'errors.invalidRoleChange',

  // Auth errors
  invalidEmailOrPhone: 'errors.invalidEmailOrPhone',
  wrongUsernameOrPassword: 'errors.wrongUsernameOrPassword',
  invalidRefreshToken: 'errors.invalidRefreshToken',
  phoneIsRequired: 'errors.phoneIsRequired',
  emailIsRequired: 'errors.emailIsRequired',
  emailNotVerified: 'errors.emailNotVerified',
  phoneNotVerified: 'errors.phoneNotVerified',
  userAlreadyExists: 'errors.userAlreadyExists',
  sentEmailFailed: 'errors.sentEmailFailed',

  // Image errors
  invalidImageFormat: 'errors.invalidImageFormat',
  invalidImageSize: 'errors.invalidImageSize',
  invalidImageType: 'errors.invalidImageType',
  invalidImageUrl: 'errors.invalidImageUrl',
  imageUploadFailed: 'errors.imageUploadFailed',
  imageDeleteFailed: 'errors.imageDeleteFailed',

  // Room errors
  roomNotFound: 'errors.roomNotFound',

  // Booking errors
  maximumGuestsExceeded: 'errors.maximumGuestsExceeded',
  bookingNotFound: 'errors.bookingNotFound',
};

/**
 * Get translated error message from backend error code
 * Uses i18n.t directly - no need to pass t function
 */
export function getTranslatedErrorMessage(errorCode: string): string {
  const translationKey = ERROR_MESSAGE_MAP[errorCode];

  if (translationKey) {
    const translated = i18n.t(translationKey, { ns: 'common' });
    // If translation exists and is different from key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
  }

  // Fallback: return generic error message
  return i18n.t('errors.generic', { ns: 'common' }) || 'An error occurred';
}

/**
 * Get default error message for status code (fallback when no backend message)
 */
function getDefaultMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Bad request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not found';
    case 409:
      return 'Conflict';
    case 500:
      return 'Server error';
    default:
      return 'Unknown error';
  }
}

/**
 * Transform Axios error to AppError
 * Called in axios response interceptor
 */
export function transformAxiosError(error: AxiosError): AppError {
  // Network error (no response from server)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return new AppError(
        HttpStatus.NETWORK_ERROR,
        'Request timed out',
        'timeout'
      );
    }
    return new AppError(
      HttpStatus.NETWORK_ERROR,
      'Network connection failed',
      'networkError'
    );
  }

  const status = error.response.status;
  const data = error.response.data as { message?: string; status?: number };

  // Get message from server response or use default
  const backendCode = data?.message || '';
  const message = backendCode || getDefaultMessage(status);

  return new AppError(status, message, backendCode);
}

/**
 * Transform Axios error to AppError AND show toast notification
 * Uses i18n.t internally - no need to pass t function
 * Used in API interceptors for automatic error display
 */
export function transformAxiosErrorWithToast(
  error: AxiosError,
  options?: { silent?: boolean }
): AppError {
  const appError = transformAxiosError(error);

  // Don't show toast if silent mode or if it's a 401 (handled separately for auth flow)
  if (!options?.silent && appError.status !== 401) {
    const translatedMessage = getTranslatedErrorMessage(appError.code);
    showErrorToast(translatedMessage);
  }

  return appError;
}

/**
 * Extract AppError from unknown error
 * Use this in catch blocks to safely get AppError
 */
export function getAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
  }

  return new AppError(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'Unknown error occurred'
  );
}
