import { useTranslation } from 'react-i18next';

import { availableLanguages } from './index';

/**
 * Custom hook for using translations with common namespace
 */
export const useCommonTranslation = () => {
  return useTranslation('common');
};

/**
 * Custom hook for using translations with auth namespace
 */
export const useAuthTranslation = () => {
  return useTranslation('auth');
};

/**
 * Custom hook for using translations with payment namespace
 */
export const usePaymentTranslation = () => {
  return useTranslation('payment');
};

/**
 * Custom hook for language management
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const currentLanguage = i18n.language;
  const getCurrentLanguageInfo = () => {
    return availableLanguages.find(lang => lang.code === currentLanguage);
  };

  return {
    currentLanguage,
    changeLanguage,
    availableLanguages,
    getCurrentLanguageInfo,
  };
};
