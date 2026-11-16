import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth';
import { Button, Logo } from '@/shared/components';
import { AdminLayout } from '../../components/admin-layout/admin-layout';
import { ApplicationsPanel } from '../../components/applications-panel/applications-panel';
import { NominationsEditor } from '../../components/nominations-editor/nominations-editor';
import { SettingsPanel } from '../../components/settings-panel/settings-panel';
import { StatsPanel } from '../../components/stats-panel/stats-panel';
import { UsersPanel } from '../../components/users-panel/users-panel';
import { VotesPanel } from '../../components/votes-panel/votes-panel';
import { useAdminRoute } from '../../model/use-admin-route';
import styles from './admin-page.module.scss';

function AccessScreen({ children }: { children: ReactNode }) {
  return (
    <div className={styles.access}>
      <a href='/' className={styles.accessLogo} aria-label='PREIKH AWARD — на сайт'>
        <Logo />
      </a>
      <div className={styles.accessCard}>{children}</div>
    </div>
  );
}

// The server checks the admin role on every /api/admin request; this guard only picks the screen.
export function AdminPage() {
  const { user, isLoading, openAuthDialog } = useAuth();
  const { section, params, navigate } = useAdminRoute();

  if (isLoading) {
    return (
      <AccessScreen>
        <p className={styles.message}>Проверяем доступ…</p>
      </AccessScreen>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <AccessScreen>
        <h1 className={styles.accessTitle}>Только для администратора</h1>
        <p className={styles.message}>
          {user
            ? 'У вашего аккаунта нет прав администратора.'
            : 'Войдите в аккаунт администратора.'}
        </p>
        {!user && <Button onClick={() => openAuthDialog('login')}>Войти</Button>}
      </AccessScreen>
    );
  }

  const votesUserId = Number(params.get('user')) || null;

  return (
    <AdminLayout activeSection={section} onNavigate={navigate}>
      {section === 'overview' && (
        <>
          <SettingsPanel />
          <StatsPanel />
        </>
      )}
      {section === 'votes' && (
        <VotesPanel
          key={votesUserId ?? 'all'}
          userId={votesUserId}
          onClearUser={() => navigate('votes')}
        />
      )}
      {section === 'users' && (
        <UsersPanel onShowVotes={(userId) => navigate('votes', { user: String(userId) })} />
      )}
      {section === 'nominations' && <NominationsEditor />}
      {section === 'applications' && <ApplicationsPanel />}
    </AdminLayout>
  );
}
