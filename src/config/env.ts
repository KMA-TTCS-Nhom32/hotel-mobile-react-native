// Environment configuration
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.ahomevilla.com',
  API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
  APP_NAME: 'AHomeVilla',
  APP_VERSION: '1.0.0',
  COMPANY_NAME: 'AHomeVilla Hotels',
};

export const LOCAL_STORAGE_KEY =
  process.env.LOCAL_STORAGE_KEY || '@AHOMEPLACE_HOTEL_CMS';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
