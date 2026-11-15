import type { StageStatus, VotingStage } from '../../model/voting-stages';
import styles from './stage-card.module.scss';

const STATUS_LABELS: Record<StageStatus, string> = {
  done: 'Завершён',
  active: 'Идёт сейчас',
  upcoming: 'Скоро',
};

type StageCardProps = {
  stage: VotingStage;
  status: StageStatus;
  position: number;
};

export function StageCard({ stage, status, position }: StageCardProps) {
  return (
    <article className={styles.card} data-status={status}>
      <div className={styles.top}>
        <span className={styles.position}>{position}</span>
        <span className={styles.status}>{STATUS_LABELS[status]}</span>
      </div>
      <p className={styles.date}>{stage.dateLabel}</p>
      <h3 className={styles.title}>{stage.title}</h3>
      <p className={styles.description}>{stage.description}</p>
    </article>
  );
}
