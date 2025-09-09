import { useState, useRef } from 'react';
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
} from 'react-native';

import { Button } from '@/components/ui';

/**
 * OTP Verification screen (UI only for now)
 * Will be connected to API in future
 */
export const OTPVerificationScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }
    Alert.alert('Coming Soon', 'OTP verification will be implemented soon');
  };

  const handleResendOTP = () => {
    setIsResending(true);
    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      Alert.alert('Success', 'Verification code has been resent');
    }, 2000);
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
              Verify Your Account
            </Text>
            <Text className='mt-2 text-center text-sm text-orange-500'>
              Enter the 6-digit code sent to your email
            </Text>
          </View>

          {/* OTP Input Section */}
          <View className='mb-8'>
            <Text className='mb-6 text-center text-sm text-orange-700'>
              Please enter the verification code
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
                  maxLength={1}
                  className='h-12 w-12 rounded-lg border-2 border-orange-200 bg-white text-center text-lg font-bold text-orange-800 focus:border-orange-400'
                />
              ))}
            </View>

            {/* Resend Code */}
            <View className='items-center'>
              <Text className='text-sm text-orange-700'>
                Didn&apos;t receive the code?
              </Text>
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isResending}
                className='mt-2'
              >
                <Text className='text-sm font-semibold text-orange-600'>
                  {isResending ? 'Resending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Verify Button */}
          <Button
            title='Verify Account'
            onPress={handleVerifyOTP}
            variant='primary'
            fullWidth
            style={{ backgroundColor: '#f97316' }}
          />

          {/* Back Link */}
          <View className='mt-6 items-center'>
            <TouchableOpacity>
              <Text className='text-sm font-medium text-orange-600'>
                Back to Registration
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
