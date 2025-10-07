import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

import { useLanguage } from '@/i18n/hooks';

export const LanguageSelectMenu: React.FC = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const currentLang = availableLanguages.find(
    lang => lang.code === currentLanguage
  );

  const handleSelect = async (languageCode: string) => {
    // Change language
    await changeLanguage(languageCode);

    // Invalidate all queries to refetch data with new language
    queryClient.invalidateQueries();

    setIsOpen(false);
  };

  return (
    <View>
      {/* Select Trigger */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className='flex-row items-center gap-2 rounded-lg border border-neutral-lighter bg-white px-3 py-2'
      >
        <Text className='text-sm font-medium text-neutral-darkest'>
          {currentLang?.code.toUpperCase()}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color='#525252'
        />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType='fade'
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className='flex-1'
          onPress={() => setIsOpen(false)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <View className='absolute right-4 top-16'>
            <View className='min-w-[120px] overflow-hidden rounded-lg border border-neutral-lighter bg-white shadow-lg'>
              {availableLanguages.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => handleSelect(language.code)}
                  className={`px-4 py-3 ${
                    index !== availableLanguages.length - 1
                      ? 'border-b border-neutral-lighter'
                      : ''
                  } ${
                    currentLanguage === language.code
                      ? 'bg-primary-lighter'
                      : ''
                  }`}
                >
                  <View className='flex-row items-center justify-between gap-3'>
                    <Text
                      className={`text-sm font-medium ${
                        currentLanguage === language.code
                          ? 'text-primary-main'
                          : 'text-neutral-darkest'
                      }`}
                    >
                      {language.nativeName}
                    </Text>
                    {currentLanguage === language.code && (
                      <Ionicons name='checkmark' size={18} color='#f97316' />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
