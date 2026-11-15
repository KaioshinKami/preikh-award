import { EVENT_INFO, getCeremonyCalendarUrl } from '@/modules/event';
import { ButtonLink, Reveal, SectionHeading } from '@/shared/components';
import { TICKET_TIERS } from '../../model/ticket-tiers';
import { TicketCard } from '../ticket-card/ticket-card';
import styles from './tickets.module.scss';

const TIER_STAGGER_MS = 120;

export function Tickets() {
  const eventDetails = `${EVENT_INFO.dateLabel}, ${EVENT_INFO.timeLabel} · ${EVENT_INFO.venue}`;

  return (
    <section id='tickets' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          eyebrow='Офлайн'
          title='Встретимся под снегопадом'
          lead={`${eventDetails}. Вручение наград победителям, которых выбрали вы.`}
        />

        <ul className={styles.tiers}>
          {TICKET_TIERS.map((tier, index) => (
            <li key={tier.id}>
              <Reveal delay={index * TIER_STAGGER_MS} className={styles.tier}>
                <TicketCard tier={tier} />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className={styles.salesNote}>
          <p>Добавьте церемонию в календарь, чтобы не пропустить.</p>
          <ButtonLink href={getCeremonyCalendarUrl()} variant='ghost' isExternal>
            Добавить в календарь
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
