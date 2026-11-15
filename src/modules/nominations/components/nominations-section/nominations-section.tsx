import { SectionHeading } from '@/shared/components';
import { useNominations } from '../../api/use-nominations';
import { ApplicationForm } from '../application-form/application-form';
import { NominationsBoard } from '../nominations-board/nominations-board';
import { NominationsStatus } from '../nominations-status/nominations-status';
import styles from './nominations-section.module.scss';

export function NominationsSection() {
  const { data, isLoading, error, reload } = useNominations();

  return (
    <section id='nominations' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          eyebrow='Номинации 2026'
          title='Выбирай героев года'
          lead='В каждой номинации — один голос, и изменить его нельзя. Итоги откроем на церемонии.'
        />

        {!data && isLoading && <NominationsStatus message='Загружаем номинации…' />}
        {!data && error && <NominationsStatus message={error} onRetry={reload} />}
        {data && (
          <>
            <NominationsBoard nominations={data.nominations} isVotingOpen={data.votingOpen} />
            <ApplicationForm nominations={data.nominations} />
          </>
        )}
      </div>
    </section>
  );
}
