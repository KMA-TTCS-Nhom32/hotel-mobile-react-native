import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enCommon from './locales/en/common.json';
import viCommon from './locales/vi/common.json';

// Get device locale
const deviceLanguage = getLocales()[0]?.languageCode || 'en';

// Translation resources
const resources = {
  en: {
    common: enCommon,
  },
  vi: {
    common: viCommon,
  },
};

// Available languages
export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

// Initialize i18next
const i18nInstance = i18n.use(initReactI18next);
i18nInstance.init({
  compatibilityJSON: 'v4',
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },

  debug: __DEV__,
});

export default i18n;
