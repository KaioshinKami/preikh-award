import { SectionHeading } from '@/shared/components';
import { useScrollToHashOnOpen } from '@/shared/lib/navigation';
import { useNominations } from '../../api/use-nominations';
import { ApplicationForm } from '../application-form/application-form';
import { NominationsGrid } from '../nominations-grid/nominations-grid';
import { NominationsStatus } from '../nominations-status/nominations-status';
import styles from './nominations-section.module.scss';

export function NominationsSection() {
  const { data, error, reload } = useNominations();
  // The cards and every section below them move once the list loads.
  useScrollToHashOnOpen(data !== null);

  return (
    <section id='nominations' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          eyebrow='Номинации 2026'
          title='Выбирай героев года'
          lead='Открой номинацию и проголосуй за своего героя. В каждой номинации — один голос, и изменить его нельзя.'
        />

        {!data && !error && <NominationsStatus message='Загружаем номинации…' />}
        {!data && error && <NominationsStatus message={error} onRetry={reload} />}
        {data && (
          <>
            {!data.votingOpen && <p className={styles.notice}>Голосование сейчас закрыто.</p>}
            <NominationsGrid nominations={data.nominations} />
            <ApplicationForm nominations={data.nominations} />
          </>
        )}
      </div>
    </section>
  );
}
