import type {
  RegisterDto,
  RegisterDtoAccountIdentifierEnum,
} from '@ahomevilla-hotel/node-sdk';
import { RegisterDtoAccountIdentifierEnum as AccountIdentifier } from '@ahomevilla-hotel/node-sdk';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { OTPInputModal } from '@/components/auth';
import { InputText } from '@/components/forms';
import { Button } from '@/components/ui';
import { useAuthTranslation } from '@/i18n/hooks';
import { authService } from '@/services/auth/authService';
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

  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState('');

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(t)),
    defaultValues: {
      name: '',
      emailOrPhone: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
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
      // Error toast is shown automatically by API interceptor
      console.error('Registration error:', error);
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
                style={{ width: 64, height: 64, marginBottom: 16 }}
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
            <FormProvider {...form}>
              <View className='gap-4'>
                {/* Full Name */}
                <InputText
                  name='name'
                  label={t('form.fullName')}
                  placeholder={t('form.fullName')}
                  required
                  disabled={isLoading}
                  autoCapitalize='words'
                />

                {/* Email or Phone */}
                <InputText
                  name='emailOrPhone'
                  label={t('form.emailOrPhone')}
                  placeholder={t('form.emailOrPhonePlaceholder')}
                  helperText={t('validation.phoneOrEmailHint')}
                  required
                  disabled={isLoading}
                  keyboardType='default'
                  autoCapitalize='none'
                  autoComplete='username'
                />

                {/* Password */}
                <InputText
                  name='password'
                  label={t('form.password')}
                  placeholder={t('form.password')}
                  required
                  disabled={isLoading}
                  isPassword
                />

                {/* Confirm Password */}
                <InputText
                  name='confirmPassword'
                  label={t('form.confirmPassword')}
                  placeholder={t('form.confirmPassword')}
                  required
                  disabled={isLoading}
                  isPassword
                />

                {/* Register Button */}
                <View style={{ marginTop: 8 }}>
                  <Button
                    title={isLoading ? t('signingIn') : t('createAccount')}
                    onPress={form.handleSubmit(onSubmit)}
                    variant='primary'
                    fullWidth
                    loading={isLoading}
                    style={{ backgroundColor: '#f97316' }}
                  />
                </View>
              </View>
            </FormProvider>

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
