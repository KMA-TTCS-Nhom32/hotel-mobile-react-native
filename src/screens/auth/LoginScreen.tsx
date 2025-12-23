import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { InputText } from '@/components/forms';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/hooks/useAuth';
import { useAuthTranslation } from '@/i18n/hooks';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { createLoginSchema, LoginFormData } from '@/utils/validation';

/**
 * Login screen with modern UI design
 * Supports login with email or phone number
 */
export const LoginScreen = () => {
  const { t } = useAuthTranslation();
  const { login, isLoggingIn } = useAuth();
  const { setUser } = useAuthStore();
  const router = useRouter();

  // Create form with Zod validation
  const form = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      emailOrPhone: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        emailOrPhone: data.emailOrPhone.trim(),
        password: data.password,
      });

      // Login successful, now get user profile
      const userProfile = await authService.getProfile();
      setUser(userProfile);

      // Show success message
      showSuccessToast(t('success.loginSuccess'), t('welcome'));

      router.push(ROUTES.HOME);

      // Navigation will be handled by the ProtectedRoute wrapper
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.generic');

      // Show error toast instead of Alert
      showErrorToast(errorMessage, t('errors.loginFailed'));
    }
  };

  return (
    <KeyboardAvoidingView
      className='flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className='bg-primary-light'
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        <View className='flex-1 justify-center px-6 py-12'>
          {/* Logo Section */}
          <View className='mb-12 items-center'>
            <Image
              source={require('@/assets/logos/logo-large-light.png')}
              className='mb-4 h-16 w-64'
              contentFit='contain'
            />
            <Text className='text-center text-lg font-medium text-orange-600'>
              {t('welcome')}
            </Text>
            <Text className='mt-2 text-center text-sm text-orange-500'>
              {t('welcomeSubtitle')}
            </Text>
          </View>

          {/* Login Form */}
          <FormProvider {...form}>
            <View className='space-y-6'>
              <InputText
                name='emailOrPhone'
                label={t('form.emailOrPhone')}
                placeholder={t('form.emailOrPhone')}
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                textContentType='emailAddress'
                required
                labelStyle={{ color: '#9a3412' }}
                inputStyle={{
                  borderColor: '#fed7aa',
                  backgroundColor: 'white',
                }}
              />

              <InputText
                name='password'
                label={t('form.password')}
                placeholder={t('form.password')}
                isPassword
                required
                labelStyle={{ color: '#9a3412' }}
                inputStyle={{
                  borderColor: '#fed7aa',
                  backgroundColor: 'white',
                }}
              />

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
                onPress={form.handleSubmit(onSubmit)}
                disabled={isLoggingIn || !form.formState.isValid}
                loading={isLoggingIn}
                variant='primary'
                fullWidth
                style={{ marginTop: 32, backgroundColor: '#f97316' }}
              />
            </View>
          </FormProvider>

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
