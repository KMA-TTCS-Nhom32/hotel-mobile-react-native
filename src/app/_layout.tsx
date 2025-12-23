import './styles/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';

import { ProtectedRoute } from '@/components/layout';
// Initialize i18n
import '@/i18n';
import { ROUTES_WITHOUT_SLASH, ROUTES as appRoutes } from '@/config/routes';
// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

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
      {/* Toast notifications - must be at root level */}
      <Toast />
    </QueryClientProvider>
  );
}
