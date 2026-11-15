import { createContext, useContext } from 'react';
import type { AuthContextValue } from './types';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error('useAuth must be used inside <AuthProvider>');
  return authContext;
}
