import type { AxiosError } from 'axios';
import type { TFunction } from 'i18next';

/**
 * Unified error class for the app
 * Provides consistent error format for both server errors and network errors
 */
export class AppError extends Error {
  /** HTTP status code (e.g., 400, 401, 409, 500) */
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
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
 * Transform Axios error to AppError
 * Called in axios response interceptor
 */
export function transformAxiosError(error: AxiosError): AppError {
  // Network error (no response from server)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return new AppError(HttpStatus.NETWORK_ERROR, 'Request timed out');
    }
    return new AppError(HttpStatus.NETWORK_ERROR, 'Network connection failed');
  }

  const status = error.response.status;
  const data = error.response.data as { message?: string; status?: number };

  // Get message from server response or use default
  const message = data?.message || getDefaultMessage(status);

  return new AppError(status, message);
}

/**
 * Get default error message for status code
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

/**
 * Map backend auth error messages to i18n translation keys
 */
export const getAuthErrorMessage = (
  errorMessage: string,
  t: TFunction
): string => {
  const errorMap: Record<string, string> = {
    invalidEmailOrPhone: t('errors.invalidEmailOrPhone'),
    wrongUsernameOrPassword: t('errors.wrongUsernameOrPassword'),
    invalidRefreshToken: t('errors.invalidRefreshToken'),
    phoneIsRequired: t('errors.phoneIsRequired'),
    emailIsRequired: t('errors.emailIsRequired'),
    emailNotVerified: t('errors.emailNotVerified'),
    phoneNotVerified: t('errors.phoneNotVerified'),
    userAlreadyExists: t('errors.userAlreadyExists'),
    sentEmailFailed: t('errors.sentEmailFailed'),
  };

  return errorMap[errorMessage] || errorMessage || t('errors.generic');
};
