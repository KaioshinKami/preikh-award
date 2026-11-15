import type { StageStatus, VotingStage } from '../model/voting-stages';

export function getStageStatus(stage: VotingStage, now: number): StageStatus {
  if (now > Date.parse(stage.endIso)) return 'done';
  if (now >= Date.parse(stage.startIso)) return 'active';
  return 'upcoming';
}
