import type { LoginDto } from '@ahomevilla-hotel/node-sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import { authService } from '@/services/auth/authService';

// Query keys for React Query
export const AUTH_QUERY_KEYS = {
  isAuthenticated: ['auth', 'isAuthenticated'] as const,
} as const;

/**
 * Minimal authentication hook using React Query and service layer
 * Provides authentication state management with caching and error handling
 * Only supports login, logout, and authentication status
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check authentication status with React Query
  const {
    data: isAuthenticated = false,
    isLoading: isCheckingAuth,
    error: authError,
    isSuccess,
  } = useQuery({
    queryKey: AUTH_QUERY_KEYS.isAuthenticated,
    queryFn: authService.isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Set initialized when the first auth check completes
  useEffect(() => {
    if (isSuccess && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isSuccess, isInitialized]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginDto) => authService.login(credentials),
    onSuccess: async () => {
      // Immediately update the auth state to true
      queryClient.setQueryData(AUTH_QUERY_KEYS.isAuthenticated, true);

      // Then refetch to ensure it's in sync
      await queryClient.refetchQueries({
        queryKey: AUTH_QUERY_KEYS.isAuthenticated,
      });

      setIsInitialized(true);
    },
    onError: error => {
      console.error('Login failed:', error);
      // Clear any stale data
      queryClient.setQueryData(AUTH_QUERY_KEYS.isAuthenticated, false);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all auth-related data
      queryClient.setQueryData(AUTH_QUERY_KEYS.isAuthenticated, false);
      queryClient.clear(); // Clear all cached data on logout
      setIsInitialized(false);
    },
    onError: error => {
      console.error('Logout failed:', error);
      // Force clear even if logout API fails
      queryClient.setQueryData(AUTH_QUERY_KEYS.isAuthenticated, false);
    },
  });

  // Computed loading state
  const isLoading =
    isCheckingAuth ||
    loginMutation.isPending ||
    logoutMutation.isPending ||
    (!isInitialized && isAuthenticated);

  return {
    // Authentication state
    isAuthenticated,
    isLoading,
    isInitialized,

    // Mutations
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Errors
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    authError,

    // Utility functions
    refetchAuth: () =>
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.isAuthenticated,
      }),
    clearAuthData: () => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.isAuthenticated, false);
    },
  };
};

/**
 * Hook for making authenticated API calls with React Query patterns
 * Use this for other API calls that require authentication
 */
export const useAuthenticatedQuery = <TData = unknown>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    retry?: boolean | number;
  }
) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey,
    queryFn,
    enabled: isAuthenticated && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    retry: options?.retry ?? 2,
  });
};
