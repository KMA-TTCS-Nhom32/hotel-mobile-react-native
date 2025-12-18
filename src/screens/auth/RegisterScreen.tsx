import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Button, Input } from '@/components/ui';
import { authService } from '@/services/auth/authService';

/**
 * Register screen with OTP integration
 */
export const RegisterScreen = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): string | null => {
    if (!firstName.trim()) return 'First name is required';
    if (!lastName.trim()) return 'Last name is required';
    if (!email.trim()) return 'Email is required';

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email';

    if (!phone.trim()) return 'Phone number is required';
    if (phone.length < 10) return 'Phone number must be at least 10 digits';

    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';

    if (password !== confirmPassword) return 'Passwords do not match';

    return null;
  };

  const handleRegister = async () => {
    // Validate form
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        name: `${firstName} ${lastName}`,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });

      // Navigate to OTP verification screen with email
      router.push({
        pathname: '/auth/otp-verification',
        params: {
          email: response.email || email.trim().toLowerCase(),
          userId: response.id,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);

      // Extract and display error message
      const errorMessage = error.message || 'Không thể đăng ký. Vui lòng thử lại.';

      Alert.alert(
        'Đăng ký thất bại',
        errorMessage
      );
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
              source={require('@/assets/logos/logo-light.webp')}
              className='mb-4 h-16 w-16'
              resizeMode='contain'
            />
            <Text className='text-center text-lg font-medium text-orange-600'>
              Tạo Tài Khoản
            </Text>
            <Text className='mt-2 text-center text-sm text-orange-500'>
              Tham gia AHome Villa ngay hôm nay
            </Text>
          </View>

          {/* Register Form */}
          <View className='space-y-4'>
            <View className='flex-row space-x-3'>
              <View className='flex-1'>
                <Text className='mb-2 text-sm font-medium text-orange-800'>
                  Họ
                </Text>
                <Input
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder='Nhập họ'
                  editable={!isLoading}
                  className='border-orange-200 bg-white focus:border-orange-400'
                />
              </View>
              <View className='flex-1'>
                <Text className='mb-2 text-sm font-medium text-orange-800'>
                  Tên
                </Text>
                <Input
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder='Nhập tên'
                  editable={!isLoading}
                  className='border-orange-200 bg-white focus:border-orange-400'
                />
              </View>
            </View>

            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                Địa chỉ Email
              </Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder='Nhập email của bạn'
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                editable={!isLoading}
                className='border-orange-200 bg-white focus:border-orange-400'
              />
            </View>

            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                Số Điện Thoại
              </Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder='Nhập số điện thoại'
                keyboardType='phone-pad'
                autoComplete='tel'
                editable={!isLoading}
                className='border-orange-200 bg-white focus:border-orange-400'
              />
            </View>

            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                Mật Khẩu
              </Text>
              <View className='relative'>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder='Tạo mật khẩu'
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  <Text className='text-sm font-medium text-orange-600'>
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                Xác Nhận Mật Khẩu
              </Text>
              <View className='relative'>
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder='Nhập lại mật khẩu'
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  <Text className='text-sm font-medium text-orange-600'>
                    {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <View>
              <Button
                title={isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
                onPress={handleRegister}
                variant='primary'
                fullWidth
                disabled={isLoading}
                style={{ marginTop: 24, backgroundColor: '#f97316' }}
              />
            </View>
          </View>

          {/* Login Link */}
          <View className='mt-6 flex-row items-center justify-center'>
            <Text className='text-sm text-orange-700'>
              Đã có tài khoản?{' '}
            </Text>
            <Link href='/auth/login' asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text className='text-sm font-semibold text-orange-600'>
                  Đăng Nhập
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
