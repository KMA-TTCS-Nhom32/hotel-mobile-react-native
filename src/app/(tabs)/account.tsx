import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Screen } from '@/components/layout';
import {
  LANGUAGE_OPTIONS,
  LanguageSelectionModal,
} from '@/components/ui/LanguageSelectionModal';
import { useAuth } from '@/hooks/useAuth';
import {
  useCommonTranslation,
  useLanguage,
  useAuthTranslation,
} from '@/i18n/hooks';
import { useProfile } from '@/store/authStore';

/**
 * Account/settings screen component that displays the current user's profile and app settings.
 *
 * Renders a user header (avatar, name, email, phone), settings (language, region), informational
 * items (help, terms & privacy, app version), and a logout action. Tapping the language row
 * opens the language selection modal; tapping logout shows a confirmation alert and invokes the
 * auth logout flow. Uses translations and user/profile/auth hooks for content and state.
 *
 * @returns The Account screen React element.
 */
export default function AccountScreen() {
  const { t } = useCommonTranslation();
  const { t: authT } = useAuthTranslation();
  const { currentLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Auth and profile data
  const { logout, isLoggingOut } = useAuth();
  const { user } = useProfile();

  const getCurrentLanguageOption = () => {
    return LANGUAGE_OPTIONS.find(option => option.value === currentLanguage);
  };

  const handleLogout = () => {
    Alert.alert(authT('confirmLogout'), authT('logoutMessage'), [
      {
        text: t('buttons.cancel'),
        style: 'cancel',
      },
      {
        text: authT('logout'),
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  return (
    <Screen padding={false}>
      <View className='flex-1 bg-neutral-lightest'>
        {/* Fixed User Profile Header */}
        <View className='bg-white pb-6 pt-4'>
          <View className='mx-4 flex-row items-center'>
            {/* Avatar */}
            <View className='mr-4 h-16 w-16 items-center justify-center rounded-full bg-orange-500'>
              <Text className='text-2xl text-white'>
                {user?.name?.charAt(0) || user?.email?.charAt(0) || '👤'}
              </Text>
            </View>

            {/* User Info */}
            <View className='flex-1'>
              <Text className='text-lg font-semibold text-neutral-darkest'>
                {user?.name || user?.email || 'User'}
              </Text>
              <Text className='text-sm text-neutral-dark'>
                {user?.email || 'No email available'}
              </Text>
              {user?.phone && (
                <Text className='text-sm text-neutral-dark'>{user.phone}</Text>
              )}
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
              {t('account.settings')}
            </Text>
            <View className='rounded-xl bg-white shadow-sm'>
              {/* Language Option */}
              <TouchableOpacity
                className='flex-row items-center justify-between border-b border-neutral-lighter p-4'
                onPress={() => setShowLanguageModal(true)}
              >
                <Text className='text-base text-neutral-darkest'>
                  {t('account.language')}
                </Text>
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
                    {t('account.help')}
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
                    {t('account.terms')} & {t('account.privacy')}
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
                    {t('account.version')}
                  </Text>
                </View>
                <Text className='text-sm text-neutral-dark'>1.0.0</Text>
              </View>

              {/* Logout */}
              <TouchableOpacity
                className='p-4'
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                <View className='flex-row items-center'>
                  <Ionicons
                    name='log-out-outline'
                    size={20}
                    color='#dc2626'
                    className='mr-3'
                  />
                  <Text className='text-base text-red-600'>
                    {isLoggingOut ? authT('loggingOut') : authT('logout')}
                  </Text>
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
