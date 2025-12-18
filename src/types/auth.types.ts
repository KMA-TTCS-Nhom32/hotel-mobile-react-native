/**
 * Authentication related types
 * Matches server DTOs from hotel-server/src/modules/auth
 */

import { AccountIdentifier } from './verification.types';

/**
 * User data for registration (matches CreateUserDto from server)
 */
export interface CreateUserDto {
    email?: string;
    phone?: string;
    password: string;
    name: string;
}

/**
 * Registration request DTO (matches RegisterDto from server)
 */
export interface RegisterDto {
    data: CreateUserDto;
    accountIdentifier: AccountIdentifier;
}

/**
 * Registration response DTO (matches RegisterResponseDto from server)
 */
export interface RegisterResponseDto {
    email?: string;
    phone?: string;
    id: string;
    identifier_type: AccountIdentifier;
}
