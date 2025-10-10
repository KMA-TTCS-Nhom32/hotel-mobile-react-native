/**
 * Payment Types
 * Types for payment method selection and booking creation
 */

import { CreateBookingOnlineDtoPaymentMethodEnum } from '@ahomevilla-hotel/node-sdk';

/**
 * Payment method types from backend
 */
export type PaymentMethod =
  | 'CASH'
  | 'BANKING'
  | 'ZALOPAY'
  | 'MOMO'
  | 'VN_PAY'
  | 'VIET_QR';

/**
 * Payment option category
 */
export type PaymentCategory = 'PAY_AT_HOTEL' | 'ONLINE_CHECKOUT';

/**
 * Payment option interface
 */
export interface PaymentOption {
  id: string;
  method: CreateBookingOnlineDtoPaymentMethodEnum;
  category: PaymentCategory;
  label: string;
  description?: string;
  logo?: number; // require() returns a number for local assets
}

/**
 * Guest count data
 */
export interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}

/**
 * Booking form data (matches CreateBookingOnlineDto)
 */
export interface BookingFormData {
  // Room and booking details
  detailId: string;
  type: 'HOURLY' | 'NIGHTLY' | 'DAILY';
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;

  // Guest information
  number_of_guests: number;
  adults: number;
  children: number;
  infants: number;

  // Optional fields
  name?: string;
  phone?: string;
  special_requests?: string;
  promotion_code?: string;
  payment_method?: PaymentMethod;
  is_business_trip?: boolean;
}
