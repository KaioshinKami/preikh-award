import { Reveal, SectionHeading } from '@/shared/components';
import { COMMISSION_MEMBERS } from '../../model/commission-members';
import styles from './commission.module.scss';

const MEMBER_STAGGER_MS = 70;

export function Commission() {
  return (
    <section id='commission' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading eyebrow='Комиссия' title='Те, кто собрал номинантов' align='center' />

        <ul className={styles.grid}>
          {COMMISSION_MEMBERS.map((member, index) => (
            <li key={member.name}>
              <Reveal delay={index * MEMBER_STAGGER_MS} className={styles.member}>
                <span className={styles.name}>{member.name}</span>
                <span className={styles.role}>{member.role}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
