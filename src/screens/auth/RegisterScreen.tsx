import type {
  RegisterDto,
  RegisterDtoAccountIdentifierEnum,
} from '@ahomevilla-hotel/node-sdk';
import { RegisterDtoAccountIdentifierEnum as AccountIdentifier } from '@ahomevilla-hotel/node-sdk';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { OTPInputModal } from '@/components/auth';
import { Button, Input } from '@/components/ui';
import { useAuthTranslation } from '@/i18n/hooks';
import { authService } from '@/services/auth/authService';
import { getAuthErrorMessage } from '@/utils/errors';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import {
  createRegisterSchema,
  isValidEmail,
  isValidPhone,
  type RegisterFormData,
} from '@/utils/validation';

/**
 * Register screen with react-hook-form and Zod validation
 * Supports both email and phone registration
 */
export const RegisterScreen = () => {
  const router = useRouter();
  const { t } = useAuthTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(t)),
    defaultValues: {
      name: '',
      emailOrPhone: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Determine registration type based on emailOrPhone input
  const getRegistrationType = (
    emailOrPhone: string
  ): { type: RegisterDtoAccountIdentifierEnum; value: string } | null => {
    const trimmedValue = emailOrPhone.trim();

    // If contains '@', treat as email
    if (trimmedValue.includes('@')) {
      if (isValidEmail(trimmedValue)) {
        return { type: AccountIdentifier.Email, value: trimmedValue };
      }
    } else {
      // Otherwise treat as phone
      if (isValidPhone(trimmedValue)) {
        return { type: AccountIdentifier.Phone, value: trimmedValue };
      }
    }

    return null;
  };

  const onSubmit = async (data: RegisterFormData) => {
    const identifierData = getRegistrationType(data.emailOrPhone);

    if (!identifierData) {
      showErrorToast(t('validation.phoneOrEmail'));
      return;
    }

    setIsLoading(true);

    try {
      const payload: RegisterDto = {
        accountIdentifier: identifierData.type,
        data: {
          name: data.name.trim(),
          password: data.password,
          ...(identifierData.type === AccountIdentifier.Email && {
            email: identifierData.value,
          }),
          ...(identifierData.type === AccountIdentifier.Phone && {
            phone: identifierData.value,
          }),
        },
      };

      const response = await authService.register(payload);

      // Show success message
      showSuccessToast(t('success.registerSuccess'));

      // For email registration, show OTP modal for verification
      if (identifierData.type === AccountIdentifier.Email) {
        setRegisteredEmail(identifierData.value);
        setRegisteredUserId(response.id);
        setShowOtpModal(true);
      } else {
        // For phone registration (not implemented yet), redirect to login
        router.replace('/auth/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage =
        error instanceof Error
          ? getAuthErrorMessage(error.message, t)
          : t('errors.generic');
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    // Navigate to login screen after successful email verification
    router.replace('/auth/login');
  };

  const handleOtpClose = () => {
    setShowOtpModal(false);
    // Still redirect to login - user can verify later
    router.replace('/auth/login');
  };

  return (
    <>
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className='flex-1 bg-orange-50'
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled'
        >
          <View className='flex-1 justify-center px-6 py-12'>
            {/* Logo Section */}
            <View className='mb-8 items-center'>
              <Image
                source={require('@/assets/logos/logo-dark.webp')}
                className='mb-4 h-16 w-16'
                contentFit='contain'
              />
              <Text className='text-center text-lg font-medium text-orange-600'>
                {t('createAccount')}
              </Text>
              <Text className='mt-2 text-center text-sm text-orange-500'>
                {t('welcomeSubtitle')}
              </Text>
            </View>

            {/* Register Form */}
            <View className='space-y-4'>
              {/* Full Name */}
              <View>
                <Text className='mb-2 text-sm font-medium text-orange-800'>
                  {t('form.firstName')} *
                </Text>
                <Controller
                  control={control}
                  name='name'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('form.firstName')}
                      autoCapitalize='words'
                      editable={!isLoading}
                      className='border-orange-200 bg-white focus:border-orange-400'
                    />
                  )}
                />
                {errors.name && (
                  <Text className='mt-1 text-xs text-red-600'>
                    {errors.name.message}
                  </Text>
                )}
              </View>

              {/* Email or Phone (Combined Field) */}
              <View>
                <Text className='mb-2 text-sm font-medium text-orange-800'>
                  {t('form.emailOrPhone')} *
                </Text>
                <Controller
                  control={control}
                  name='emailOrPhone'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('form.emailOrPhonePlaceholder')}
                      keyboardType='default'
                      autoCapitalize='none'
                      autoComplete='username'
                      editable={!isLoading}
                      className='border-orange-200 bg-white focus:border-orange-400'
                    />
                  )}
                />
                {errors.emailOrPhone && (
                  <Text className='mt-1 text-xs text-red-600'>
                    {errors.emailOrPhone.message}
                  </Text>
                )}
                {!errors.emailOrPhone && (
                  <Text className='mt-1 text-xs text-orange-600'>
                    {t('validation.phoneOrEmailHint')}
                  </Text>
                )}
              </View>

              {/* Password */}
              <View>
                <Text className='mb-2 text-sm font-medium text-orange-800'>
                  {t('form.password')} *
                </Text>
                <View className='relative'>
                  <Controller
                    control={control}
                    name='password'
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('form.password')}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                        className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                      />
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className='absolute right-3 top-1/2 -translate-y-1/2'
                  >
                    <Text className='text-sm font-medium text-orange-600'>
                      {showPassword ? t('hide') : t('show')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className='mt-1 text-xs text-red-600'>
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Confirm Password */}
              <View>
                <Text className='mb-2 text-sm font-medium text-orange-800'>
                  {t('form.confirmPassword')} *
                </Text>
                <View className='relative'>
                  <Controller
                    control={control}
                    name='confirmPassword'
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('form.confirmPassword')}
                        secureTextEntry={!showConfirmPassword}
                        editable={!isLoading}
                        className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                      />
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className='absolute right-3 top-1/2 -translate-y-1/2'
                  >
                    <Text className='text-sm font-medium text-orange-600'>
                      {showConfirmPassword ? t('hide') : t('show')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text className='mt-1 text-xs text-red-600'>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>

              {/* Register Button */}
              <View style={{ marginTop: 24 }}>
                {isLoading && (
                  <View className='mb-2 flex-row items-center justify-center'>
                    <ActivityIndicator size='small' color='#f97316' />
                    <Text className='ml-2 text-sm text-orange-600'>
                      {t('signingIn')}
                    </Text>
                  </View>
                )}
                <Button
                  title={isLoading ? t('signingIn') : t('createAccount')}
                  onPress={handleSubmit(onSubmit)}
                  variant='primary'
                  fullWidth
                  disabled={isLoading}
                  style={{ backgroundColor: '#f97316' }}
                />
              </View>
            </View>

            {/* Login Link */}
            <View className='mt-6 flex-row items-center justify-center'>
              <Text className='text-sm text-orange-700'>
                {t('alreadyHaveAccount')}{' '}
              </Text>
              <Link href='/auth/login' asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className='text-sm font-semibold text-orange-600'>
                    {t('login')}
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal for Email Verification */}
      <OTPInputModal
        visible={showOtpModal}
        mode='register'
        email={registeredEmail}
        userId={registeredUserId}
        onClose={handleOtpClose}
        onSuccess={handleOtpSuccess}
      />
    </>
  );
};
