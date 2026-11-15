import { Reveal, SectionHeading } from '@/shared/components';
import { getStageStatus } from '../../lib/get-stage-status';
import { VOTING_STAGES } from '../../model/voting-stages';
import { StageCard } from '../stage-card/stage-card';
import styles from './voting-stages.module.scss';

const STAGE_STAGGER_MS = 120;

export function VotingStages() {
  const now = Date.now();

  return (
    <section id='stages' className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          eyebrow='Как это работает'
          title='Четыре шага до награды'
          lead='Компания предлагает, комиссия собирает, вы голосуете, а победителей объявляем вживую.'
          align='center'
        />

        <ol className={styles.list}>
          {VOTING_STAGES.map((stage, index) => (
            <li key={stage.id}>
              <Reveal delay={index * STAGE_STAGGER_MS} className={styles.item}>
                <StageCard stage={stage} status={getStageStatus(stage, now)} position={index + 1} />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
