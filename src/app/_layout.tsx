import './styles/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';

import { ProtectedRoute } from '@/components/layout';

// Initialize i18n
import '@/i18n';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

/**
 * Root layout component that provides app-wide context and routing shell.
 *
 * Renders the React Query provider with the preconfigured query client, wraps
 * content with an authentication gate (ProtectedRoute), and defines the
 * top-level navigation Stack containing the '(tabs)' screen (header hidden).
 *
 * @returns The root JSX element for the app's layout.
 */
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProtectedRoute>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        </Stack>
      </ProtectedRoute>
    </QueryClientProvider>
  );
}
