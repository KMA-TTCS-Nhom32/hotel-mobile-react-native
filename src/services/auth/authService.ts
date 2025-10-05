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
      await this.clearSession();
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
