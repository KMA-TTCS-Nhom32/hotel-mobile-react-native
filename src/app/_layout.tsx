import './styles/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from 'react-native-toast-message';

import { ProtectedRoute } from '@/components/layout';
// Initialize i18n
import '@/i18n';
import { ROUTES_WITHOUT_SLASH, ROUTES as appRoutes } from '@/config/routes';

import { HEX_COLORS } from '../config';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Custom toast configuration with larger text
const toastConfig: ToastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: HEX_COLORS.success.main,
        borderLeftWidth: 6,
        backgroundColor: '#f0fdf4',
        minHeight: 70,
        paddingVertical: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#166534',
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: '500',
        color: '#15803d',
      }}
      text2NumberOfLines={3}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: HEX_COLORS.error.main,
        borderLeftWidth: 6,
        backgroundColor: '#fef2f2',
        minHeight: 70,
        paddingVertical: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#991b1b',
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: '500',
        color: '#dc2626',
      }}
      text2NumberOfLines={3}
    />
  ),
  info: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3b82f6',
        borderLeftWidth: 6,
        backgroundColor: '#eff6ff',
        minHeight: 70,
        paddingVertical: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#1e40af',
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: '500',
        color: '#2563eb',
      }}
      text2NumberOfLines={3}
    />
  ),
  // Custom warning toast
  warning: ({ text1, text2 }) => (
    <View
      style={{
        minHeight: 70,
        width: '90%',
        backgroundColor: '#fffbeb',
        borderLeftColor: '#f59e0b',
        borderLeftWidth: 6,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#92400e' }}>
        {text1}
      </Text>
      {text2 && (
        <Text
          style={{ fontSize: 14, fontWeight: '500', color: '#d97706' }}
          numberOfLines={3}
        >
          {text2}
        </Text>
      )}
    </View>
  ),
};

export default function RootLayout() {
  const ROUTES = ROUTES_WITHOUT_SLASH as typeof appRoutes;

  return (
    <QueryClientProvider client={queryClient}>
      <ProtectedRoute>
        <Stack
          screenOptions={{
            headerShown: false,
            headerTransparent: true,
          }}
        >
          <Stack.Screen name={ROUTES.HOME} />
          <Stack.Screen name={ROUTES.BRANCHES.DETAIL('[idOrSlug]')} />
          <Stack.Screen name={ROUTES.ROOMS.DETAIL('[id]')} />
          <Stack.Screen name={ROUTES.ROOMS.FILTERED} />
          <Stack.Screen name={ROUTES.PAYMENT.INDEX} />
          <Stack.Screen name={ROUTES.PAYMENT.QR_CONFIRMATION} />
          <Stack.Screen name={ROUTES.PAYMENT.SUCCESS} />
          <Stack.Screen name={ROUTES.ACCOUNT.EDIT_PROFILE} />
        </Stack>
      </ProtectedRoute>
      {/* Toast notifications with custom styling */}
      <Toast config={toastConfig} />
    </QueryClientProvider>
  );
}
