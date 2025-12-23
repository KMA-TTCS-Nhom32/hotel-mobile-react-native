import type {
  ChangePasswordDto,
  UpdateProfileDto,
  UpdateProfileDtoGenderEnum,
} from '@ahomevilla-hotel/node-sdk';
import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Screen } from '@/components/layout';
import { Button, DatePicker, Input } from '@/components/ui';
import { useAuthTranslation, useCommonTranslation } from '@/i18n/hooks';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
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
  });

  // Password form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(createChangePasswordSchema(t)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
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
      console.error('Profile update error:', error);
      const message =
        error instanceof Error ? error.message : t('errors.generic');
      showErrorToast(message);
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
      console.error('Password change error:', error);
      const message =
        error instanceof Error ? error.message : t('errors.generic');
      showErrorToast(message);
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
              {/* Name */}
              <View className='mb-4'>
                <Text className='mb-2 text-sm font-medium text-neutral-dark'>
                  {t('form.firstName') || 'Name'} *
                </Text>
                <Controller
                  control={profileForm.control}
                  name='name'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={
                        t('profile.namePlaceholder') || 'Enter your name'
                      }
                      editable={!isUpdatingProfile}
                    />
                  )}
                />
                {profileForm.formState.errors.name && (
                  <Text className='mt-1 text-xs text-red-600'>
                    {profileForm.formState.errors.name.message}
                  </Text>
                )}
              </View>

              {/* Email (readonly) */}
              <View className='mb-4'>
                <Text className='mb-2 text-sm font-medium text-neutral-dark'>
                  {t('form.email') || 'Email'}
                </Text>
                <Input
                  value={user?.email || ''}
                  editable={false}
                  className='bg-neutral-lighter'
                />
                <Text className='mt-1 text-xs text-neutral-dark'>
                  {t('profile.emailReadonly') || 'Email cannot be changed'}
                </Text>
              </View>

              {/* Phone */}
              <View className='mb-4'>
                <Text className='mb-2 text-sm font-medium text-neutral-dark'>
                  {t('form.phoneNumber') || 'Phone Number'}
                </Text>
                <Controller
                  control={profileForm.control}
                  name='phone'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={
                        t('profile.phonePlaceholder') || 'Enter phone number'
                      }
                      keyboardType='phone-pad'
                      editable={!isUpdatingProfile}
                    />
                  )}
                />
              </View>

              {/* Gender */}
              <View className='mb-4'>
                <Text className='mb-2 text-sm font-medium text-neutral-dark'>
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

              {/* Birth Date */}
              <View className='mb-4'>
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
              </View>

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
          </View>

          {/* Change Password Section */}
          <View className='mx-4 mt-6'>
            <Text className='mb-3 text-lg font-semibold text-neutral-darkest'>
              {t('profile.changePassword') || 'Change Password'}
            </Text>
            <View className='rounded-xl bg-white p-4 shadow-sm'>
              {/* Current Password */}
              <Controller
                control={passwordForm.control}
                name='currentPassword'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('profile.currentPassword') || 'Current Password'}
                    required
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder='••••••••'
                    editable={!isChangingPassword}
                    error={
                      passwordForm.formState.errors.currentPassword?.message
                    }
                  />
                )}
              />

              {/* New Password */}
              <Controller
                control={passwordForm.control}
                name='newPassword'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('profile.newPassword') || 'New Password'}
                    required
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder='••••••••'
                    editable={!isChangingPassword}
                    error={passwordForm.formState.errors.newPassword?.message}
                  />
                )}
              />

              {/* Confirm Password */}
              <Controller
                control={passwordForm.control}
                name='confirmPassword'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('form.confirmPassword') || 'Confirm New Password'}
                    required
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder='••••••••'
                    editable={!isChangingPassword}
                    error={
                      passwordForm.formState.errors.confirmPassword?.message
                    }
                  />
                )}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};
