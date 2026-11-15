import { Reveal, SectionHeading } from '@/shared/components';
import { ABOUT_PARAGRAPHS, ABOUT_STATS } from '../../model/about-content';
import styles from './about.module.scss';

const STAT_STAGGER_MS = 100;

export function About() {
  return (
    <section id='about' className={styles.about}>
      <div className={styles.inner}>
        <div>
          <SectionHeading eyebrow='О премии' title='Самая тёплая ночь холодного сезона' />
          <Reveal delay={150} className={styles.paragraphs}>
            {ABOUT_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>
        </div>

        <ul className={styles.stats}>
          {ABOUT_STATS.map((stat, index) => (
            <li key={stat.label}>
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
