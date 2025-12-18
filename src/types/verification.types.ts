/**
 * Verification and OTP related types
 * Matches server DTOs from hotel-server/src/modules/verification
 */

export enum AccountIdentifier {
    EMAIL = 'EMAIL',
    PHONE = 'PHONE',
}

export interface VerifyEmailOTPDto {
    email: string;
    code: string;
}

export interface VerifyCodeDto {
    userId: string;
    code: string;
    type: AccountIdentifier;
}

export interface VerifyCodeResponseDto {
    success: boolean;
    userId: string;
    type: AccountIdentifier;
}
