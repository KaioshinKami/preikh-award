import { useEffect, useState } from 'react';
import { formatVotes } from '@/modules/nominations';
import { Button, SelectField, TextField } from '@/shared/components';
import { useAsyncData } from '@/shared/hooks/use-async-data';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { deleteVote, fetchAdminNominations, fetchVotes } from '../../api/admin-api';
import { useAdminAction } from '../../model/use-admin-action';
import type { AdminVote } from '../../model/types';
import { AdminPanel } from '../admin-panel/admin-panel';
import tableStyles from '../admin-table/admin-table.module.scss';
import styles from './votes-panel.module.scss';

type VotesPanelProps = {
  // Shows only this user's votes (opened from the users list).
  userId: number | null;
  onClearUser: () => void;
};

const PAGE_SIZE = 50;
const SEARCH_DELAY_MS = 300;
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
const numberFormat = new Intl.NumberFormat('ru-RU');

export function VotesPanel({ userId, onClearUser }: VotesPanelProps) {
  const { data: nominations } = useAsyncData(fetchAdminNominations, []);
  const [nominationId, setNominationId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DELAY_MS);

  const {
    data: votesPage,
    error: loadError,
    isLoading,
    reload,
  } = useAsyncData(
    () =>
      fetchVotes({
        userId,
        nominationId,
        search: debouncedSearch,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    [userId, nominationId, debouncedSearch, page],
  );
  const { run, isRunning, error: actionError } = useAdminAction(reload);

  const total = votesPage?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Annulling the last vote on the last page leaves it empty: step back to the new last page.
  useEffect(() => {
    if (page >= pageCount) setPage(pageCount - 1);
  }, [page, pageCount]);

  const handleAnnul = (vote: AdminVote) => {
    const question =
      `Аннулировать голос ${vote.userName} за «${vote.nomineeName}» в номинации «${vote.nominationTitle}»? ` +
      'Пользователь сможет проголосовать в этой номинации заново.';
    if (!window.confirm(question)) return;
    void run(() => deleteVote(vote.id));
  };

  const nominationOptions = [
    { value: '', label: 'Все номинации' },
    ...(nominations ?? []).map((nomination) => ({
      value: String(nomination.id),
      label: nomination.title,
    })),
  ];

  const firstShown = page * PAGE_SIZE + 1;
  const lastShown = Math.min(total, (page + 1) * PAGE_SIZE);

  return (
    <AdminPanel
      title='Журнал голосов'
      actions={votesPage && <span className={styles.total}>{formatVotes(total)}</span>}
      error={loadError ?? actionError}
    >
      {userId && (
        <div className={styles.userFilter}>
          <p>
            Голоса пользователя <strong>{votesPage?.user?.name ?? `#${userId}`}</strong>
            {votesPage?.user && <span className={styles.userEmail}> · {votesPage.user.email}</span>}
          </p>
          <Button variant='ghost' size='small' onClick={onClearUser}>
            Показать всех
          </Button>
        </div>
      )}

      <div className={styles.filters}>
        <SelectField
          label='Номинация'
          options={nominationOptions}
          value={nominationId ?? ''}
          onChange={(event) => {
            setNominationId(event.target.value ? Number(event.target.value) : null);
            setPage(0);
          }}
        />
        <TextField
          label='Поиск'
          type='search'
          placeholder='Имя, email или номинант'
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
        />
      </div>

      {!votesPage && isLoading && <p className={tableStyles.muted}>Загружаем голоса…</p>}
      {votesPage?.votes.length === 0 && <p className={tableStyles.muted}>Голосов не найдено.</p>}

      {votesPage && votesPage.votes.length > 0 && (
        <>
          <div className={tableStyles.scroller}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Кто голосовал</th>
                  <th>Номинация</th>
                  <th>За кого</th>
                  <th>
                    <span className='visually-hidden'>Действия</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {votesPage.votes.map((vote) => (
                  <tr key={vote.id}>
                    <td className={tableStyles.nowrap}>
                      {dateFormat.format(new Date(vote.createdAt))}
                    </td>
                    <td>
                      <div className={tableStyles.primary}>{vote.userName}</div>
                      <div className={tableStyles.secondary}>{vote.userEmail}</div>
                    </td>
                    <td className={styles.nomination}>{vote.nominationTitle}</td>
                    <td className={tableStyles.primary}>{vote.nomineeName}</td>
                    <td>
                      <div className={tableStyles.actions}>
                        <Button
                          variant='danger'
                          size='small'
                          disabled={isRunning}
                          onClick={() => handleAnnul(vote)}
                        >
                          Аннулировать
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pager}>
            <span className={styles.range}>
              {numberFormat.format(firstShown)}–{numberFormat.format(lastShown)} из{' '}
              {numberFormat.format(total)}
            </span>
            <div className={styles.pagerButtons}>
              <Button
                variant='ghost'
                size='small'
                disabled={page === 0 || isLoading}
                onClick={() => setPage(page - 1)}
              >
                Назад
              </Button>
              <Button
                variant='ghost'
                size='small'
                disabled={page >= pageCount - 1 || isLoading}
                onClick={() => setPage(page + 1)}
              >
                Дальше
              </Button>
            </div>
          </div>
        </>
      )}
    </AdminPanel>
  );
}
