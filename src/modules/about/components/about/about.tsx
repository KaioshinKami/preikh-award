import { Reveal, SectionHeading } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { ABOUT_MESSAGES } from '../../model/about-content';
import styles from './about.module.scss';

const STAT_STAGGER_MS = 100;

export function About() {
  const t = useMessages(ABOUT_MESSAGES);

  return (
    <section id='about' className={styles.about}>
      <div className={styles.inner}>
        <div>
          <SectionHeading eyebrow={t.eyebrow} title={t.title} />
          <Reveal delay={150} className={styles.paragraphs}>
            {t.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>
        </div>

        <ul className={styles.stats}>
          {t.stats.map((stat, index) => (
            <li key={index}>
              <Reveal delay={index * STAT_STAGGER_MS} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
