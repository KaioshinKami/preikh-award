import type { AuthMode } from '../model/types';

export type AuthFormErrorTexts = {
  nameTooShort: (minLength: number) => string;
  invalidEmail: string;
  passwordTooShort: (minLength: number) => string;
  passwordRequired: string;
};

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

export function validateAuthForm(
  values: AuthFormValues,
  mode: AuthMode,
  texts: AuthFormErrorTexts,
): AuthFormErrors {
  const errors: AuthFormErrors = {};
  const isRegister = mode === 'register';

  if (isRegister && values.name.length < MIN_NAME_LENGTH) {
    errors.name = texts.nameTooShort(MIN_NAME_LENGTH);
  }
  if (!EMAIL_PATTERN.test(values.email)) errors.email = texts.invalidEmail;
  if (isRegister && values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = texts.passwordTooShort(MIN_PASSWORD_LENGTH);
  }
  if (!isRegister && !values.password) errors.password = texts.passwordRequired;

  return errors;
}
