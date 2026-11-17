import type { StageStatus } from '../../model/voting-stages';
import styles from './stage-card.module.scss';

type StageCardProps = {
  texts: { title: string; description: string; dateLabel: string };
  status: StageStatus;
  statusLabel: string;
  position: number;
};

export function StageCard({ texts, status, statusLabel, position }: StageCardProps) {
  return (
    <article className={styles.card} data-status={status}>
      <div className={styles.top}>
        <span className={styles.position}>{position}</span>
        <span className={styles.status}>{statusLabel}</span>
      </div>
      <p className={styles.date}>{texts.dateLabel}</p>
      <h3 className={styles.title}>{texts.title}</h3>
      <p className={styles.description}>{texts.description}</p>
    </article>
  );
}
