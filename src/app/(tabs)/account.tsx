import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Screen } from '@/components/layout';
import {
  LANGUAGE_OPTIONS,
  LanguageSelectionModal,
} from '@/components/ui/LanguageSelectionModal';
import { useCommonTranslation, useLanguage } from '@/i18n/hooks';

export default function AccountScreen() {
  const { t } = useCommonTranslation();
  const { currentLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const getCurrentLanguageOption = () => {
    return LANGUAGE_OPTIONS.find(option => option.value === currentLanguage);
  };

  return (
    <Screen padding={false}>
      <View className='flex-1 bg-neutral-lightest'>
        {/* Fixed User Profile Header */}
        <View className='bg-white pb-6 pt-4'>
          <View className='mx-4 flex-row items-center'>
            {/* Avatar */}
            <View className='mr-4 h-16 w-16 items-center justify-center rounded-full bg-primary-main'>
              <Text className='text-2xl text-white'>👤</Text>
            </View>

            {/* User Info */}
            <View className='flex-1'>
              <Text className='text-lg font-semibold text-neutral-darkest'>
                John Doe
              </Text>
              <Text className='text-sm text-neutral-dark'>
                john.doe@example.com
              </Text>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              className='h-10 w-10 items-center justify-center rounded-full bg-neutral-lighter'
              onPress={() => console.log('Edit profile pressed')}
            >
              <Ionicons name='pencil' size={18} color='#64748b' />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView className='flex-1'>
          {/* Settings Section */}
          <View className='mx-4 mb-4 mt-6'>
            <Text className='mb-3 text-lg font-semibold text-neutral-darkest'>
              Settings
            </Text>
            <View className='rounded-xl bg-white shadow-sm'>
              {/* Language Option */}
              <TouchableOpacity
                className='flex-row items-center justify-between border-b border-neutral-lighter p-4'
                onPress={() => setShowLanguageModal(true)}
              >
                <Text className='text-base text-neutral-darkest'>Language</Text>
                <View className='flex-row items-center'>
                  <Text className='mr-2 text-sm text-neutral-dark'>
                    {t(getCurrentLanguageOption()?.label || 'languages.en')}
                  </Text>
                  <Image
                    source={getCurrentLanguageOption()?.flag}
                    className='mr-2 h-4 w-6'
                    resizeMode='cover'
                  />
                  <Ionicons name='chevron-forward' size={16} color='#94a3b8' />
                </View>
              </TouchableOpacity>

              {/* Region Option */}
              <TouchableOpacity
                className='flex-row items-center justify-between p-4'
                onPress={() => console.log('Region pressed')}
              >
                <Text className='text-base text-neutral-darkest'>Region</Text>
                <View className='flex-row items-center'>
                  <Text className='mr-2 text-sm text-neutral-dark'>Hanoi</Text>
                  <Ionicons name='chevron-forward' size={16} color='#94a3b8' />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Information Section */}
          <View className='mx-4 mb-6'>
            <Text className='mb-3 text-lg font-semibold text-neutral-darkest'>
              Information
            </Text>
            <View className='rounded-xl bg-white shadow-sm'>
              {/* Q&A */}
              <TouchableOpacity
                className='flex-row items-center justify-between border-b border-neutral-lighter p-4'
                onPress={() => console.log('Q&A pressed')}
              >
                <View className='flex-row items-center'>
                  <Ionicons
                    name='help-circle-outline'
                    size={20}
                    color='#64748b'
                    className='mr-3'
                  />
                  <Text className='text-base text-neutral-darkest'>
                    Q&A / Help
                  </Text>
                </View>
                <Ionicons name='chevron-forward' size={16} color='#94a3b8' />
              </TouchableOpacity>

              {/* Terms & Privacy */}
              <TouchableOpacity
                className='flex-row items-center justify-between border-b border-neutral-lighter p-4'
                onPress={() => console.log('Terms & Privacy pressed')}
              >
                <View className='flex-row items-center'>
                  <Ionicons
                    name='shield-outline'
                    size={20}
                    color='#64748b'
                    className='mr-3'
                  />
                  <Text className='text-base text-neutral-darkest'>
                    Terms & Privacy
                  </Text>
                </View>
                <Ionicons name='chevron-forward' size={16} color='#94a3b8' />
              </TouchableOpacity>

              {/* App Version */}
              <View className='flex-row items-center justify-between border-b border-neutral-lighter p-4'>
                <View className='flex-row items-center'>
                  <Ionicons
                    name='information-circle-outline'
                    size={20}
                    color='#64748b'
                    className='mr-3'
                  />
                  <Text className='text-base text-neutral-darkest'>
                    App Version
                  </Text>
                </View>
                <Text className='text-sm text-neutral-dark'>1.0.0</Text>
              </View>

              {/* Logout */}
              <TouchableOpacity
                className='p-4'
                onPress={() => console.log('Logout pressed')}
              >
                <View className='flex-row items-center'>
                  <Ionicons
                    name='log-out-outline'
                    size={20}
                    color='#dc2626'
                    className='mr-3'
                  />
                  <Text className='text-base text-red-600'>Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Logo */}
          <View className='items-center pb-8'>
            <Image
              source={require('@/assets/logos/logo-large-dark.png')}
              className='h-16 w-32'
              resizeMode='contain'
            />
          </View>
        </ScrollView>
      </View>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title='Select Language'
      />
    </Screen>
  );
}
