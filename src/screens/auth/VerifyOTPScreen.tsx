import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui';
import { useAuthTranslation } from '@/i18n/hooks';
import { authService } from '@/services/auth/authService';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

// OTP Resend cooldown in seconds (5 minutes)
const RESEND_COOLDOWN_SECONDS = 5 * 60;

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type OTPFormData = z.infer<typeof otpSchema>;

/**
 * Verify OTP Screen - Step 2 of Forgot Password Flow
 * Receives email from previous screen, verifies OTP
 */
export const VerifyOTPScreen = () => {
  const router = useRouter();
  const { t } = useAuthTranslation();
  const params = useLocalSearchParams<{ email: string }>();
  const email = params.email || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  // OTP input refs for auto-focus
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const [otpDigits, setOtpDigits] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // Log component mount
  useEffect(() => {
    console.log('[Màn hình Xác thực OTP] Đã khởi tạo với email:', email);
  }, [email]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Format cooldown as MM:SS
  const formatCooldown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP digit input
  const handleOtpDigitChange = (index: number, value: string) => {
    console.log('[Màn hình Xác thực OTP] Số OTP thay đổi:', {
      vị_trí: index,
      giá_trị: value,
    });

    const digit = value.slice(-1).replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Update form value
    const otpValue = newDigits.join('');
    form.setValue('otp', otpValue);
    console.log('[Màn hình Xác thực OTP] Mã OTP hiện tại:', otpValue);

    // Auto-focus next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace on OTP input
  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    console.log('[Màn hình Xác thực OTP] Đang gửi lại OTP đến:', email);
    setIsResending(true);

    try {
      await authService.initiateForgotPassword({ email });
      console.log('[Màn hình Xác thực OTP] Gửi lại OTP thành công');
      showSuccessToast(t('success.otpSent') || 'OTP sent successfully');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      console.error('[Màn hình Xác thực OTP] Lỗi gửi lại OTP:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');
      showErrorToast(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const otpValue = otpDigits.join('');
    console.log('[Màn hình Xác thực OTP] Đang xác thực OTP:', {
      email,
      otp: otpValue.substring(0, 2) + '****',
    });

    if (otpValue.length !== 6) {
      console.log('[Màn hình Xác thực OTP] OTP chưa đầy đủ');
      showErrorToast(t('form.otpInvalid') || 'Please enter 6-digit OTP');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.verifyForgotPasswordOTP(email, otpValue);
      console.log('[Màn hình Xác thực OTP] Xác thực OTP thành công:', result);

      showSuccessToast(
        t('success.otpVerified') || 'OTP verified successfully!'
      );

      // Navigate to reset password screen with email and otp
      router.push({
        pathname: '/auth/reset-password' as any,
        params: { email, otp: otpValue },
      });
    } catch (error) {
      console.error('[Màn hình Xác thực OTP] Lỗi xác thực OTP:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOtpComplete = otpDigits.every(d => d !== '');

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
              {t('otp.verifyTitle') || 'Verify OTP'}
            </Text>
            <Text className='mt-2 text-center text-sm text-orange-500'>
              {t('otp.subtitle') || 'Enter the 6-digit code sent to'}
            </Text>
            <Text className='mt-1 text-center text-base font-semibold text-orange-600'>
              {email}
            </Text>
          </View>

          {/* OTP Input Grid */}
          <View className='mb-6 flex-row justify-center gap-2'>
            {otpDigits.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  otpInputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={value => handleOtpDigitChange(index, value)}
                onKeyPress={e => handleOtpKeyPress(index, e.nativeEvent.key)}
                keyboardType='number-pad'
                maxLength={1}
                editable={!isSubmitting}
                className='h-14 w-12 rounded-xl border-2 border-orange-200 bg-white text-center text-2xl font-bold text-neutral-900 focus:border-orange-500'
                style={{ textAlign: 'center' }}
              />
            ))}
          </View>

          {/* Resend Timer / Button */}
          <View className='mb-6 items-center'>
            {resendCooldown > 0 ? (
              <Text className='text-sm text-neutral-500'>
                {t('otp.resendIn') || 'Resend in'}{' '}
                <Text className='font-semibold text-orange-600'>
                  {formatCooldown(resendCooldown)}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isResending}
              >
                {isResending ? (
                  <ActivityIndicator size='small' color='#f97316' />
                ) : (
                  <Text className='text-sm font-semibold text-orange-600'>
                    {t('resendCode') || 'Resend Code'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <Button
            title={
              isSubmitting
                ? t('otp.verifying') || 'Verifying...'
                : t('otp.verify') || 'Verify OTP'
            }
            onPress={handleSubmit}
            disabled={!isOtpComplete || isSubmitting}
            loading={isSubmitting}
            variant='primary'
            fullWidth
            style={{ backgroundColor: '#f97316' }}
          />

          {/* Back Link */}
          <View className='mt-6 items-center'>
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Text className='text-sm font-semibold text-orange-600'>
                {t('backToLogin') || 'Back'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
