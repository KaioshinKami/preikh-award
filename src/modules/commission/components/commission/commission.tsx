import { Reveal, SectionHeading } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { COMMISSION_MESSAGES } from '../../model/commission-members';
import styles from './commission.module.scss';

const MEMBER_STAGGER_MS = 70;

export function Commission() {
  const t = useMessages(COMMISSION_MESSAGES);

  return (
    <section id='commission' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} align='center' />

        <ul className={styles.grid}>
          {t.members.map((name, index) => (
            <li key={index}>
              <Reveal delay={index * MEMBER_STAGGER_MS} className={styles.member}>
                <span className={styles.name}>{name}</span>
                <span className={styles.role}>{t.role}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
