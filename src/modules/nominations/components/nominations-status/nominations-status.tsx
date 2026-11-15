import { SnowflakeIcon } from '@/shared/components';
import styles from './nominations-status.module.scss';

type NominationsStatusProps = {
  message: string;
  onRetry?: () => void;
};

export function NominationsStatus({ message, onRetry }: NominationsStatusProps) {
  const iconClassName = onRetry ? styles.icon : `${styles.icon} ${styles.spinning}`;

  return (
    <div className={styles.status} role='status'>
      <SnowflakeIcon className={iconClassName} size={32} />
      <p>{message}</p>
      {onRetry && (
        <button type='button' className={styles.retry} onClick={onRetry}>
          Попробовать снова
        </button>
      )}
    </div>
  );
}
