import { useCallback, useEffect, useState } from 'react';
import { fetchCurrentUser, login, logout, register } from '../api/auth-api';
import type { LoginCredentials, RegisterDetails, User } from './types';

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    setUser(await login(credentials));
  }, []);

  const signUp = useCallback(async (details: RegisterDetails) => {
    setUser(await register(details));
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  }, []);

  return { user, isLoading, signIn, signUp, signOut };
}
