import type {
  ChangePasswordDto,
  UpdateProfileDto,
  UpdateProfileDtoGenderEnum,
} from '@ahomevilla-hotel/node-sdk';
import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { InputText } from '@/components/forms';
import { Screen } from '@/components/layout';
import { Button, DatePicker } from '@/components/ui';
import { useAuthTranslation, useCommonTranslation } from '@/i18n/hooks';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';
import { showSuccessToast } from '@/utils/toast';
import {
  createChangePasswordSchema,
  createUpdateProfileSchema,
  type ChangePasswordFormData,
  type UpdateProfileFormData,
} from '@/utils/validation';

// Gender options
const GENDER_OPTIONS = [
  { value: 'MALE' as const, labelKey: 'profile.male' },
  { value: 'FEMALE' as const, labelKey: 'profile.female' },
];

export const EditProfileScreen = () => {
  const { t } = useAuthTranslation();
  const { t: commonT } = useCommonTranslation();
  const { user, setUser } = useAuthStore();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(createUpdateProfileSchema(t)),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: (user?.gender as 'MALE' | 'FEMALE') || undefined,
      birth_date: user?.birth_date || '',
    },
    mode: 'onTouched',
  });

  // Password form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(createChangePasswordSchema(t)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  // Handle profile update
  const handleProfileUpdate = async (data: UpdateProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const payload: UpdateProfileDto = {
        name: data.name,
        gender: data.gender as UpdateProfileDtoGenderEnum,
      };

      // Only include optional fields if they have values
      if (data.phone) payload.phone = data.phone;
      if (data.birth_date) payload.birth_date = data.birth_date;

      const updatedUser = await authService.updateProfile(payload);
      setUser(updatedUser);
      showSuccessToast(
        t('profile.updateSuccess') || 'Profile updated successfully'
      );
    } catch (error) {
      // Error toast is shown automatically by API interceptor
      console.error('Profile update error:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (data: ChangePasswordFormData) => {
    setIsChangingPassword(true);
    try {
      const payload: ChangePasswordDto = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      await authService.changePassword(payload);
      showSuccessToast(
        t('profile.passwordChanged') || 'Password changed successfully'
      );
      passwordForm.reset();
    } catch (error) {
      // Error toast is shown automatically by API interceptor
      console.error('Password change error:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Screen padding={false}>
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className='flex-row items-center border-b border-neutral-lighter bg-white px-4 py-3'>
          <TouchableOpacity
            onPress={() => router.back()}
            className='mr-3 h-10 w-10 items-center justify-center rounded-full'
          >
            <Ionicons name='arrow-back' size={24} color='#f97316' />
          </TouchableOpacity>
          <Text className='text-lg font-semibold text-neutral-darkest'>
            {t('profile.editProfile') || 'Edit Profile'}
          </Text>
        </View>

        <ScrollView
          className='flex-1 bg-neutral-lightest'
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps='handled'
        >
          {/* Profile Information Section */}
          <View className='mx-4 mt-6'>
            <Text className='mb-3 text-lg font-semibold text-neutral-darkest'>
              {t('profile.basicInfo') || 'Basic Information'}
            </Text>
            <View className='rounded-xl bg-white p-4 shadow-sm'>
              <FormProvider {...profileForm}>
                <View className='gap-4'>
                  {/* Name */}
                  <InputText
                    name='name'
                    label={t('form.firstName') || 'Name'}
                    placeholder={
                      t('profile.namePlaceholder') || 'Enter your name'
                    }
                    required
                    disabled={isUpdatingProfile}
                  />

                  {/* Email (readonly - not using InputText) */}
                  <View>
                    <Text className='mb-2 text-sm font-medium text-neutral-darkest'>
                      {t('form.email') || 'Email'}
                    </Text>
                    <View className='rounded-lg border border-neutral-light bg-neutral-lighter px-3 py-3'>
                      <TextInput
                        value={user?.email || ''}
                        editable={false}
                        style={{ fontSize: 16, color: '#9CA3AF' }}
                      />
                    </View>
                    <Text className='mt-1 text-xs text-neutral-dark'>
                      {t('profile.emailReadonly') || 'Email cannot be changed'}
                    </Text>
                  </View>

                  {/* Phone */}
                  <InputText
                    name='phone'
                    label={t('form.phoneNumber') || 'Phone Number'}
                    placeholder={
                      t('profile.phonePlaceholder') || 'Enter phone number'
                    }
                    disabled={isUpdatingProfile}
                    keyboardType='phone-pad'
                  />

                  {/* Gender - Custom component */}
                  <View>
                    <Text className='mb-2 text-sm font-medium text-neutral-darkest'>
                      {t('profile.gender') || 'Gender'}
                    </Text>
                    <Controller
                      control={profileForm.control}
                      name='gender'
                      render={({ field: { onChange, value } }) => (
                        <View className='flex-row gap-3'>
                          {GENDER_OPTIONS.map(option => (
                            <Pressable
                              key={option.value}
                              onPress={() => onChange(option.value)}
                              className={`flex-1 rounded-lg border-2 p-3 ${
                                value === option.value
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-neutral-lighter bg-white'
                              }`}
                            >
                              <Text
                                className={`text-center font-medium ${
                                  value === option.value
                                    ? 'text-orange-600'
                                    : 'text-neutral-dark'
                                }`}
                              >
                                {t(option.labelKey) || option.value}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                    />
                  </View>

                  {/* Birth Date - Custom component */}
                  <Controller
                    control={profileForm.control}
                    name='birth_date'
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        label={t('profile.birthDate') || 'Birth Date'}
                        value={value ? new Date(value) : undefined}
                        onChange={date =>
                          onChange(date.toISOString().split('T')[0])
                        }
                        maxDate={new Date()}
                        placeholder={
                          t('profile.birthDatePlaceholder') ||
                          'Select your birth date'
                        }
                      />
                    )}
                  />

                  {/* Save Profile Button */}
                  <Button
                    title={
                      isUpdatingProfile
                        ? commonT('buttons.saving') || 'Saving...'
                        : commonT('buttons.save') || 'Save Changes'
                    }
                    onPress={profileForm.handleSubmit(handleProfileUpdate)}
                    variant='primary'
                    fullWidth
                    disabled={isUpdatingProfile}
                    loading={isUpdatingProfile}
                    style={{ backgroundColor: '#f97316' }}
                  />
                </View>
              </FormProvider>
            </View>
          </View>

          {/* Change Password Section */}
          <View className='mx-4 mt-6'>
            <Text className='mb-3 text-lg font-semibold text-neutral-darkest'>
              {t('profile.changePassword') || 'Change Password'}
            </Text>
            <View className='rounded-xl bg-white p-4 shadow-sm'>
              <FormProvider {...passwordForm}>
                <View className='gap-4'>
                  {/* Current Password */}
                  <InputText
                    name='currentPassword'
                    label={t('profile.currentPassword') || 'Current Password'}
                    placeholder='••••••••'
                    required
                    disabled={isChangingPassword}
                    isPassword
                  />

                  {/* New Password */}
                  <InputText
                    name='newPassword'
                    label={t('profile.newPassword') || 'New Password'}
                    placeholder='••••••••'
                    required
                    disabled={isChangingPassword}
                    isPassword
                  />

                  {/* Confirm Password */}
                  <InputText
                    name='confirmPassword'
                    label={t('form.confirmPassword') || 'Confirm New Password'}
                    placeholder='••••••••'
                    required
                    disabled={isChangingPassword}
                    isPassword
                  />

                  {/* Change Password Button */}
                  <Button
                    title={
                      isChangingPassword
                        ? commonT('buttons.saving') || 'Saving...'
                        : t('profile.changePassword') || 'Change Password'
                    }
                    onPress={passwordForm.handleSubmit(handlePasswordChange)}
                    variant='secondary'
                    fullWidth
                    disabled={isChangingPassword}
                    loading={isChangingPassword}
                  />
                </View>
              </FormProvider>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};
