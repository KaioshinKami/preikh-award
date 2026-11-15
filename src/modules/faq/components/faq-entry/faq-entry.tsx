import type { FaqItem } from '../../model/faq-items';
import styles from './faq-entry.module.scss';

type FaqEntryProps = {
  item: FaqItem;
};

export function FaqEntry({ item }: FaqEntryProps) {
  return (
    <details className={styles.entry}>
      <summary className={styles.question}>
        {item.question}
        <span className={styles.icon} aria-hidden='true' />
      </summary>
      <p className={styles.answer}>{item.answer}</p>
    </details>
  );
}
