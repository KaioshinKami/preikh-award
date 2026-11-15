export type User = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

export type AuthMode = 'login' | 'register';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterDetails = LoginCredentials & {
  name: string;
};

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (details: RegisterDetails) => Promise<void>;
  signOut: () => Promise<void>;
  openAuthDialog: (mode?: AuthMode) => void;
};
