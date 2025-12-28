import type {
  ResetPasswordWithOTPEmailDto,
  VerifyEmailDto,
} from '@ahomevilla-hotel/node-sdk';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button, Input } from '@/components/ui';
import { useAuthTranslation } from '@/i18n/hooks';
import { authService } from '@/services/auth/authService';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import {
  createForgotPasswordSchema,
  otpVerificationSchema,
  type ForgotPasswordFormData,
  type OTPVerificationFormData,
} from '@/utils/validation';

// OTP Resend cooldown in seconds (5 minutes)
const RESEND_COOLDOWN_SECONDS = 5 * 60;

export type OTPModalMode = 'register' | 'forgot-password';

interface OTPInputModalProps {
  visible: boolean;
  mode: OTPModalMode;
  email: string;
  /** Required for register mode - userId returned from registration API */
  userId?: string;
  backButtonTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const OTPInputModal: React.FC<OTPInputModalProps> = ({
  visible,
  mode,
  email,
  userId,
  backButtonTitle,
  onClose,
  onSuccess,
}) => {
  const { t } = useAuthTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Form for forgot-password mode
  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(createForgotPasswordSchema(t)),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Form for register mode
  const registerForm = useForm<OTPVerificationFormData>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Reset cooldown timer when modal opens
  useEffect(() => {
    if (visible) {
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtpDigits(['', '', '', '', '', '']);
      forgotPasswordForm.reset();
      registerForm.reset();
    }
  }, [visible, forgotPasswordForm, registerForm]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (!visible || resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, resendCooldown]);

  // Format cooldown as MM:SS
  const formatCooldown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP digit input
  const handleOtpDigitChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.slice(-1).replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Update form value
    const otpValue = newDigits.join('');
    if (mode === 'forgot-password') {
      forgotPasswordForm.setValue('otp', otpValue);
    } else {
      registerForm.setValue('otp', otpValue);
    }

    // Auto-focus next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace on OTP input
  const handleOtpKeyPress = (
    index: number,
    key: string,
    _nativeEvent: { key: string }
  ) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle resend OTP (only for forgot-password mode)
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || mode !== 'forgot-password') return;

    setIsResending(true);
    try {
      await authService.initiateForgotPassword({ email });
      showSuccessToast(t('success.otpSent'));
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');
      showErrorToast(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const otpValue = otpDigits.join('');
    try {
      if (mode === 'register') {
        if (!userId) {
          throw new Error('User ID is required for email verification');
        }
        const payload: VerifyEmailDto = {
          userId,
          code: otpValue,
        };
        const result = await authService.verifyEmail(payload);
        showSuccessToast(t('success.otpVerified'));
      } else {
        const formData = forgotPasswordForm.getValues();
        const payload: ResetPasswordWithOTPEmailDto = {
          email,
          code: formData.otp,
          newPassword: formData.newPassword,
        };
        const result = await authService.resetPasswordWithOTP(payload);
        showSuccessToast(
          t('otp.passwordResetSuccess') || 'Password reset successfully!'
        );
      }

      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  const isOtpComplete = otpDigits.every(d => d !== '');
  const canSubmit =
    mode === 'register'
      ? isOtpComplete
      : isOtpComplete && forgotPasswordForm.formState.isValid;

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className='flex-1 bg-white'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled'
        >
          <View className='flex-row items-center justify-between border-b border-neutral-200 px-4 py-4'>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Text className='text-base text-orange-600'>
                {backButtonTitle || t('backToLogin') || 'Cancel'}
              </Text>
            </TouchableOpacity>
            <Text className='text-lg font-semibold text-neutral-900'>
              {mode === 'register'
                ? t('verify') || 'Verify Email'
                : t('otp.resetPassword') || 'Reset Password'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <View className='flex-1 px-6 py-8'>
            <Text className='mb-2 text-center text-base text-neutral-600'>
              {t('otp.subtitle') || 'Enter the 6-digit code sent to'}
            </Text>
            <Text className='mb-8 text-center text-base font-semibold text-orange-600'>
              {email}
            </Text>
            <View className='mb-6 flex-row justify-center gap-2'>
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    otpInputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={value => handleOtpDigitChange(index, value)}
                  onKeyPress={e =>
                    handleOtpKeyPress(index, e.nativeEvent.key, e.nativeEvent)
                  }
                  keyboardType='number-pad'
                  maxLength={1}
                  editable={!isSubmitting}
                  className='h-14 w-12 rounded-xl border-2 border-orange-200 bg-white text-center text-2xl font-bold text-neutral-900 focus:border-orange-500'
                  style={{ textAlign: 'center' }}
                />
              ))}
            </View>
            {mode === 'forgot-password' && (
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
            )}
            {mode === 'forgot-password' && (
              <View className='space-y-4'>
                <View>
                  <Text className='mb-2 text-sm font-medium text-orange-800'>
                    {t('otp.newPassword') || 'New Password'} *
                  </Text>
                  <View className='relative'>
                    <Controller
                      control={forgotPasswordForm.control}
                      name='newPassword'
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder={t('otp.newPassword') || 'New Password'}
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
                        {showPassword ? t('hide') : t('show')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {forgotPasswordForm.formState.errors.newPassword && (
                    <Text className='mt-1 text-xs text-red-600'>
                      {forgotPasswordForm.formState.errors.newPassword.message}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className='mb-2 text-sm font-medium text-orange-800'>
                    {t('form.confirmPassword') || 'Confirm Password'} *
                  </Text>
                  <View className='relative'>
                    <Controller
                      control={forgotPasswordForm.control}
                      name='confirmPassword'
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder={
                            t('form.confirmPassword') || 'Confirm Password'
                          }
                          secureTextEntry={!showConfirmPassword}
                          editable={!isSubmitting}
                          className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                        />
                      )}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isSubmitting}
                      className='absolute right-3 top-1/2 -translate-y-1/2'
                    >
                      <Text className='text-sm font-medium text-orange-600'>
                        {showConfirmPassword ? t('hide') : t('show')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {forgotPasswordForm.formState.errors.confirmPassword && (
                    <Text className='mt-1 text-xs text-red-600'>
                      {
                        forgotPasswordForm.formState.errors.confirmPassword
                          .message
                      }
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
          <View className='px-6 pb-8'>
            <Button
              title={
                isSubmitting
                  ? mode === 'register'
                    ? t('otp.verifying') || 'Verifying...'
                    : t('otp.resetting') || 'Resetting...'
                  : mode === 'register'
                    ? t('verify') || 'Verify'
                    : t('otp.resetPassword') || 'Reset Password'
              }
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              loading={isSubmitting}
              variant='primary'
              fullWidth
              style={{ backgroundColor: '#f97316' }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};
