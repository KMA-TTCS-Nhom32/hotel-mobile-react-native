import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useLanguage } from '@/i18n/hooks';

export const CompactLanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  return (
    <View className='flex-row gap-1'>
      {availableLanguages.map(language => (
        <TouchableOpacity
          key={language.code}
          onPress={() => changeLanguage(language.code)}
          className={`rounded-md px-3 py-1.5 ${
            currentLanguage === language.code
              ? 'bg-primary-main'
              : 'bg-neutral-lighter'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              currentLanguage === language.code
                ? 'text-white'
                : 'text-neutral-dark'
            }`}
          >
            {language.code.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
