import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import viAuth from './locales/vi/auth.json';
import viCommon from './locales/vi/common.json';

// Get device locale
const deviceLanguage = getLocales()[0]?.languageCode || 'en';

// Translation resources
const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
  },
  vi: {
    common: viCommon,
    auth: viAuth,
  },
};

// Available languages
export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

// Initialize i18next
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'auth'],

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },

  debug: false, // Disable debug to prevent infinite loading issues
});

export default i18n;
