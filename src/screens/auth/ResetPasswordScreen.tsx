import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { z } from 'zod';

import { Button, Input } from '@/components/ui';
import { useAuthTranslation } from '@/i18n/hooks';
import { authService } from '@/services/auth/authService';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Reset Password Screen - Step 3 of Forgot Password Flow
 * Receives email and OTP from previous screen, resets password
 */
export const ResetPasswordScreen = () => {
  const router = useRouter();
  const { t } = useAuthTranslation();
  const params = useLocalSearchParams<{ email: string; otp: string }>();
  const email = params.email || '';
  const otp = params.otp || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Log component mount
  useEffect(() => {
    console.log('[Màn hình Đặt lại mật khẩu] Đã khởi tạo với:', {
      email,
      otp: otp.substring(0, 2) + '****',
    });
  }, [email, otp]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    console.log('[Màn hình Đặt lại mật khẩu] Đang đặt lại mật khẩu cho:', {
      email,
    });
    setIsSubmitting(true);

    try {
      const result = await authService.resetPasswordWithOTP({
        email,
        code: otp,
        newPassword: data.newPassword,
      });
      console.log(
        '[Màn hình Đặt lại mật khẩu] Đặt lại mật khẩu thành công:',
        result
      );

      showSuccessToast(
        t('otp.passwordResetSuccess') || 'Password reset successfully!'
      );

      // Navigate to login
      router.replace('/auth/login');
    } catch (error) {
      console.error('[Màn hình Đặt lại mật khẩu] Lỗi:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className='flex-1 bg-orange-50'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        <View className='flex-1 justify-center px-6 py-12'>
          {/* Header */}
          <View className='mb-8 items-center'>
            <Image
              source={require('@/assets/logos/logo-dark.webp')}
              style={{ width: 64, height: 64, marginBottom: 16 }}
              contentFit='contain'
            />
            <Text className='text-center text-xl font-bold text-orange-600'>
              {t('otp.resetPassword') || 'Reset Password'}
            </Text>
            <Text className='mt-2 text-center text-sm text-orange-500'>
              {t('otp.enterNewPassword') || 'Enter your new password'}
            </Text>
          </View>

          {/* Form */}
          <View className='space-y-4'>
            {/* New Password */}
            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                {t('otp.newPassword') || 'New Password'} *
              </Text>
              <View className='relative'>
                <Controller
                  control={control}
                  name='newPassword'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={text => {
                        console.log(
                          '[Màn hình Đặt lại mật khẩu] Mật khẩu mới đã thay đổi'
                        );
                        onChange(text);
                      }}
                      onBlur={onBlur}
                      placeholder={
                        t('otp.newPasswordPlaceholder') || 'Enter new password'
                      }
                      secureTextEntry={!showPassword}
                      editable={!isSubmitting}
                      className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  <Text className='text-sm font-medium text-orange-600'>
                    {showPassword ? t('hide') || 'Hide' : t('show') || 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text className='mt-1 text-xs text-red-600'>
                  {errors.newPassword.message}
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                {t('form.confirmPassword') || 'Confirm Password'} *
              </Text>
              <View className='relative'>
                <Controller
                  control={control}
                  name='confirmPassword'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={text => {
                        console.log(
                          '[Màn hình Đặt lại mật khẩu] Xác nhận mật khẩu đã thay đổi'
                        );
                        onChange(text);
                      }}
                      onBlur={onBlur}
                      placeholder={
                        t('form.confirmPasswordPlaceholder') ||
                        'Confirm new password'
                      }
                      secureTextEntry={!showConfirmPassword}
                      editable={!isSubmitting}
                      className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  <Text className='text-sm font-medium text-orange-600'>
                    {showConfirmPassword
                      ? t('hide') || 'Hide'
                      : t('show') || 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className='mt-1 text-xs text-red-600'>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <View style={{ marginTop: 24 }}>
              <Button
                title={
                  isSubmitting
                    ? t('otp.resetting') || 'Resetting...'
                    : t('otp.resetPassword') || 'Reset Password'
                }
                onPress={handleSubmit(onSubmit)}
                variant='primary'
                fullWidth
                disabled={isSubmitting}
                loading={isSubmitting}
                style={{ backgroundColor: '#f97316' }}
              />
            </View>
          </View>

          {/* Back Link */}
          <View className='mt-6 items-center'>
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Text className='text-sm font-semibold text-orange-600'>
                {t('back') || 'Back'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
