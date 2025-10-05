import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';

import { useLanguage } from '@/i18n/hooks';

// Language options configuration
export const LANGUAGE_OPTIONS = [
  {
    label: 'languages.en',
    value: 'en',
    flag: require('@/assets/images/flags/england-flag.png'),
    nativeName: 'English',
  },
  {
    label: 'languages.vi',
    value: 'vi',
    flag: require('@/assets/images/flags/vietnam-flag.webp'),
    nativeName: 'Tiếng Việt',
  },
] as const;

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  visible,
  onClose,
  title = 'Select Language',
}) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const queryClient = useQueryClient();

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === currentLanguage) {
      onClose();
      return;
    }

    // Change language
    await changeLanguage(languageCode);

    // Invalidate all queries to refetch data with new language
    queryClient.invalidateQueries();

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      onRequestClose={onClose}
    >
      <View className='flex-1 items-center justify-center bg-black/50'>
        <View className='w-4/5 rounded-xl bg-white p-4 shadow-lg'>
          <Text className='mb-4 text-lg font-semibold text-neutral-darkest'>
            {title}
          </Text>

          {LANGUAGE_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              className='flex-row items-center justify-between border-b border-neutral-lighter py-3'
              onPress={() => handleLanguageSelect(option.value)}
            >
              <View className='flex-row items-center'>
                <Image
                  source={option.flag}
                  className='mr-3 h-4 w-6'
                  resizeMode='cover'
                />
                <Text className='text-base text-neutral-darkest'>
                  {option.nativeName}
                </Text>
              </View>
              {currentLanguage === option.value && (
                <Ionicons name='checkmark' size={20} color='#f97316' />
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            className='mt-4 rounded-lg bg-neutral-lighter p-3'
            onPress={onClose}
          >
            <Text className='text-center text-base text-neutral-darkest'>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LanguageSelectionModal;
