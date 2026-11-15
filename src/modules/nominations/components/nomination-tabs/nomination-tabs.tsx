import type { Nomination } from '../../model/types';
import { NOMINATION_PANEL_ID } from '../nomination-panel/nomination-panel';
import styles from './nomination-tabs.module.scss';

type NominationTabsProps = {
  nominations: Nomination[];
  activeNominationId: number;
  onSelect: (nominationId: number) => void;
};

function formatPosition(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function NominationTabs({ nominations, activeNominationId, onSelect }: NominationTabsProps) {
  return (
    <nav className={styles.tabs} aria-label='Список номинаций'>
      <ul className={styles.list}>
        {nominations.map((nomination, index) => (
          <li key={nomination.id} className={styles.item}>
            <button
              type='button'
              className={styles.tab}
              aria-pressed={nomination.id === activeNominationId}
              aria-controls={NOMINATION_PANEL_ID}
              onClick={() => onSelect(nomination.id)}
            >
              <span className={styles.position}>{formatPosition(index)}</span>
              <span className={styles.text}>
                <span className={styles.title}>{nomination.title}</span>
                <span className={styles.category}>{nomination.category}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
