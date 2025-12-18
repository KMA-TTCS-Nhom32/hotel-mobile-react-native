export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  CHANGE_PASSWORD: '/auth/change-password',
  INITIATE_EMAIL: '/auth/forgot-password/email/initiate',
  VERIFY_EMAIL_OTP: '/verification/verify-email-otp',
  // Note: Resend OTP uses the same registration endpoint
  RESET_PASSWORD: '/auth/forgot-password/email/reset',
  GET_USER: '/auth/profile',
  GET_MYBOOKING: '/booking/my-bookings',
  CANCEL_BOOKING: (bookingId: string) => `/booking/cancel/${bookingId}`,
  //User
  //Province
  PROVINCE: '/provinces',

  // Branch
  BRANCHES: '/branches',
  GET_LATEST_BRANCHES: '/branches/latest',

  //Amemnity
  AMENITY: '/amenities',

  // Room-detail
  ROOM_DETAIL: '/room-details',

  // Booking
  BOOKING: '/booking',

  // Payment
  CREATE_PAYMENT: '/payos/payment-request',
  CANCEL_PAYMENT: '/payos/cancel-payment',
  GET_PAYMENT_STATUS: '/payos/payment-status/:paymentLinkId',
  GET_BANK_LIST:
    process.env.EXPO_PUBLIC_VIETQR_BANK_LIST ||
    'https://api.vietqr.io/v2/banks',
};
