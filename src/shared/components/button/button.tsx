import type { ButtonHTMLAttributes } from 'react';
import styles from './button.module.scss';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'regular' | 'small';
};

export function Button({
  variant = 'primary',
  size = 'regular',
  type = 'button',
  className,
  ...buttonProps
}: ButtonProps) {
  const sizeClassName = size === 'small' ? styles.small : undefined;
  const classNames = [styles.button, styles[variant], sizeClassName, className]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={classNames} {...buttonProps} />;
}
