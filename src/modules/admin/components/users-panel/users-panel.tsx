import { useState } from 'react';
import { useAuth } from '@/modules/auth';
import { Button, TextField } from '@/shared/components';
import { useAsyncData } from '@/shared/hooks/use-async-data';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { deleteUser, fetchUsers, updateUserRole } from '../../api/admin-api';
import { useAdminAction } from '../../model/use-admin-action';
import type { AdminUser } from '../../model/types';
import { AdminPanel } from '../admin-panel/admin-panel';
import tableStyles from '../admin-table/admin-table.module.scss';
import styles from './users-panel.module.scss';

type UsersPanelProps = {
  onShowVotes: (userId: number) => void;
};

const SEARCH_DELAY_MS = 300;
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' });

export function UsersPanel({ onShowVotes }: UsersPanelProps) {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DELAY_MS);
  const {
    data: users,
    error: loadError,
    isLoading,
    reload,
  } = useAsyncData(() => fetchUsers(debouncedSearch), [debouncedSearch]);
  const { run, isRunning, error: actionError } = useAdminAction(reload);

  const handleRoleToggle = (user: AdminUser) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const question =
      nextRole === 'admin'
        ? `Сделать ${user.name} администратором? Аккаунт получит полный доступ к админке.`
        : `Снять права администратора с ${user.name}?`;
    if (!window.confirm(question)) return;
    void run(() => updateUserRole(user.id, nextRole));
  };

  const handleDelete = (user: AdminUser) => {
    const question =
      `Удалить аккаунт ${user.name} (${user.email})? ` +
      `Вместе с ним удалятся голоса (${user.votes}) и заявки (${user.applications}). Это нельзя отменить.`;
    if (!window.confirm(question)) return;
    void run(() => deleteUser(user.id));
  };

  const counter = users && <span className={styles.counter}>Найдено: {users.length}</span>;

  return (
    <AdminPanel title='Все пользователи' actions={counter} error={loadError ?? actionError}>
      <div className={styles.search}>
        <TextField
          label='Поиск'
          type='search'
          placeholder='Имя или email'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {!users && isLoading && <p className={tableStyles.muted}>Загружаем пользователей…</p>}
      {users?.length === 0 && (
        <p className={tableStyles.muted}>
          {debouncedSearch ? 'Никого не нашли.' : 'Пользователей пока нет.'}
        </p>
      )}

      {users && users.length > 0 && (
        <div className={tableStyles.scroller}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th className={tableStyles.numeric}>Голосов</th>
                <th className={tableStyles.numeric}>Заявок</th>
                <th>Регистрация</th>
                <th>
                  <span className='visually-hidden'>Действия</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id;
                return (
                  <tr key={user.id}>
                    <td>
                      <div className={tableStyles.primary}>
                        {user.name}
                        {isSelf && <span className={styles.self}> (вы)</span>}
                      </div>
                      <div className={tableStyles.secondary}>{user.email}</div>
                    </td>
                    <td>
                      <span className={styles.role} data-role={user.role}>
                        {user.role === 'admin' ? 'Админ' : 'Участник'}
                      </span>
                    </td>
                    <td className={tableStyles.numeric}>{user.votes}</td>
                    <td className={tableStyles.numeric}>{user.applications}</td>
                    <td className={tableStyles.nowrap}>
                      {dateFormat.format(new Date(user.createdAt))}
                    </td>
                    <td>
                      <div className={tableStyles.actions}>
                        <Button
                          variant='ghost'
                          size='small'
                          disabled={user.votes === 0}
                          onClick={() => onShowVotes(user.id)}
                        >
                          Голоса
                        </Button>
                        <Button
                          variant='ghost'
                          size='small'
                          disabled={isSelf || isRunning}
                          title={isSelf ? 'Свою роль изменить нельзя' : undefined}
                          onClick={() => handleRoleToggle(user)}
                        >
                          {user.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
                        </Button>
                        <Button
                          variant='danger'
                          size='small'
                          disabled={isSelf || isRunning}
                          title={isSelf ? 'Свой аккаунт удалить нельзя' : undefined}
                          onClick={() => handleDelete(user)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminPanel>
  );
}
