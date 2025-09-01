import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useLanguage } from '@/i18n/hooks';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  return (
    <View className='mb-4'>
      <Text className='mb-2 text-lg font-semibold text-neutral-darkest'>
        Language / Ngôn ngữ
      </Text>
      <View className='flex-row gap-2'>
        {availableLanguages.map(language => (
          <TouchableOpacity
            key={language.code}
            onPress={() => changeLanguage(language.code)}
            className={`rounded-lg px-4 py-2 ${
              currentLanguage === language.code
                ? 'bg-primary-main'
                : 'bg-neutral-lighter'
            }`}
          >
            <Text
              className={`font-medium ${
                currentLanguage === language.code
                  ? 'text-white'
                  : 'text-neutral-dark'
              }`}
            >
              {language.nativeName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
