export const findTranslation = <T extends { language?: string }>(
  translations: T[] | undefined,
  lng: string
): T | undefined => {
  return translations?.find(t => t.language === lng.toUpperCase());
};
