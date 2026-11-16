import type { MouseEvent, ReactNode } from 'react';
import { useAuth } from '@/modules/auth';
import { Button, Logo } from '@/shared/components';
import { ADMIN_SECTIONS, type AdminSection } from '../../model/admin-sections';
import { getAdminSectionUrl } from '../../model/use-admin-route';
import styles from './admin-layout.module.scss';

type AdminLayoutProps = {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  children: ReactNode;
};

// Ctrl/Cmd/Shift-clicks keep the browser's default, e.g. opening a section in a new tab.
function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function AdminLayout({ activeSection, onNavigate, children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const activeLabel = ADMIN_SECTIONS.find((section) => section.id === activeSection)?.label;

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Logo />
          <span className={styles.badge}>Админ</span>
        </div>

        <nav className={styles.nav} aria-label='Разделы админки'>
          {ADMIN_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={getAdminSectionUrl(section.id)}
              className={styles.navLink}
              aria-current={section.id === activeSection ? 'page' : undefined}
              onClick={(event) => {
                if (!isPlainClick(event)) return;
                event.preventDefault();
                onNavigate(section.id);
              }}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className={styles.account}>
          {user && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          )}
          <a href='/' className={styles.siteLink}>
            На сайт
          </a>
          <Button variant='ghost' size='small' onClick={signOut}>
            Выйти
          </Button>
        </div>
      </aside>

      <main className={styles.main}>
        <h1 className={styles.title}>{activeLabel}</h1>
        {children}
      </main>
    </div>
  );
}
