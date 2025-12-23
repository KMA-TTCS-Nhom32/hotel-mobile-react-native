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

  register(payload: RegisterDto): Promise<RegisterResponseDto>;

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

  getProfile(): Promise<User>;

  updateProfile(payload: UpdateProfileDto): Promise<User>;

  /**
   * Change current user's password
   */
  changePassword(payload: ChangePasswordDto): Promise<ResponseWithMessage>;

  /**
   * Verify email with OTP code (after registration)
   */
  verifyEmail(payload: VerifyEmailDto): Promise<ResponseWithMessage>;

  /**
   * Initiate forgot password - sends OTP to email
   */
  initiateForgotPassword(
    payload: InitiateForgotPasswordEmailDto
  ): Promise<ResponseWithMessage>;

  /**
   * Reset password using OTP
   */
  resetPasswordWithOTP(
    payload: ResetPasswordWithOTPEmailDto
  ): Promise<ResponseWithMessage>;
}
