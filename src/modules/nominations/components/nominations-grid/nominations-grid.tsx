import { Reveal } from '@/shared/components';
import { getNominationAnchorId } from '../../lib/nomination-path';
import type { Nomination } from '../../model/types';
import { useVotes } from '../../model/use-votes';
import { NominationCard } from '../nomination-card/nomination-card';
import styles from './nominations-grid.module.scss';

type NominationsGridProps = {
  nominations: Nomination[];
};

export function NominationsGrid({ nominations }: NominationsGridProps) {
  const { votes } = useVotes();

  if (nominations.length === 0) {
    return <p className={styles.notice}>Номинации появятся совсем скоро.</p>;
  }

  return (
    <Reveal>
      <ul className={styles.grid}>
        {nominations.map((nomination) => (
          <li key={nomination.id} id={getNominationAnchorId(nomination.id)} className={styles.item}>
            <NominationCard nomination={nomination} isVoted={nomination.id in votes} />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
