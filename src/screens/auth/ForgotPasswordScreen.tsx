import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Input } from '@/components/ui';
import { useAuthTranslation } from '@/i18n/hooks';
import { authService } from '@/services/auth/authService';
import { showSuccessToast } from '@/utils/toast';
import {
  createForgotPasswordEmailSchema,
  type ForgotPasswordEmailFormData,
} from '@/utils/validation';

/**
 * Forgot Password Screen - Step 1 of Flow
 * User enters email, OTP is sent, then navigates to verify-otp screen
 */
export const ForgotPasswordScreen = () => {
  const router = useRouter();
  const { t } = useAuthTranslation();

  const [isLoading, setIsLoading] = useState(false);

  // Log component mount
  useEffect(() => {
    console.log('[Màn hình Quên mật khẩu] Đã khởi tạo');
  }, []);

  const form = useForm<ForgotPasswordEmailFormData>({
    resolver: zodResolver(createForgotPasswordEmailSchema(t)),
    defaultValues: {
      email: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: ForgotPasswordEmailFormData) => {
    const email = data.email.trim();
    console.log('[Màn hình Quên mật khẩu] Đang gửi email:', email);
    setIsLoading(true);

    try {
      const response = await authService.initiateForgotPassword({ email });
      console.log('[Màn hình Quên mật khẩu] Gửi OTP thành công:', response);

      // Show success message
      showSuccessToast(t('success.otpSent') || 'Reset code sent to your email');

      // Navigate to verify OTP screen with email param
      console.log('[Màn hình Quên mật khẩu] Chuyển đến màn xác thực OTP');
      router.push({
        pathname: '/auth/verify-otp' as any,
        params: { email },
      });
    } catch (error) {
      console.error('[Màn hình Quên mật khẩu] Lỗi:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                    onChangeText={text => {
                      console.log('[Màn hình Quên mật khẩu] Email đã thay đổi');
                      onChange(text);
                    }}
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
  );
};
