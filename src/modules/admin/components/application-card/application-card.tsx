import { formatVotes } from '@/modules/nominations';
import { Button } from '@/shared/components';
import { approveApplication, rejectApplication } from '../../api/admin-api';
import { useAdminAction } from '../../model/use-admin-action';
import type { Application } from '../../model/types';
import styles from './application-card.module.scss';

type ApplicationCardProps = {
  application: Application;
  onReviewed: () => void;
};

const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });

export function ApplicationCard({ application, onReviewed }: ApplicationCardProps) {
  const { run, isRunning, error } = useAdminAction(onReviewed);
  const isPending = application.status === 'pending';

  return (
    <article className={styles.card}>
      <div className={styles.body}>
        <p className={styles.nomination}>«{application.nominationTitle}»</p>
        <h3 className={styles.nominee}>
          {application.nomineeName}
          <span className={styles.supports}>{formatVotes(application.supports)}</span>
        </h3>
        {application.comment && <p className={styles.comment}>{application.comment}</p>}
        <p className={styles.meta}>
          {application.authorName} · {application.authorEmail} ·{' '}
          {dateFormat.format(new Date(application.createdAt))}
        </p>
        {error && (
          <p className={styles.error} role='alert'>
            {error}
          </p>
        )}
      </div>

      {isPending && (
        <div className={styles.actions}>
          <Button
            size='small'
            disabled={isRunning}
            onClick={() => run(() => approveApplication(application.id))}
          >
            Одобрить
          </Button>
          <Button
            variant='danger'
            size='small'
            disabled={isRunning}
            onClick={() => run(() => rejectApplication(application.id))}
          >
            Отклонить
          </Button>
        </div>
      )}
    </article>
  );
}
