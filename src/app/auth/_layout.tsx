import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { LanguageSelectMenu } from '@/components/ui';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerRight: () => (
          <View className='mr-4'>
            <LanguageSelectMenu />
          </View>
        ),
        headerLeft: () => null,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name='login' />
      <Stack.Screen name='register' />
      <Stack.Screen name='forgot-password' />
    </Stack>
  );
}
