import { useLocale, useMessages } from '@/shared/i18n';
import { handleLinkClick } from '@/shared/lib/navigation';
import { localize, NOMINATION_FIELDS } from '../../lib/localize';
import { getNominationPath } from '../../lib/nomination-path';
import { NOMINATIONS_MESSAGES } from '../../model/nominations-messages';
import type { Nomination } from '../../model/types';
import { NominationEmblem } from '../nomination-emblem/nomination-emblem';
import styles from './nomination-card.module.scss';

type NominationCardProps = {
  nomination: Nomination;
  isVoted: boolean;
};

// The whole card is one link to the nomination page; the "button" is only its visual label.
export function NominationCard({ nomination, isVoted }: NominationCardProps) {
  const t = useMessages(NOMINATIONS_MESSAGES).card;
  const { title } = localize(nomination, NOMINATION_FIELDS, useLocale());

  return (
    <article className={styles.card} data-voted={isVoted}>
      <NominationEmblem imageUrl={nomination.imageUrl} className={styles.emblem} />
      <h3 className={styles.title}>
        <a
          className={styles.link}
          href={getNominationPath(nomination.id)}
          onClick={handleLinkClick}
        >
          {title}
        </a>
      </h3>
      <p className={styles.hint}>{isVoted ? t.voted : t.makeChoice}</p>
      <span className={styles.cta} aria-hidden='true'>
        {isVoted ? t.view : t.vote}
      </span>
    </article>
  );
}
