import type {
  LoginDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
} from '@ahomevilla-hotel/node-sdk';

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
}
