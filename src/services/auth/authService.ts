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

export class AuthService implements IAuthService {
  login = async (credentials: LoginDto): Promise<LoginResponseDto> => {
    const response = await publicRequest.post<LoginResponseDto>(
      ENDPOINTS.LOGIN,
      credentials
    );
    await TokenManager.setTokens(response.data);

    return response.data;
  };

  register = async (payload: RegisterDto): Promise<RegisterResponseDto> => {
    const response = await publicRequest.post<RegisterResponseDto>(
      ENDPOINTS.REGISTER,
      payload
    );
    return response.data;
  };

  refreshToken = async (): Promise<RefreshTokenResponseDto> => {
    const refreshToken = await TokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await privateRequest.post<RefreshTokenResponseDto>(
      ENDPOINTS.REFRESH,
      { refreshToken }
    );

    await TokenManager.setTokens(response.data);

    return response.data;
  };

  logout = async (): Promise<void> => {
    try {
      await privateRequest.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await this.clearSession();
    }
  };

  getProfile = async (): Promise<User> => {
    const response = await privateRequest.get<User>(ENDPOINTS.PROFILE);
    return response.data;
  };

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

  clearSession = async (): Promise<void> => {
    await TokenManager.clearTokens();
  };

  updateProfile = async (payload: UpdateProfileDto): Promise<User> => {
    const response = await privateRequest.patch<User>(
      ENDPOINTS.PROFILE,
      payload
    );
    return response.data;
  };
  changePassword = async (
    payload: ChangePasswordDto
  ): Promise<ResponseWithMessage> => {
    const response = await privateRequest.post<ResponseWithMessage>(
      ENDPOINTS.CHANGE_PASSWORD,
      payload
    );
    return response.data;
  };

  verifyEmail = async (
    payload: VerifyEmailDto
  ): Promise<ResponseWithMessage> => {
    try {
      const response = await publicRequest.post<ResponseWithMessage>(
        ENDPOINTS.VERIFY_EMAIL,
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  initiateForgotPassword = async (
    payload: InitiateForgotPasswordEmailDto
  ): Promise<ResponseWithMessage> => {
    const response = await publicRequest.post<ResponseWithMessage>(
      ENDPOINTS.INITIATE_EMAIL,
      payload
    );
    return response.data;
  };

  verifyForgotPasswordOTP = async (
    email: string,
    code: string
  ): Promise<{ success: boolean; message: string; userId: string }> => {
    const response = await publicRequest.post<{
      success: boolean;
      message: string;
      userId: string;
    }>(ENDPOINTS.VERIFY_FORGOT_PASSWORD_OTP, { email, code });
    return response.data;
  };

  resetPasswordWithOTP = async (
    payload: ResetPasswordWithOTPEmailDto
  ): Promise<ResponseWithMessage> => {
    const response = await publicRequest.post<ResponseWithMessage>(
      ENDPOINTS.RESET_PASSWORD,
      payload
    );
    return response.data;
  };
}
export const authService = new AuthService();
