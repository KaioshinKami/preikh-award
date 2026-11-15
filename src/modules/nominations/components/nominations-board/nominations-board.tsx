import { useState } from 'react';
import { Reveal } from '@/shared/components';
import type { Nomination, Nominee } from '../../model/types';
import { useVotes } from '../../model/use-votes';
import { NominationPanel } from '../nomination-panel/nomination-panel';
import { NominationTabs } from '../nomination-tabs/nomination-tabs';
import styles from './nominations-board.module.scss';

type NominationsBoardProps = {
  nominations: Nomination[];
  isVotingOpen: boolean;
};

export function NominationsBoard({ nominations, isVotingOpen }: NominationsBoardProps) {
  const [selectedNominationId, setSelectedNominationId] = useState(nominations[0]?.id);
  const { votes, pendingNomineeId, voteError, castVote } = useVotes();
  const activeNomination =
    nominations.find((nomination) => nomination.id === selectedNominationId) ?? nominations[0];

  if (!activeNomination) {
    return <p className={styles.notice}>Номинации появятся совсем скоро.</p>;
  }

  const handleVote = (nominee: Nominee) => castVote(activeNomination.id, nominee);

  return (
    <Reveal className={styles.board}>
      <NominationTabs
        nominations={nominations}
        activeNominationId={activeNomination.id}
        onSelect={setSelectedNominationId}
      />
      <div className={styles.panelColumn}>
        {!isVotingOpen && <p className={styles.notice}>Голосование сейчас закрыто.</p>}
        {voteError && (
          <p className={styles.error} role='alert'>
            {voteError}
          </p>
        )}
        <NominationPanel
          key={activeNomination.id}
          nomination={activeNomination}
          position={nominations.indexOf(activeNomination) + 1}
          total={nominations.length}
          votedNomineeId={votes[activeNomination.id]}
          pendingNomineeId={pendingNomineeId}
          isVotingOpen={isVotingOpen}
          onVote={handleVote}
        />
      </div>
    </Reveal>
  );
}
