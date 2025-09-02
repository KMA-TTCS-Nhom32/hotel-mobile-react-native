import type {
  LoginResponseDto,
  RefreshTokenResponseDto,
} from '@ahomevilla-hotel/node-sdk';
import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

import { ENV, IS_PRODUCTION } from '@/config';
import { Storage } from '@/utils/storage';

import { ENDPOINTS } from './endpoints';

// Storage keys for token management
const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ACCESS_TOKEN_EXPIRES: 'access_token_expires',
} as const;

// Token management utilities
class TokenManager {
  private static isRefreshing = false;
  private static failedQueue: {
    resolve: (value: string | null) => void;
    reject: (error: Error) => void;
  }[] = [];

  /**
   * Store authentication tokens securely
   */
  static async setTokens(
    tokenData: LoginResponseDto | RefreshTokenResponseDto
  ): Promise<void> {
    try {
      await Promise.all([
        Storage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokenData.accessToken),
        Storage.setItem(
          TOKEN_STORAGE_KEYS.REFRESH_TOKEN,
          tokenData.refreshToken
        ),
        Storage.setItem(
          TOKEN_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES,
          tokenData.accessTokenExpires
        ),
      ]);
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Token storage failed');
    }
  }

  /**
   * Get stored access token
   */
  static async getAccessToken(): Promise<string | null> {
    return await Storage.getItem<string>(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get stored refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    return await Storage.getItem<string>(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Get access token expiration timestamp
   */
  static async getTokenExpiry(): Promise<number | null> {
    return await Storage.getItem<number>(
      TOKEN_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES
    );
  }

  /**
   * Check if access token is expired or will expire soon (within 1 minute)
   */
  static async isTokenExpired(): Promise<boolean> {
    const expiry = await this.getTokenExpiry();
    if (!expiry) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const buffer = 60; // 1 minute buffer
    return currentTime >= expiry - buffer;
  }

  /**
   * Clear all stored tokens
   */
  static async clearTokens(): Promise<void> {
    await Storage.removeItems([
      TOKEN_STORAGE_KEYS.ACCESS_TOKEN,
      TOKEN_STORAGE_KEYS.REFRESH_TOKEN,
      TOKEN_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES,
    ]);
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // If already refreshing, queue the request
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await this.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Create a direct axios request to avoid circular dependency
      // Since this is called from within the private request interceptor
      const response = await axios.post<RefreshTokenResponseDto>(
        `${ENV.API_URL}${ENDPOINTS.REFRESH}`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`, // Use current token for refresh
          },
          timeout: IS_PRODUCTION ? 15000 : 30000,
        }
      );

      const newTokenData = response.data;
      await this.setTokens(newTokenData);

      // Process queued requests
      this.processQueue(null, newTokenData.accessToken);

      return newTokenData.accessToken;
    } catch (error) {
      // Process queued requests with error
      const errorInstance =
        error instanceof Error ? error : new Error('Token refresh failed');
      this.processQueue(errorInstance, null);

      // Clear tokens if refresh fails
      await this.clearTokens();

      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private static processQueue(error: Error | null, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }
}

// Create private axios instance
const privateRequest = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: IS_PRODUCTION ? 15000 : 30000,
});

// Request interceptor to add auth token
privateRequest.interceptors.request.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (config: any) => {
    try {
      // Check if token is expired and refresh if needed
      const isExpired = await TokenManager.isTokenExpired();

      if (isExpired) {
        const newToken = await TokenManager.refreshToken();
        if (newToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      } else {
        const accessToken = await TokenManager.getAccessToken();
        if (accessToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    } catch (error) {
      console.error('Failed to set auth token:', error);
      // Continue with request even if token setting fails
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
privateRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalRequest = error.config as any & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await TokenManager.refreshToken();

        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return privateRequest(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Redirect to login or emit logout event
        await TokenManager.clearTokens();

        // You can emit an event here to notify the app to redirect to login
        // EventEmitter.emit('auth:logout');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export the configured instance and utilities
export default privateRequest;
export { TokenManager };

// Export types for convenience
export type { LoginResponseDto, RefreshTokenResponseDto };
