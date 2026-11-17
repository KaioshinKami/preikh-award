import { useLocale, useMessages } from '@/shared/i18n';
import { formatVotes } from '../../lib/format-votes';
import type { NomineeResult } from '../../lib/get-vote-results';
import { localize, NOMINEE_FIELDS } from '../../lib/localize';
import { NOMINATIONS_MESSAGES } from '../../model/nominations-messages';
import type { Nominee, VoteStatus } from '../../model/types';
import { NomineePhoto } from '../nominee-photo/nominee-photo';
import styles from './nominee-card.module.scss';

type NomineeCardProps = {
  nominee: Nominee;
  result?: NomineeResult;
  voteStatus: VoteStatus;
  // Gets the nominee and the name shown to the visitor (for the confirmation).
  onVote: (nominee: Nominee, displayName: string) => void;
};

export function NomineeCard({ nominee, result, voteStatus, onVote }: NomineeCardProps) {
  const locale = useLocale();
  const voteLabels = useMessages(NOMINATIONS_MESSAGES).voteLabels;
  const { name, tagline } = localize(nominee, NOMINEE_FIELDS, locale);
  const handleVoteClick = () => onVote(nominee, name);

  return (
    <article className={styles.card} data-voted={voteStatus === 'voted'}>
      <div className={styles.media}>
        <NomineePhoto
          name={name}
          colorSeed={nominee.name}
          avatarUrl={nominee.avatarUrl}
          className={styles.photo}
        />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        {tagline && <p className={styles.tagline}>{tagline}</p>}

        {result && (
          <div className={styles.share}>
            <div className={styles.shareTrack} aria-hidden='true'>
              <span className={styles.shareFill} style={{ transform: `scaleX(${result.share})` }} />
            </div>
            <p className={styles.shareLabel}>
              <span className={styles.percent}>{Math.round(result.share * 100)}%</span>
              <span>{formatVotes(result.votes, locale)}</span>
            </p>
          </div>
        )}

        <button
          type='button'
          className={styles.voteButton}
          disabled={voteStatus !== 'available'}
          onClick={handleVoteClick}
        >
          {voteLabels[voteStatus]}
          <span className='visually-hidden'>: {name}</span>
        </button>
      </div>
    </article>
  );
}
