import { router, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from './useAuth';

export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/profile');
    }
  }, [user, loading, segments]);
}
