export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  HOME: '/(tabs)',
  BOOKINGS: '/(tabs)/bookings',
  OFFERS: '/(tabs)/offers',
  PROMOTIONS: '/(tabs)/promotions',
  ACCOUNT: '/(tabs)/account',
} as const;
