import { Reveal } from '../reveal/reveal';
import { SnowflakeIcon } from '../snowflake-icon/snowflake-icon';
import styles from './section-heading.module.scss';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: 'start' | 'center';
};

export function SectionHeading({ eyebrow, title, lead, align = 'start' }: SectionHeadingProps) {
  return (
    <Reveal className={styles.heading}>
      <div className={styles.inner} data-align={align}>
        <p className={styles.eyebrow}>
          <SnowflakeIcon size={16} />
          {eyebrow}
        </p>
        <h2 className={styles.title}>{title}</h2>
        {lead && <p className={styles.lead}>{lead}</p>}
      </div>
    </Reveal>
  );
}
