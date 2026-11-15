import { useState } from 'react';
import { useAsyncData } from '@/shared/hooks/use-async-data';
import { fetchApplications } from '../../api/admin-api';
import type { ApplicationStatus } from '../../model/types';
import { AdminPanel } from '../admin-panel/admin-panel';
import { ApplicationCard } from '../application-card/application-card';
import styles from './applications-panel.module.scss';

const STATUS_FILTERS: { status: ApplicationStatus; label: string }[] = [
  { status: 'pending', label: 'Ждут проверки' },
  { status: 'approved', label: 'Одобрены' },
  { status: 'rejected', label: 'Отклонены' },
];

export function ApplicationsPanel() {
  const [status, setStatus] = useState<ApplicationStatus>('pending');
  const {
    data: applications,
    error,
    isLoading,
    reload,
  } = useAsyncData(() => fetchApplications(status), [status]);

  const filters = (
    <div className={styles.filters} role='group' aria-label='Статус заявок'>
      {STATUS_FILTERS.map((filter) => (
        <button
          key={filter.status}
          type='button'
          className={styles.filter}
          aria-pressed={filter.status === status}
          onClick={() => setStatus(filter.status)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );

  return (
    <AdminPanel title='Заявки' actions={filters} error={error}>
      {isLoading && !applications && <p className={styles.muted}>Загружаем заявки…</p>}
      {applications?.length === 0 && <p className={styles.muted}>Заявок нет.</p>}
      <div className={styles.list}>
        {applications?.map((application) => (
          <ApplicationCard key={application.id} application={application} onReviewed={reload} />
        ))}
      </div>
    </AdminPanel>
  );
}
