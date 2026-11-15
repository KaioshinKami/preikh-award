import type { ReactNode } from 'react';
import styles from './admin-panel.module.scss';

type AdminPanelProps = {
  title: string;
  actions?: ReactNode;
  error?: string | null;
  children: ReactNode;
};

export function AdminPanel({ title, actions, error, children }: AdminPanelProps) {
  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      {error && (
        <p className={styles.error} role='alert'>
          {error}
        </p>
      )}
      {children}
    </section>
  );
}
