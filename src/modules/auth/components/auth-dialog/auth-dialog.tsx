import { useEffect, useRef, type MouseEvent } from 'react';
import { useMessages } from '@/shared/i18n';
import { AUTH_MESSAGES } from '../../model/auth-messages';
import type { AuthMode } from '../../model/types';
import { AuthForm } from '../auth-form/auth-form';
import styles from './auth-dialog.module.scss';

type AuthDialogProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
};

export function AuthDialog({ mode, onModeChange, onClose }: AuthDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = useMessages(AUTH_MESSAGES);
  const copy = t.dialog[mode];
  const otherMode: AuthMode = mode === 'login' ? 'register' : 'login';

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = () => dialogRef.current?.close();
  // A click on the dialog element itself (not its content) is a click on the backdrop.
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) handleClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby='auth-dialog-title'
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <div className={styles.content}>
        <button type='button' className={styles.close} aria-label={t.close} onClick={handleClose}>
          ×
        </button>
        <h2 id='auth-dialog-title' className={styles.title}>
          {copy.title}
        </h2>
        <p className={styles.lead}>{copy.lead}</p>
        <AuthForm key={mode} mode={mode} onSuccess={handleClose} />
        <p className={styles.switch}>
          {copy.switchText}{' '}
          <button
            type='button'
            className={styles.switchButton}
            onClick={() => onModeChange(otherMode)}
          >
            {copy.switchAction}
          </button>
        </p>
      </div>
    </dialog>
  );
}
