import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from '../../model/use-auth';
import { useAuthSession } from '../../model/use-auth-session';
import type { AuthMode } from '../../model/types';
import { AuthDialog } from '../auth-dialog/auth-dialog';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoading, signIn, signUp, signOut } = useAuthSession();
  const [dialogMode, setDialogMode] = useState<AuthMode | null>(null);

  const openAuthDialog = useCallback((mode: AuthMode = 'login') => setDialogMode(mode), []);
  const closeAuthDialog = useCallback(() => setDialogMode(null), []);

  const authContextValue = useMemo(
    () => ({ user, isLoading, signIn, signUp, signOut, openAuthDialog }),
    [user, isLoading, signIn, signUp, signOut, openAuthDialog],
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
      {dialogMode && (
        <AuthDialog mode={dialogMode} onModeChange={setDialogMode} onClose={closeAuthDialog} />
      )}
    </AuthContext.Provider>
  );
}
