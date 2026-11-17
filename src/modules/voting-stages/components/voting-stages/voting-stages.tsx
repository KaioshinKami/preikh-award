import { useEventTexts } from '@/modules/event';
import { Reveal, SectionHeading } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { getStageStatus } from '../../lib/get-stage-status';
import { VOTING_STAGES, VOTING_STAGES_MESSAGES } from '../../model/voting-stages';
import { StageCard } from '../stage-card/stage-card';
import styles from './voting-stages.module.scss';

const STAGE_STAGGER_MS = 120;

export function VotingStages() {
  const t = useMessages(VOTING_STAGES_MESSAGES);
  const stageTexts = t.stages(useEventTexts());
  const now = Date.now();

  return (
    <section id='stages' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} align='center' />

        <ol className={styles.list}>
          {VOTING_STAGES.map((stage, index) => {
            const status = getStageStatus(stage, now);
            return (
              <li key={stage.id}>
                <Reveal delay={index * STAGE_STAGGER_MS} className={styles.item}>
                  <StageCard
                    texts={stageTexts[stage.id]}
                    status={status}
                    statusLabel={t.statuses[status]}
                    position={index + 1}
                  />
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
