import type { ReactNode } from 'react';
import styles from './button.module.scss';

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  isExternal?: boolean;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  isExternal = false,
  className,
}: ButtonLinkProps) {
  const classNames = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  const externalProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <a href={href} className={classNames} {...externalProps}>
      {children}
    </a>
  );
}
