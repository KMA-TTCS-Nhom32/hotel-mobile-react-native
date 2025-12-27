import type {
  ChangePasswordDto,
  InitiateForgotPasswordEmailDto,
  LoginDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  RegisterDto,
  RegisterResponseDto,
  ResetPasswordWithOTPEmailDto,
  ResponseWithMessage,
  UpdateProfileDto,
  User,
  VerifyEmailDto,
} from '@ahomevilla-hotel/node-sdk';

import {
  ENDPOINTS,
  privateRequest,
  publicRequest,
  TokenManager,
} from '@/config/api';

import type { IAuthService } from './IAuthService';

/**
 * Authentication service implementation
 * Errors are automatically transformed to AppError by axios interceptors
 */
export class AuthService implements IAuthService {
  /**
   * Login with email/phone and password
   */
  login = async (credentials: LoginDto): Promise<LoginResponseDto> => {
    const response = await publicRequest.post<LoginResponseDto>(
      ENDPOINTS.LOGIN,
      credentials
    );

    // Store tokens using TokenManager
    await TokenManager.setTokens(response.data);

    return response.data;
  };

  /**
   * Register a new user
   */
  register = async (payload: RegisterDto): Promise<RegisterResponseDto> => {
    const response = await publicRequest.post<RegisterResponseDto>(
      ENDPOINTS.REGISTER,
      payload
    );
    return response.data;
  };

  /**
   * Refresh access token using refresh token
   */
  refreshToken = async (): Promise<RefreshTokenResponseDto> => {
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
  };

  /**
   * Logout user and clear session
   */
  logout = async (): Promise<void> => {
    try {
      await privateRequest.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with local cleanup even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      await this.clearSession();
    }
  };

  /**
   * Get user profile information
   */
  getProfile = async (): Promise<User> => {
    const response = await privateRequest.get<User>(ENDPOINTS.PROFILE);
    return response.data;
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
    await TokenManager.clearTokens();
  };

  /**
   * Update user profile
   */
  updateProfile = async (payload: UpdateProfileDto): Promise<User> => {
    const response = await privateRequest.patch<User>(
      ENDPOINTS.PROFILE,
      payload
    );
    return response.data;
  };

  /**
   * Change current user's password
   */
  changePassword = async (
    payload: ChangePasswordDto
  ): Promise<ResponseWithMessage> => {
    const response = await privateRequest.post<ResponseWithMessage>(
      ENDPOINTS.CHANGE_PASSWORD,
      payload
    );
    return response.data;
  };

  /**
   * Verify email with OTP code (after registration)
   */
  verifyEmail = async (
    payload: VerifyEmailDto
  ): Promise<ResponseWithMessage> => {
    console.log('[AuthService] Gọi verifyEmail (xác thực đăng ký):', {
      userId: payload.userId,
      code: payload.code.substring(0, 2) + '****',
    });
    try {
      const response = await publicRequest.post<ResponseWithMessage>(
        ENDPOINTS.VERIFY_EMAIL,
        payload
      );
      console.log(
        '[AuthService] Phản hồi verifyEmail thành công:',
        response.data
      );
      return response.data;
    } catch (error) {
      console.error('[AuthService] Lỗi verifyEmail:', error);
      throw error;
    }
  };

  /**
   * Initiate forgot password - sends OTP to email
   */
  initiateForgotPassword = async (
    payload: InitiateForgotPasswordEmailDto
  ): Promise<ResponseWithMessage> => {
    console.log('[AuthService] Gọi initiateForgotPassword:', {
      email: payload.email,
    });
    const response = await publicRequest.post<ResponseWithMessage>(
      ENDPOINTS.INITIATE_EMAIL,
      payload
    );
    console.log(
      '[AuthService] Phản hồi initiateForgotPassword:',
      response.data
    );
    return response.data;
  };

  /**
   * Verify OTP code for forgot password (separate step)
   */
  verifyForgotPasswordOTP = async (
    email: string,
    code: string
  ): Promise<{ success: boolean; message: string; userId: string }> => {
    console.log('[AuthService] Gọi verifyForgotPasswordOTP:', {
      email,
      code: code.substring(0, 2) + '****',
    });
    const response = await publicRequest.post<{
      success: boolean;
      message: string;
      userId: string;
    }>(ENDPOINTS.VERIFY_FORGOT_PASSWORD_OTP, { email, code });
    console.log(
      '[AuthService] Phản hồi verifyForgotPasswordOTP:',
      response.data
    );
    return response.data;
  };

  /**
   * Reset password using OTP
   */
  resetPasswordWithOTP = async (
    payload: ResetPasswordWithOTPEmailDto
  ): Promise<ResponseWithMessage> => {
    console.log('[AuthService] Gọi resetPasswordWithOTP:', {
      email: payload.email,
    });
    const response = await publicRequest.post<ResponseWithMessage>(
      ENDPOINTS.RESET_PASSWORD,
      payload
    );
    console.log('[AuthService] Phản hồi resetPasswordWithOTP:', response.data);
    return response.data;
  };
}

// Export singleton instance
export const authService = new AuthService();
