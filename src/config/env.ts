// Environment configuration
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.ahomevilla.com',
  API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
  APP_NAME: 'AHomeVilla',
  APP_VERSION: '1.0.0',
  COMPANY_NAME: 'AHomeVilla Hotels',
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  HOTELS: {
    LIST: '/hotels',
    DETAILS: '/hotels/:id',
    SEARCH: '/hotels/search',
    NEARBY: '/hotels/nearby',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile',
    BOOKINGS: '/user/bookings',
    FAVORITES: '/user/favorites',
  },
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@ahomevilla_access_token',
  REFRESH_TOKEN: '@ahomevilla_refresh_token',
  USER_DATA: '@ahomevilla_user_data',
  ONBOARDING_COMPLETED: '@ahomevilla_onboarding_completed',
  SEARCH_HISTORY: '@ahomevilla_search_history',
  FAVORITES: '@ahomevilla_favorites',
} as const;
