import { SectionHeading } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { useNominations } from '../../api/use-nominations';
import { NOMINATIONS_MESSAGES } from '../../model/nominations-messages';
import { ApplicationForm } from '../application-form/application-form';
import { NominationsGrid } from '../nominations-grid/nominations-grid';
import { NominationsStatus } from '../nominations-status/nominations-status';
import styles from './nominations-section.module.scss';

export function NominationsSection() {
  const t = useMessages(NOMINATIONS_MESSAGES);
  const { data, error, reload } = useNominations();

  return (
    <section id='nominations' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading eyebrow={t.section.eyebrow} title={t.section.title} lead={t.section.lead} />

        {!data && !error && <NominationsStatus message={t.section.loading} />}
        {!data && error && <NominationsStatus message={error} onRetry={reload} />}
        {data && (
          <>
            {!data.votingOpen && <p className={styles.notice}>{t.votingClosed}</p>}
            <NominationsGrid nominations={data.nominations} />
            <ApplicationForm nominations={data.nominations} />
          </>
        )}
      </div>
    </section>
  );
}
