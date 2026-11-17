import { handleLinkClick } from '@/shared/lib/navigation';
import { getNominationPath } from '../../lib/nomination-path';
import type { Nomination } from '../../model/types';
import { NominationEmblem } from '../nomination-emblem/nomination-emblem';
import styles from './nomination-card.module.scss';

type NominationCardProps = {
  nomination: Nomination;
  isVoted: boolean;
};

// The whole card is one link to the nomination page; the "button" is only its visual label.
export function NominationCard({ nomination, isVoted }: NominationCardProps) {
  return (
    <article className={styles.card} data-voted={isVoted}>
      <NominationEmblem imageUrl={nomination.imageUrl} className={styles.emblem} />
      <h3 className={styles.title}>
        <a
          className={styles.link}
          href={getNominationPath(nomination.id)}
          onClick={handleLinkClick}
        >
          {nomination.title}
        </a>
      </h3>
      <p className={styles.hint}>{isVoted ? 'Голос отдан' : 'Сделай выбор'}</p>
      <span className={styles.cta} aria-hidden='true'>
        {isVoted ? 'Смотреть' : 'Проголосовать'}
      </span>
    </article>
  );
}
