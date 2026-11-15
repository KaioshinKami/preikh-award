import type { AuthMode } from '../model/types';

export type AuthFormValues = {
  name: string;
  email: string;
  password: string;
};

export type AuthFormErrors = Partial<Record<keyof AuthFormValues, string>>;

// Mirrors the server rules so most mistakes are caught before a request.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_NAME_LENGTH = 2;
export const MIN_PASSWORD_LENGTH = 8;

export function readAuthForm(formData: FormData): AuthFormValues {
  return {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  };
}

export function validateAuthForm(values: AuthFormValues, mode: AuthMode): AuthFormErrors {
  const errors: AuthFormErrors = {};
  const isRegister = mode === 'register';

  if (isRegister && values.name.length < MIN_NAME_LENGTH) {
    errors.name = `Введите имя — минимум ${MIN_NAME_LENGTH} символа`;
  }
  if (!EMAIL_PATTERN.test(values.email)) errors.email = 'Введите корректный email';
  if (isRegister && values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов`;
  }
  if (!isRegister && !values.password) errors.password = 'Введите пароль';

  return errors;
}
