import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
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
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import {
  createForgotPasswordEmailSchema,
  type ForgotPasswordEmailFormData,
} from '@/utils/validation';

/**
 * Forgot Password Screen
 * Step 1: User enters email
 * Step 2: On success, OTP modal opens for reset
 */
export const ForgotPasswordScreen = () => {
  const router = useRouter();
  const { t } = useAuthTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordEmailFormData>({
    resolver: zodResolver(createForgotPasswordEmailSchema(t)),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordEmailFormData) => {
    setIsLoading(true);

    try {
      const response = await authService.initiateForgotPassword({
        email: data.email.trim(),
      });
      console.log('Forgot password response:', response);
      // Store email for OTP modal
      setSubmittedEmail(data.email.trim());

      // Show success message
      showSuccessToast(t('success.otpSent') || 'Reset code sent to your email');

      // Open OTP modal
      setShowOtpModal(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    // Navigate to login screen
    router.replace('/auth/login');
  };

  const handleOtpClose = () => {
    setShowOtpModal(false);
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
              <Text className='text-center text-xl font-bold text-orange-600'>
                {t('forgotPassword') || 'Forgot Password?'}
              </Text>
              <Text className='mt-2 text-center text-sm text-orange-500'>
                {t('forgotPasswordSubtitle') ||
                  'Enter your email to receive a reset code'}
              </Text>
            </View>

            {/* Form */}
            <View className='space-y-4'>
              {/* Email Input */}
              <View>
                <Text className='mb-2 text-sm font-medium text-orange-800'>
                  {t('form.emailOrPhone') || 'Email'} *
                </Text>
                <Controller
                  control={control}
                  name='email'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={
                        t('form.emailOrPhonePlaceholder') || 'Enter your email'
                      }
                      keyboardType='email-address'
                      autoCapitalize='none'
                      autoComplete='email'
                      editable={!isLoading}
                      className='border-orange-200 bg-white focus:border-orange-400'
                    />
                  )}
                />
                {errors.email && (
                  <Text className='mt-1 text-xs text-red-600'>
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <View style={{ marginTop: 24 }}>
                <Button
                  title={
                    isLoading
                      ? t('otp.sending') || 'Sending...'
                      : t('otp.sendCode') || 'Send Reset Code'
                  }
                  onPress={handleSubmit(onSubmit)}
                  variant='primary'
                  fullWidth
                  disabled={isLoading}
                  loading={isLoading}
                  style={{ backgroundColor: '#f97316' }}
                />
              </View>
            </View>

            {/* Back to Login Link */}
            <View className='mt-6 items-center'>
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={isLoading}
              >
                <Text className='text-sm font-semibold text-orange-600'>
                  {t('backToLogin') || 'Back to Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <OTPInputModal
        visible={showOtpModal}
        mode='forgot-password'
        email={submittedEmail}
        onClose={handleOtpClose}
        onSuccess={handleOtpSuccess}
        backButtonTitle={t('hide')}
      />
    </>
  );
};
