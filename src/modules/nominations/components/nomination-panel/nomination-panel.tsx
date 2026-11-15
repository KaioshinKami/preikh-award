import { getVoteResults, getVoteStatus } from '../../lib/get-vote-results';
import type { Nomination, Nominee } from '../../model/types';
import { NomineeCard } from '../nominee-card/nominee-card';
import styles from './nomination-panel.module.scss';

export const NOMINATION_PANEL_ID = 'nomination-panel';

type NominationPanelProps = {
  nomination: Nomination;
  position: number;
  total: number;
  votedNomineeId?: number;
  pendingNomineeId: number | null;
  isVotingOpen: boolean;
  onVote: (nominee: Nominee) => void;
};

export function NominationPanel({
  nomination,
  position,
  total,
  votedNomineeId,
  pendingNomineeId,
  isVotingOpen,
  onVote,
}: NominationPanelProps) {
  const results = getVoteResults(nomination.nominees);

  return (
    <div id={NOMINATION_PANEL_ID} className={styles.panel}>
      <header className={styles.header}>
        <p className={styles.meta}>
          <span>{nomination.category}</span>
          <span className={styles.counter}>
            {position} / {total}
          </span>
        </p>
        <h3 className={styles.title}>«{nomination.title}»</h3>
        <p className={styles.description}>{nomination.description}</p>
      </header>

      {nomination.nominees.length === 0 && (
        <p className={styles.description}>Номинанты появятся совсем скоро.</p>
      )}

      <ul className={styles.nominees}>
        {nomination.nominees.map((nominee) => (
          <li key={nominee.id} className={styles.nominee}>
            <NomineeCard
              nominee={nominee}
              result={results?.get(nominee.id)}
              voteStatus={getVoteStatus({
                nomineeId: nominee.id,
                votedNomineeId,
                pendingNomineeId,
                isVotingOpen,
              })}
              onVote={onVote}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
