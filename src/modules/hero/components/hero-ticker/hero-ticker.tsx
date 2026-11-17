import { useEventTexts } from '@/modules/event';
import { SnowflakeIcon } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { HERO_MESSAGES } from '../../model/hero-messages';
import styles from './hero-ticker.module.scss';

export function HeroTicker() {
  const t = useMessages(HERO_MESSAGES);
  const event = useEventTexts();
  const phrases = t.tickerPhrases(event.dateLabel);
  // The list is rendered twice so the -50% scroll loops without a seam.
  const items = [...phrases, ...phrases];

  return (
    <div className={styles.ticker} aria-hidden='true'>
      <div className={styles.band}>
        <div className={styles.track}>
          {items.map((phrase, index) => (
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
