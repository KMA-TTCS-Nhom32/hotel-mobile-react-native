/**
 * Payment Constants
 * Constants for payment methods and options
 */

import { CreateBookingOnlineDtoPaymentMethodEnum } from '@ahomevilla-hotel/node-sdk';

import type { PaymentOption } from '@/types/payment';

/**
 * Payment logo images map
 * Maps payment method to actual require() image source
 */
const PAYMENT_LOGOS = {
  MOMO: require('@/assets/images/logos/payments/momo.png'),
  VIET_QR: require('@/assets/images/logos/payments/vietqr.png'),
} as const;

/**
 * Available payment options
 * Note: label and description are i18n keys, not actual text
 * They should be translated using t() in components
 */
export const PAYMENT_OPTIONS: PaymentOption[] = [
  // Pay at Hotel - direct method (no sub-options)
  {
    id: 'pay-at-hotel',
    method: CreateBookingOnlineDtoPaymentMethodEnum.Cash,
    category: 'PAY_AT_HOTEL',
    label: 'payAtHotel', // i18n key
    description: 'payAtHotelDescription', // i18n key
  },

  // Online Checkout
  {
    id: 'momo',
    method: CreateBookingOnlineDtoPaymentMethodEnum.Momo,
    category: 'ONLINE_CHECKOUT',
    label: 'momo', // i18n key
    description: 'momoDescription', // i18n key
    logo: PAYMENT_LOGOS.MOMO,
  },
  {
    id: 'vietqr',
    method: CreateBookingOnlineDtoPaymentMethodEnum.VietQr,
    category: 'ONLINE_CHECKOUT',
    label: 'vietqr', // i18n key
    description: 'vietqrDescription', // i18n key
    logo: PAYMENT_LOGOS.VIET_QR,
  },
];

/**
 * Get payment options by category
 */
export const getPaymentOptionsByCategory = (
  category: 'PAY_AT_HOTEL' | 'ONLINE_CHECKOUT'
) => {
  return PAYMENT_OPTIONS.filter(option => option.category === category);
};

/**
 * Get payment option by method
 */
export const getPaymentOptionByMethod = (method: string) => {
  return PAYMENT_OPTIONS.find(option => option.method === method);
};
