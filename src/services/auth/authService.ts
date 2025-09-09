import type {
  LoginDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  User,
} from '@ahomevilla-hotel/node-sdk';

import {
  publicRequest,
  privateRequest,
  TokenManager,
  ENDPOINTS,
} from '@/config/api';

import type { IAuthService } from './IAuthService';

/**
 * Minimal authentication service implementation
 * Handles only login, refresh, and logout endpoints
 */
export class AuthService implements IAuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginDto): Promise<LoginResponseDto> {
    try {
      const response = await publicRequest.post<LoginResponseDto>(
        ENDPOINTS.LOGIN,
        credentials
      );

      // Store tokens using TokenManager
      await TokenManager.setTokens(response.data);

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw this.handleError(error, 'Login failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<RefreshTokenResponseDto> {
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
      console.error('Token refresh failed:', error);
      await this.clearSession();
      throw this.handleError(error, 'Token refresh failed');
    }
  }

  /**
   * Logout user and clear session
   * No response body, success/failure based on status code
   */
  async logout(): Promise<void> {
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
  }

  /**
   * Get user profile information
   */
  async getProfile(): Promise<User> {
    try {
      const response = await privateRequest.get<User>(ENDPOINTS.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw this.handleError(error, 'Failed to fetch user profile');
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await TokenManager.getAccessToken();
      const isExpired = await TokenManager.isTokenExpired();

      return !!accessToken && !isExpired;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }

  /**
   * Clear local session data
   */
  async clearSession(): Promise<void> {
    try {
      await TokenManager.clearTokens();
    } catch (error) {
      console.error('Failed to clear session:', error);
      throw this.handleError(error, 'Failed to clear session');
    }
  }

  /**
   * Handle and standardize errors
   */
  private handleError(error: unknown, defaultMessage: string): Error {
    if (error instanceof Error) {
      return error;
    }

    // Handle Axios errors
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as {
        response?: {
          status: number;
          data?: { message?: string };
        };
      };

      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      switch (status) {
        case 401:
          return new Error(message || 'Invalid credentials');
        case 403:
          return new Error(message || 'Access denied');
        case 429:
          return new Error(
            message || 'Too many requests. Please try again later'
          );
        case 500:
          return new Error(message || 'Server error. Please try again later');
        default:
          return new Error(message || defaultMessage);
      }
    }

    return new Error(defaultMessage);
  }
}

// Export singleton instance
export const authService = new AuthService();
