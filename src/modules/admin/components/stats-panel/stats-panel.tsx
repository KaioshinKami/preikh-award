import { Button } from '@/shared/components';
import { useAsyncData } from '@/shared/hooks/use-async-data';
import { fetchStats } from '../../api/admin-api';
import { AdminPanel } from '../admin-panel/admin-panel';
import { NominationResults } from '../nomination-results/nomination-results';
import { VotesByDayChart } from '../votes-by-day-chart/votes-by-day-chart';
import styles from './stats-panel.module.scss';

const numberFormat = new Intl.NumberFormat('ru-RU');

export function StatsPanel() {
  const { data: stats, error, isLoading, reload } = useAsyncData(fetchStats, []);

  const refreshButton = (
    <Button variant='ghost' size='small' disabled={isLoading} onClick={reload}>
      Обновить
    </Button>
  );

  const tiles = stats
    ? [
        { label: 'Голосов', value: stats.totals.votes },
        { label: 'Проголосовавших', value: stats.totals.voters },
        { label: 'Пользователей', value: stats.totals.users },
        { label: 'Заявок ждут проверки', value: stats.totals.pendingApplications },
      ]
    : [];

  return (
    <>
      <AdminPanel title='Статистика' actions={refreshButton} error={error}>
        {!stats && isLoading && <p className={styles.muted}>Загружаем статистику…</p>}
        {stats && (
          <>
            <ul className={styles.tiles}>
              {tiles.map((tile) => (
                <li key={tile.label} className={styles.tile}>
                  <span className={styles.tileValue}>{numberFormat.format(tile.value)}</span>
                  <span className={styles.tileLabel}>{tile.label}</span>
                </li>
              ))}
            </ul>
            <VotesByDayChart votesByDay={stats.votesByDay} />
          </>
        )}
      </AdminPanel>

      {stats && (
        <AdminPanel title='Голоса по номинациям'>
          <ul className={styles.results}>
            {stats.nominations.map((nomination) => (
              <li key={nomination.id}>
                <NominationResults nomination={nomination} />
              </li>
            ))}
          </ul>
        </AdminPanel>
      )}
    </>
  );
}
