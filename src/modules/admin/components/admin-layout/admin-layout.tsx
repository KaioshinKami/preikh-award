import type { ReactNode } from 'react';
import { AccountControls } from '@/modules/auth';
import { Logo } from '@/shared/components';
import styles from './admin-layout.module.scss';

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href='/' className={styles.logoLink} aria-label='PREIKH AWARD — на сайт'>
            <Logo />
          </a>
          <span className={styles.badge}>Админка</span>
          <a href='/' className={styles.siteLink}>
            На сайт
          </a>
          <AccountControls />
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
