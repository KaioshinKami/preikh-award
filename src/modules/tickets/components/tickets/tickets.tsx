import { EVENT_INFO, getCeremonyCalendarUrl, useEventTexts } from '@/modules/event';
import { ButtonLink, Reveal, SectionHeading } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { TICKETS_MESSAGES } from '../../model/ticket-tiers';
import { TicketCard } from '../ticket-card/ticket-card';
import styles from './tickets.module.scss';

const TIER_STAGGER_MS = 120;

export function Tickets() {
  const t = useMessages(TICKETS_MESSAGES);
  const event = useEventTexts();
  const eventDetails = `${event.dateLabel}, ${event.timeLabel} · ${event.venue}`;
  // A calendar entry would give the secret date away.
  const canAddToCalendar = !EVENT_INFO.isCeremonySecret;

  return (
    <section id='tickets' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead(eventDetails)} />

        <ul className={styles.tiers}>
          {t.tiers.map((tier, index) => (
            <li key={tier.id}>
              <Reveal delay={index * TIER_STAGGER_MS} className={styles.tier}>
                <TicketCard tier={tier} featuredBadge={t.featuredBadge} />
              </Reveal>
            </li>
          ))}
        </ul>

        {canAddToCalendar && (
          <Reveal className={styles.salesNote}>
            <p>{t.calendarNote}</p>
            <ButtonLink href={getCeremonyCalendarUrl(event)} variant='ghost' isExternal>
              {t.calendarButton}
            </ButtonLink>
          </Reveal>
        )}
      </div>
    </section>
  );
}
