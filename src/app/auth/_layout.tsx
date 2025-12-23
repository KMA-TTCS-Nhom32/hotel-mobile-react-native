import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { LanguageSelectMenu } from '@/components/ui';

// App theme color for navigation elements
const THEME_TINT_COLOR = '#f97316'; // orange-500

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerTintColor: THEME_TINT_COLOR,
        headerBackTitle: '',
        headerRight: () => (
          <View className='mr-4'>
            <LanguageSelectMenu />
          </View>
        ),
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen
        name='login'
        options={{
          headerLeft: () => null,
        }}
      />
      <Stack.Screen name='register' />
      <Stack.Screen name='forgot-password' />
    </Stack>
  );
}
