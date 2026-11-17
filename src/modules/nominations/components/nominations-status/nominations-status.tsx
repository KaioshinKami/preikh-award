import { SnowflakeIcon } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { NOMINATIONS_MESSAGES } from '../../model/nominations-messages';
import styles from './nominations-status.module.scss';

type NominationsStatusProps = {
  message: string;
  onRetry?: () => void;
};

export function NominationsStatus({ message, onRetry }: NominationsStatusProps) {
  const t = useMessages(NOMINATIONS_MESSAGES);
  const iconClassName = onRetry ? styles.icon : `${styles.icon} ${styles.spinning}`;

  return (
    <div className={styles.status} role='status'>
      <SnowflakeIcon className={iconClassName} size={32} />
      <p>{message}</p>
      {onRetry && (
        <button type='button' className={styles.retry} onClick={onRetry}>
          {t.retry}
        </button>
      )}
    </div>
  );
}
