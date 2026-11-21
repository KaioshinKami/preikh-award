import { IceLoader, SnowflakeIcon } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { NOMINATIONS_MESSAGES } from '../../model/nominations-messages';
import styles from './nominations-status.module.scss';

type NominationsStatusProps = {
  message: string;
  onRetry?: () => void;
};

// Loading shows only the ice loader (the message is kept for screen readers); an error keeps
// its text and a retry button, since the visitor has to know what went wrong.
export function NominationsStatus({ message, onRetry }: NominationsStatusProps) {
  const t = useMessages(NOMINATIONS_MESSAGES);

  if (!onRetry) {
    return (
      <div className={styles.loading} role='status'>
        <IceLoader className={styles.loader} />
        <span className='visually-hidden'>{message}</span>
      </div>
    );
  }

  return (
    <div className={styles.status} role='status'>
      <SnowflakeIcon className={styles.icon} size={32} />
      <p>{message}</p>
      <button type='button' className={styles.retry} onClick={onRetry}>
        {t.retry}
      </button>
    </div>
  );
}
