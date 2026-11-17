import { Button } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { AUTH_MESSAGES } from '../../model/auth-messages';
import { useAuth } from '../../model/use-auth';
import styles from './account-controls.module.scss';

export function AccountControls() {
  const t = useMessages(AUTH_MESSAGES).account;
  const { user, isLoading, openAuthDialog, signOut } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return (
      <Button variant='ghost' size='small' onClick={() => openAuthDialog('login')}>
        {t.signIn}
      </Button>
    );
  }

  return (
    <div className={styles.account}>
      {user.role === 'admin' && (
        <a className={styles.adminLink} href='/admin'>
          {t.admin}
        </a>
      )}
      <span className={styles.name} title={user.email}>
        {user.name}
      </span>
      <Button variant='ghost' size='small' onClick={signOut}>
        {t.signOut}
      </Button>
    </div>
  );
}
