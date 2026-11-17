import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/shared/api/api';
import { Button, TextField } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import {
  MIN_PASSWORD_LENGTH,
  readAuthForm,
  validateAuthForm,
  type AuthFormErrors,
} from '../../lib/validate-auth-form';
import { AUTH_MESSAGES } from '../../model/auth-messages';
import { useAuth } from '../../model/use-auth';
import type { AuthMode } from '../../model/types';
import styles from './auth-form.module.scss';

type AuthFormProps = {
  mode: AuthMode;
  onSuccess: () => void;
};

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const t = useMessages(AUTH_MESSAGES);
  const { signIn, signUp } = useAuth();
  const [fieldErrors, setFieldErrors] = useState<AuthFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === 'register';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name, email, password } = readAuthForm(new FormData(event.currentTarget));
    const errors = validateAuthForm({ name, email, password }, mode, t.errors);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (isRegister) await signUp({ name, email, password });
      else await signIn({ email, password });
      onSuccess();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {isRegister && (
        <TextField
          label={t.fields.name}
          name='name'
          autoComplete='name'
          maxLength={60}
          error={fieldErrors.name}
        />
      )}
      <TextField
        label={t.fields.email}
        name='email'
        type='email'
        autoComplete='email'
        error={fieldErrors.email}
      />
      <TextField
        label={t.fields.password}
        name='password'
        type='password'
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        hint={isRegister ? t.passwordHint(MIN_PASSWORD_LENGTH) : undefined}
        error={fieldErrors.password}
      />
      {submitError && (
        <p className={styles.error} role='alert'>
          {submitError}
        </p>
      )}
      <Button type='submit' disabled={isSubmitting}>
        {t.submit[mode]}
      </Button>
    </form>
  );
}
