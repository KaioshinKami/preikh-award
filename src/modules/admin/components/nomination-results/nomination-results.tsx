import { formatVotes } from '@/modules/nominations';
import type { AdminNomination } from '../../model/types';
import styles from './nomination-results.module.scss';

type NominationResultsProps = {
  nomination: AdminNomination;
};

// One nomination, nominees ranked by votes; bars show each nominee's share of the nomination.
export function NominationResults({ nomination }: NominationResultsProps) {
  const totalVotes = nomination.nominees.reduce((sum, nominee) => sum + nominee.votes, 0);
  const rankedNominees = [...nomination.nominees].sort(
    (first, second) => second.votes - first.votes,
  );

  return (
    <article className={styles.nomination}>
      <header className={styles.header}>
        <h3 className={styles.title}>«{nomination.title}»</h3>
        <span className={styles.total}>{formatVotes(totalVotes)}</span>
      </header>
      <ol className={styles.rows}>
        {rankedNominees.map((nominee) => {
          const share = totalVotes === 0 ? 0 : nominee.votes / totalVotes;
          return (
            <li key={nominee.id} className={styles.row}>
              <span className={styles.name}>{nominee.name}</span>
              <span className={styles.track} aria-hidden='true'>
                <span className={styles.fill} style={{ transform: `scaleX(${share})` }} />
              </span>
              <span className={styles.value}>
                {nominee.votes} · {Math.round(share * 100)}%
              </span>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
