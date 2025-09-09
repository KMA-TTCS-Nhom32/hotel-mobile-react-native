import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ROUTES } from '@/config/routes';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

import { LoadingSpinner } from '../ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route wrapper that ensures user is authenticated
 * Uses React Query for auth state and Zustand for user data
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  const { user, setUser, loadProfile } = useAuthStore();

  // Load user profile after successful authentication
  useEffect(() => {
    if (isAuthenticated && !user) {
      loadProfile()
        .then(profile => {
          if (profile) {
            setUser(profile);
          }
        })
        .catch(error => {
          console.error('Failed to load profile:', error);
        });
    }
  }, [isAuthenticated, user, loadProfile, setUser]);

  // Show loading while checking authentication or loading profile
  if (isLoading || !isInitialized || (isAuthenticated && !user)) {
    return (
      <View className='flex-1 items-center justify-center bg-orange-50'>
        <LoadingSpinner variant='modern' />
      </View>
    );
  }

  // Show fallback (auth stack) if not authenticated
  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {Object.entries(ROUTES.AUTH).map(([key, route]) => (
          <Stack.Screen key={key} name={route} />
        ))}
      </Stack>
    );
  }

  // Show protected content if authenticated and user data is loaded
  return <>{children}</>;
};
