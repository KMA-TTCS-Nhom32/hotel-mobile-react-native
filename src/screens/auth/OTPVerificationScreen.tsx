import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui';
import { authService } from '@/services/auth/authService';

/**
 * OTP Verification screen with API integration
 */
export const OTPVerificationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; userId?: string }>();
  const email = params.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (raw: string, index: number) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 0) {
      setOtp(prev => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }
    setOtp(prev => {
      const next = [...prev];
      const chars = digits.split('');
      next[index] = chars[0]!;
      for (let i = 1; i < chars.length && index + i < 6; i++) {
        next[index + i] = chars[i]!;
      }
      return next;
    });
    const nextIndex = Math.min(index + digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email is missing. Please go back and try again.');
      return;
    }

    setIsVerifying(true);
    try {
      await authService.verifyEmailOTP(email, otpCode);

      Alert.alert(
        'Success!',
        'Your account has been verified successfully. You can now login.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('OTP verification error:', error);

      const errorMessage = error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn';

      Alert.alert(
        'Xác thực thất bại',
        errorMessage
      );
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !email) return;

    setIsResending(true);
    try {
      await authService.resendOTP(email);

      Alert.alert('Success', 'Verification code has been resent to your email');

      // Reset countdown
      setCountdown(60);
      setCanResend(false);

      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error('Resend OTP error:', error);

      const errorMessage = error.message || 'Không thể gửi lại mã. Vui lòng thử lại sau.';

      Alert.alert(
        'Gửi lại thất bại',
        errorMessage
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToRegister = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      className='flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className='flex-1 bg-gradient-to-b from-orange-100 to-orange-50'
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        <View className='flex-1 justify-center px-6 py-12'>
          {/* Logo Section */}
          <View className='mb-12 items-center'>
            <Image
              source={require('@/assets/logos/logo-light.webp')}
              className='mb-4 h-16 w-16'
              resizeMode='contain'
            />
            <Text className='text-center text-lg font-medium text-orange-600'>
              Xác Thực Tài Khoản
            </Text>
            <Text className='mt-2 text-center text-sm text-orange-500'>
              Nhập mã 6 số đã gửi đến
            </Text>
            <Text className='mt-1 text-center text-sm font-semibold text-orange-700'>
              {email}
            </Text>
          </View>

          {/* OTP Input Section */}
          <View className='mb-8'>
            <Text className='mb-6 text-center text-sm text-orange-700'>
              Vui lòng nhập mã xác thực
            </Text>

            {/* OTP Input Fields */}
            <View className='mb-6 flex-row justify-center space-x-3'>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={value => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType='numeric'
                  maxLength={6}
                  editable={!isVerifying && !isResending}
                  className='h-12 w-12 rounded-lg border-2 border-orange-200 bg-white text-center text-lg font-bold text-orange-800 focus:border-orange-400'
                />
              ))}
            </View>

            {/* Resend Code */}
            <View className='items-center'>
              <Text className='text-sm text-orange-700'>
                Không nhận được mã?
              </Text>
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={!canResend || isResending || isVerifying}
                className='mt-2'
              >
                <Text
                  className={`text-sm font-semibold ${canResend && !isResending && !isVerifying
                    ? 'text-orange-600'
                    : 'text-orange-300'
                    }`}
                >
                  {isResending
                    ? 'Resending...'
                    : canResend
                      ? 'Resend Code'
                      : `Resend in ${countdown}s`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Verify Button */}
          <Button
            title={isVerifying ? 'Đang xác thực...' : 'Xác Thực Tài Khoản'}
            onPress={handleVerifyOTP}
            variant='primary'
            fullWidth
            disabled={isVerifying || isResending}
            style={{ backgroundColor: '#f97316' }}
          />

          {/* Back Link */}
          <View className='mt-6 items-center'>
            <TouchableOpacity
              onPress={handleBackToRegister}
              disabled={isVerifying || isResending}
            >
              <Text className='text-sm font-medium text-orange-600'>
                Quay lại Đăng ký
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
