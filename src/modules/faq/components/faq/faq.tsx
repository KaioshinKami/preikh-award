import { Reveal, SectionHeading } from '@/shared/components';
import { FAQ_ITEMS } from '../../model/faq-items';
import { FaqEntry } from '../faq-entry/faq-entry';
import styles from './faq.module.scss';

export function Faq() {
  return (
    <section id='faq' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          eyebrow='FAQ'
          title='Частые вопросы'
          lead='Коротко о голосовании, номинантах и церемонии.'
        />

        <Reveal className={styles.list}>
          {FAQ_ITEMS.map((item) => (
            <FaqEntry key={item.question} item={item} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
