import { Button } from '@/shared/components';
import { useAuth } from '../../model/use-auth';
import styles from './account-controls.module.scss';

export function AccountControls() {
  const { user, isLoading, openAuthDialog, signOut } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return (
      <Button variant='ghost' size='small' onClick={() => openAuthDialog('login')}>
        Войти
      </Button>
    );
  }

  return (
    <div className={styles.account}>
      {user.role === 'admin' && (
        <a className={styles.adminLink} href='/admin'>
          Админка
        </a>
      )}
      <span className={styles.name} title={user.email}>
        {user.name}
      </span>
      <Button variant='ghost' size='small' onClick={signOut}>
        Выйти
      </Button>
    </div>
  );
}
