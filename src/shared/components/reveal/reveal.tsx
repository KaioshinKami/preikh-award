import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useInView } from './use-in-view';
import styles from './reveal.module.scss';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(elementRef);
  const delayStyle = { '--reveal-delay': `${delay}ms` } as CSSProperties;
  const classNames = [styles.reveal, className].filter(Boolean).join(' ');

  return (
    <div ref={elementRef} className={classNames} style={delayStyle} data-visible={isInView}>
      {children}
    </div>
  );
}
