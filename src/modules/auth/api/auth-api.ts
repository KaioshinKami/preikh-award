import { apiRequest } from '@/shared/api/api';
import type { LoginCredentials, RegisterDetails, User } from '../model/types';

type UserResponse = { user: User };

export async function fetchCurrentUser(): Promise<User | null> {
  const { user } = await apiRequest<{ user: User | null }>('/auth/me');
  return user;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const { user } = await apiRequest<UserResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  });
  return user;
}

export async function register(details: RegisterDetails): Promise<User> {
  const { user } = await apiRequest<UserResponse>('/auth/register', {
    method: 'POST',
    body: details,
  });
  return user;
}

export async function logout(): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST' });
}
