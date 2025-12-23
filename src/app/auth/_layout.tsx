import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { LanguageSelectMenu } from '@/components/ui';
import { HEX_COLORS } from '@/config/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerTintColor: HEX_COLORS.primary.main,
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
