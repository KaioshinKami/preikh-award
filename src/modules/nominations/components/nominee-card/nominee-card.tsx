import { formatVotes } from '../../lib/format-votes';
import type { NomineeResult } from '../../lib/get-vote-results';
import type { Nominee, VoteStatus } from '../../model/types';
import { NomineePhoto } from '../nominee-photo/nominee-photo';
import styles from './nominee-card.module.scss';

const VOTE_LABELS: Record<VoteStatus, string> = {
  available: 'Голосовать',
  pending: 'Отправляем…',
  voted: 'Ваш голос',
  locked: 'Голос отдан',
  closed: 'Голосование закрыто',
};

type NomineeCardProps = {
  nominee: Nominee;
  result?: NomineeResult;
  voteStatus: VoteStatus;
  onVote: (nominee: Nominee) => void;
};

export function NomineeCard({ nominee, result, voteStatus, onVote }: NomineeCardProps) {
  const handleVoteClick = () => onVote(nominee);

  return (
    <article className={styles.card} data-voted={voteStatus === 'voted'}>
      <div className={styles.media}>
        <NomineePhoto name={nominee.name} avatarUrl={nominee.avatarUrl} className={styles.photo} />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{nominee.name}</h3>
        {nominee.tagline && <p className={styles.tagline}>{nominee.tagline}</p>}

        {result && (
          <div className={styles.share}>
            <div className={styles.shareTrack} aria-hidden='true'>
              <span className={styles.shareFill} style={{ transform: `scaleX(${result.share})` }} />
            </div>
            <p className={styles.shareLabel}>
              <span className={styles.percent}>{Math.round(result.share * 100)}%</span>
              <span>{formatVotes(result.votes)}</span>
            </p>
          </div>
        )}

        <button
          type='button'
          className={styles.voteButton}
          disabled={voteStatus !== 'available'}
          onClick={handleVoteClick}
        >
          {VOTE_LABELS[voteStatus]}
          <span className='visually-hidden'>: {nominee.name}</span>
        </button>
      </div>
    </article>
  );
}
