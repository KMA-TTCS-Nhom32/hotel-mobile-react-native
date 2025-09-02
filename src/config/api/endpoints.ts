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
  VERIFY_CODE: '/verification/verify-email-otp',
  RESET_PASSWORD: '/auth/forgot-password/email/reset',
  GET_USER: '/auth/profile',
  GET_MYBOOKING: '/booking/my-bookings',
  CANCEL_BOOKING: '/booking/cancel',
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
};
