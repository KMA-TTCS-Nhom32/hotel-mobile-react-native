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
  VERIFY_FORGOT_PASSWORD_OTP: '/auth/forgot-password/email/verify',
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
  ROOM_DETAILS: '/room-details',
  ROOM_DETAILS_INFINITE: '/room-details/infinite',

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
