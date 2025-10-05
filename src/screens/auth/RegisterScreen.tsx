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

/**
 * Register screen (UI only for now)
 * Will be connected to API in future
 */
export const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    Alert.alert(
      'Coming Soon',
      'Registration functionality will be implemented soon'
    );
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
              Create Account
            </Text>
            <Text className='mt-2 text-center text-sm text-orange-500'>
              Join AHome Villa today
            </Text>
          </View>

          {/* Register Form */}
          <View className='space-y-4'>
            <View className='flex-row space-x-3'>
              <View className='flex-1'>
                <Text className='mb-2 text-sm font-medium text-orange-800'>
                  First Name
                </Text>
                <Input
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder='First name'
                  className='border-orange-200 bg-white focus:border-orange-400'
                />
              </View>
              <View className='flex-1'>
                <Text className='mb-2 text-sm font-medium text-orange-800'>
                  Last Name
                </Text>
                <Input
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder='Last name'
                  className='border-orange-200 bg-white focus:border-orange-400'
                />
              </View>
            </View>

            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                Email Address
              </Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder='Enter your email'
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                className='border-orange-200 bg-white focus:border-orange-400'
              />
            </View>

            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                Phone Number
              </Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder='Enter your phone number'
                keyboardType='phone-pad'
                autoComplete='tel'
                className='border-orange-200 bg-white focus:border-orange-400'
              />
            </View>

            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                Password
              </Text>
              <View className='relative'>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder='Create password'
                  secureTextEntry={!showPassword}
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

            <View>
              <Text className='mb-2 text-sm font-medium text-orange-800'>
                Confirm Password
              </Text>
              <View className='relative'>
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder='Confirm password'
                  secureTextEntry={!showConfirmPassword}
                  className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  <Text className='text-sm font-medium text-orange-600'>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <Button
              title='Create Account'
              onPress={handleRegister}
              variant='primary'
              fullWidth
              style={{ marginTop: 24, backgroundColor: '#f97316' }}
            />
          </View>

          {/* Login Link */}
          <View className='mt-6 flex-row items-center justify-center'>
            <Text className='text-sm text-orange-700'>
              Already have an account?{' '}
            </Text>
            <Link href='/auth/login' asChild>
              <TouchableOpacity>
                <Text className='text-sm font-semibold text-orange-600'>
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
