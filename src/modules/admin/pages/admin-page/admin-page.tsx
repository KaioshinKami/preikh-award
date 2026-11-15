import { useState } from 'react';
import { useAuth } from '@/modules/auth';
import { Button } from '@/shared/components';
import { AdminLayout } from '../../components/admin-layout/admin-layout';
import { ApplicationsPanel } from '../../components/applications-panel/applications-panel';
import { NominationsEditor } from '../../components/nominations-editor/nominations-editor';
import { SettingsPanel } from '../../components/settings-panel/settings-panel';
import { StatsPanel } from '../../components/stats-panel/stats-panel';
import styles from './admin-page.module.scss';

type AdminTab = 'stats' | 'nominations' | 'applications';

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: 'stats', label: 'Статистика' },
  { id: 'nominations', label: 'Номинации' },
  { id: 'applications', label: 'Заявки' },
];

// The server checks the admin role on every /api/admin request; this guard only picks the screen.
export function AdminPage() {
  const { user, isLoading, openAuthDialog } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');

  if (isLoading) {
    return (
      <AdminLayout>
        <p className={styles.message}>Проверяем доступ…</p>
      </AdminLayout>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <AdminLayout>
        <div className={styles.denied}>
          <h1 className={styles.deniedTitle}>Только для администратора</h1>
          <p className={styles.message}>
            {user
              ? 'У вашего аккаунта нет прав администратора.'
              : 'Войдите в аккаунт администратора.'}
          </p>
          {!user && <Button onClick={() => openAuthDialog('login')}>Войти</Button>}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className='visually-hidden'>Панель администратора</h1>
      <SettingsPanel />
      <nav className={styles.tabs} aria-label='Разделы админки'>
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type='button'
            className={styles.tab}
            aria-pressed={tab.id === activeTab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {activeTab === 'stats' && <StatsPanel />}
      {activeTab === 'nominations' && <NominationsEditor />}
      {activeTab === 'applications' && <ApplicationsPanel />}
    </AdminLayout>
  );
}
