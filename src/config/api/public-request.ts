import axios, { AxiosError } from 'axios';
import i18n from 'i18next';

import { ENV, IS_PRODUCTION } from '@/config';
import { transformAxiosErrorWithToast } from '@/utils/errors';

const publicRequest = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: IS_PRODUCTION ? 15000 : 30000, // Longer timeout in development
});

// Request interceptor to add accept-language header
publicRequest.interceptors.request.use(
  async config => {
    // Add current language to accept-language header
    const currentLanguage = i18n.language || 'en';
    config.headers = config.headers || {};
    config.headers['accept-language'] = currentLanguage;

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to transform errors to AppError and show toast
publicRequest.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    // Transform error and show toast automatically (uses i18n internally)
    return Promise.reject(transformAxiosErrorWithToast(error));
  }
);

export default publicRequest;
