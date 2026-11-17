import { EVENT_INFO } from '@/modules/event';
import { ButtonLink, Reveal, SnowflakeIcon } from '@/shared/components';
import { handleLinkClick } from '@/shared/lib/navigation';
import { Countdown } from '../countdown/countdown';
import { Snowdrift } from '../snowdrift/snowdrift';
import styles from './hero.module.scss';

export function Hero() {
  return (
    <section id='top' className={styles.hero}>
      <SnowflakeIcon className={styles.backgroundFlake} size={640} strokeWidth={0.25} />

      <div className={styles.content}>
        <Reveal>
          <p className={styles.badge}>
            {EVENT_INFO.edition} · Зима {EVENT_INFO.year}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <h1 className={styles.title}>
            <span className={styles.titleMain}>PREIKH</span>
            <span className={styles.titleSub}>AWARD {EVENT_INFO.year}</span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className={styles.lead}>
            Премия нашей компании за всё время. Вы выбираете героев, а мы вручаем им награды на
            церемонии.
          </p>
        </Reveal>

        <Reveal delay={360} className={styles.meta}>
          <span>{EVENT_INFO.dateLabel}</span>
          <span className={styles.metaDot} aria-hidden='true' />
          <span>{EVENT_INFO.venue}</span>
        </Reveal>

        <Reveal delay={480} className={styles.actions}>
          <ButtonLink href='/#nominations' onClick={handleLinkClick}>
            Голосовать
          </ButtonLink>
          <ButtonLink href='/#tickets' variant='ghost' onClick={handleLinkClick}>
            Билет на церемонию
          </ButtonLink>
        </Reveal>

        <Reveal delay={600} className={styles.countdown}>
          <Countdown targetIso={EVENT_INFO.ceremonyStartIso} />
        </Reveal>
      </div>

      <Snowdrift className={styles.snowdrift} />
    </section>
  );
}
