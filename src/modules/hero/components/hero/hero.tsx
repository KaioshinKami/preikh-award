import { EVENT_INFO, useEventTexts } from '@/modules/event';
import { ButtonLink, Reveal, SnowflakeIcon } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { handleLinkClick } from '@/shared/lib/navigation';
import { HERO_MESSAGES } from '../../model/hero-messages';
import { Countdown, SecretCountdown } from '../countdown/countdown';
import { Snowdrift } from '../snowdrift/snowdrift';
import styles from './hero.module.scss';

export function Hero() {
  const t = useMessages(HERO_MESSAGES);
  const event = useEventTexts();

  return (
    <section id='top' className={styles.hero}>
      <SnowflakeIcon className={styles.backgroundFlake} size={640} strokeWidth={0.25} />

      <div className={styles.content}>
        <Reveal>
          <p className={styles.badge}>{t.badge}</p>
        </Reveal>

        <Reveal delay={120}>
          <h1 className={styles.title}>
            <span className={styles.titleMain}>PREIKH</span>
            <span className={styles.titleSub}>AWARD {EVENT_INFO.year}</span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className={styles.lead}>{t.lead}</p>
        </Reveal>

        <Reveal delay={360} className={styles.meta}>
          <span>{event.dateLabel}</span>
          <span className={styles.metaDot} aria-hidden='true' />
          <span>{event.venue}</span>
        </Reveal>

        <Reveal delay={480} className={styles.actions}>
          <ButtonLink href='/#nominations' onClick={handleLinkClick}>
            {t.vote}
          </ButtonLink>
          <ButtonLink href='/#tickets' variant='ghost' onClick={handleLinkClick}>
            {t.ticket}
          </ButtonLink>
        </Reveal>

        <Reveal delay={600} className={styles.countdown}>
          {EVENT_INFO.isCeremonySecret ? (
            <SecretCountdown />
          ) : (
            <Countdown targetIso={EVENT_INFO.ceremonyStartIso} />
          )}
        </Reveal>
      </div>

      <Snowdrift className={styles.snowdrift} />
    </section>
  );
}
