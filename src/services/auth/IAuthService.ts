import type {
  LoginDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  User,
} from '@ahomevilla-hotel/node-sdk';

import type {
  CreateUserDto,
  RegisterResponseDto,
} from '@/types/auth.types';
import type { VerifyCodeResponseDto } from '@/types/verification.types';

/**
 * Minimal authentication service interface
 * Only includes endpoints we know about from the backend
 */
export interface IAuthService {
  /**
   * Login with email and password
   * Returns access token, refresh token, and expiration
   */
  login(credentials: LoginDto): Promise<LoginResponseDto>;

  /**
   * Refresh access token using refresh token
   * Returns new access token, refresh token, and expiration
   */
  refreshToken(): Promise<RefreshTokenResponseDto>;

  /**
   * Logout user and clear session
   * No response body, success/failure based on status code
   */
  logout(): Promise<void>;

  /**
   * Check if user is currently authenticated
   * Helper method for auth state management
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Clear local session data
   * Helper method for cleanup
   */
  clearSession(): Promise<void>;

  /**
   * Get current user profile
   */
  getProfile(): Promise<User>;

  /**
   * Register new user with email
   * Sends OTP to email for verification
   */
  register(data: CreateUserDto): Promise<RegisterResponseDto>;

  /**
   * Verify email OTP code
   * Activates the user account
   */
  verifyEmailOTP(email: string, code: string): Promise<VerifyCodeResponseDto>;

  /**
   * Resend OTP to email
   * Re-sends verification code
   */
  resendOTP(email: string): Promise<void>;

  /**
   * Initiate forgot password process
   * Sends OTP to email for password reset
   */
  initiateForgotPassword(email: string): Promise<void>;

  /**
   * Reset password with OTP
   * Verifies OTP and updates password
   */
  resetPasswordWithOTP(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void>;
}

