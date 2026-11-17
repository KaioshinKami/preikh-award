import { useEventTexts } from '@/modules/event';
import { Reveal, SectionHeading } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { FAQ_MESSAGES } from '../../model/faq-items';
import { FaqEntry } from '../faq-entry/faq-entry';
import styles from './faq.module.scss';

export function Faq() {
  const t = useMessages(FAQ_MESSAGES);
  const items = t.items(useEventTexts());

  return (
    <section id='faq' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading eyebrow='FAQ' title={t.title} lead={t.lead} />

        <Reveal className={styles.list}>
          {items.map((item, index) => (
            <FaqEntry key={index} item={item} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
