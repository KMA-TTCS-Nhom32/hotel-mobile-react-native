import './styles/global.css';

import { Stack } from 'expo-router';
import React from 'react';

// Initialize i18n
import '@/i18n';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    </Stack>
  );
}
