import type {
  LoginDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  User,
} from '@ahomevilla-hotel/node-sdk';

import {
  ENDPOINTS,
  privateRequest,
  publicRequest,
  TokenManager,
} from '@/config/api';
import { handleServiceError } from '@/utils/errors';

import type { IAuthService } from './IAuthService';

/**
 * Minimal authentication service implementation
 * Handles only login, refresh, and logout endpoints
 */
export class AuthService implements IAuthService {
  /**
   * Login with email and password
   */
  login = async (credentials: LoginDto): Promise<LoginResponseDto> => {
    try {
      const response = await publicRequest.post<LoginResponseDto>(
        ENDPOINTS.LOGIN,
        credentials
      );

      // Store tokens using TokenManager
      await TokenManager.setTokens(response.data);

      return response.data;
    } catch (error) {
      throw handleServiceError(error, 'Login failed');
    }
  };

  /**
   * Refresh access token using refresh token
   */
  refreshToken = async (): Promise<RefreshTokenResponseDto> => {
    try {
      const refreshToken = await TokenManager.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await privateRequest.post<RefreshTokenResponseDto>(
        ENDPOINTS.REFRESH,
        { refreshToken }
      );

      // Store new tokens
      await TokenManager.setTokens(response.data);

      return response.data;
    } catch (error) {
      try {
        await this.clearSession();
      } catch (error) {
        console.error('Failed to clear session:', error);
      }
      throw handleServiceError(error, 'Token refresh failed');
    }
  };

  /**
   * Logout user and clear session
   * No response body, success/failure based on status code
   */
  logout = async (): Promise<void> => {
    try {
      // Call logout endpoint (no response body expected)
      await privateRequest.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with local cleanup even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local session
      await this.clearSession();
    }
  };

  /**
   * Get user profile information
   */
  getProfile = async (): Promise<User> => {
    try {
      const response = await privateRequest.get<User>(ENDPOINTS.PROFILE);
      return response.data;
    } catch (error) {
      throw handleServiceError(error, 'Failed to fetch user profile');
    }
  };

  /**
   * Register new user with email
   * Sends OTP to email for verification
   */
  register = async (
    data: import('@/types/auth.types').CreateUserDto,
  ): Promise<import('@/types/auth.types').RegisterResponseDto> => {
    try {
      const registerDto: import('@/types/auth.types').RegisterDto = {
        data,
        accountIdentifier: 'EMAIL' as any, // AccountIdentifier.EMAIL
      };

      const response = await publicRequest.post<
        import('@/types/auth.types').RegisterResponseDto
      >(ENDPOINTS.REGISTER, registerDto);

      return response.data;
    } catch (error) {
      throw handleServiceError(error, 'Registration failed');
    }
  };

  /**
   * Verify email OTP code
   * Activates the user account
   */
  verifyEmailOTP = async (
    email: string,
    code: string,
  ): Promise<import('@/types/verification.types').VerifyCodeResponseDto> => {
    try {
      const verifyDto: import('@/types/verification.types').VerifyEmailOTPDto =
      {
        email,
        code,
      };

      const response = await publicRequest.post<
        import('@/types/verification.types').VerifyCodeResponseDto
      >(ENDPOINTS.VERIFY_EMAIL_OTP, verifyDto);

      return response.data;
    } catch (error) {
      throw handleServiceError(error, 'OTP verification failed');
    }
  };

  /**
   * Resend OTP to email
   * Re-sends verification code by re-registering (server handles existing users)
   */
  resendOTP = async (email: string): Promise<void> => {
    try {
      // Server will send new OTP to existing email
      // We need to use the initiate forgot password endpoint for resend
      await publicRequest.post(ENDPOINTS.INITIATE_EMAIL, { email });
    } catch (error) {
      throw handleServiceError(error, 'Failed to resend OTP');
    }
  };

  /**
   * Initiate forgot password process
   * Sends OTP to email for password reset
   */
  initiateForgotPassword = async (email: string): Promise<void> => {
    try {
      await publicRequest.post(ENDPOINTS.INITIATE_EMAIL, { email });
    } catch (error) {
      throw handleServiceError(error, 'Không thể gửi mã OTP');
    }
  };

  /**
   * Reset password with OTP
   * Verifies OTP and updates password
   */
  resetPasswordWithOTP = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await publicRequest.post(ENDPOINTS.RESET_PASSWORD, {
        email,
        code,
        newPassword,
      });
    } catch (error) {
      throw handleServiceError(error, 'Không thể đặt lại mật khẩu');
    }
  };

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated = async (): Promise<boolean> => {
    try {
      const accessToken = await TokenManager.getAccessToken();
      const isExpired = await TokenManager.isTokenExpired();

      return !!accessToken && !isExpired;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  };

  /**
   * Clear local session data
   */
  clearSession = async (): Promise<void> => {
    try {
      await TokenManager.clearTokens();
    } catch (error) {
      throw handleServiceError(error, 'Failed to clear session');
    }
  };
}

// Export singleton instance
export const authService = new AuthService();

