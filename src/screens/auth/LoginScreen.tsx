import { Link } from 'expo-router';
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
} from 'react-native';

import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAuthTranslation } from '@/i18n/hooks';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';

/**
 * Login screen with modern UI design
 * Supports login with email or phone number
 */
export const LoginScreen = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { t } = useAuthTranslation();
  const { login, isLoggingIn } = useAuth();
  const { setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!emailOrPhone.trim() || !password.trim()) {
      Alert.alert(t('errors.loginFailed'), t('errors.fillAllFields'));
      return;
    }

    try {
      await login({
        emailOrPhone: emailOrPhone.trim(),
        password,
      });

      // Login successful, now get user profile
      const userProfile = await authService.getProfile();
      setUser(userProfile);

      // Navigation will be handled by the ProtectedRoute wrapper
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');
      Alert.alert(t('errors.loginFailed'), errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      className='flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        <View className='flex-1 justify-center bg-primary-light px-6 py-12'>
          {/* Logo Section */}
          <View className='mb-12 items-center'>
            <Image
              source={require('@/assets/logos/logo-large-light.png')}
              className='mb-4 h-16 w-64'
              resizeMode='contain'
            />
            <Text className='text-center text-lg font-medium text-orange-600'>
              {t('welcome')}
            </Text>
            <Text className='mt-2 text-center text-sm text-orange-500'>
              {t('welcomeSubtitle')}
            </Text>
          </View>

          {/* Login Form */}
          <View className='space-y-6'>
            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                {t('form.emailOrPhone')}
              </Text>
              <Input
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                placeholder={t('form.emailOrPhone')}
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                textContentType='emailAddress'
                className='border-orange-200 bg-white focus:border-orange-400'
              />
            </View>

            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                {t('form.password')}
              </Text>
              <View className='relative'>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('form.password')}
                  secureTextEntry={!showPassword}
                  autoComplete='password'
                  textContentType='password'
                  className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  <Text className='text-sm font-medium text-orange-600'>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <Link href='/auth/forgot-password' asChild>
              <TouchableOpacity className='self-end'>
                <Text className='text-sm font-medium text-orange-600'>
                  {t('forgotPassword')}
                </Text>
              </TouchableOpacity>
            </Link>

            {/* Login Button */}
            <Button
              title={isLoggingIn ? t('signingIn') : t('login')}
              onPress={handleLogin}
              disabled={isLoggingIn}
              loading={isLoggingIn}
              variant='primary'
              fullWidth
              style={{ marginTop: 32, backgroundColor: '#f97316' }}
            />
          </View>

          {/* Register Link */}
          <View className='mt-8 flex-row items-center justify-center'>
            <Text className='text-sm text-orange-700'>{t('noAccount')} </Text>
            <Link href='/auth/register' asChild>
              <TouchableOpacity>
                <Text className='text-sm font-semibold text-orange-600'>
                  {t('register')}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
