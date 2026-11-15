import { EVENT_INFO } from '@/modules/event';
import { SnowflakeIcon } from '@/shared/components';
import styles from './hero-ticker.module.scss';

const TICKER_PHRASES = [
  'Голоса решают всё',
  'Кто станет Preikh King?',
  `Церемония ${EVENT_INFO.dateLabel}`,
  '+1000 ауры без усилий',
  'Номинантов собрала комиссия',
];

// The list is rendered twice so the -50% scroll loops without a seam.
const TICKER_ITEMS = [...TICKER_PHRASES, ...TICKER_PHRASES];

export function HeroTicker() {
  return (
    <div className={styles.ticker} aria-hidden='true'>
      <div className={styles.band}>
        <div className={styles.track}>
          {TICKER_ITEMS.map((phrase, index) => (
            <span key={`${phrase}-${index}`} className={styles.item}>
              <SnowflakeIcon size={18} />
              {phrase}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
