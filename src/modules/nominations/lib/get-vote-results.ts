import type { Nominee, VoteStatus } from '../model/types';

export type NomineeResult = {
  votes: number;
  share: number;
};

// Results exist only once the server sends vote counts; null means "keep them hidden".
export function getVoteResults(nominees: Nominee[]): Map<number, NomineeResult> | null {
  if (nominees.some((nominee) => nominee.votes === undefined)) return null;

  const totalVotes = nominees.reduce((sum, nominee) => sum + (nominee.votes ?? 0), 0);
  return new Map(
    nominees.map((nominee) => {
      const votes = nominee.votes ?? 0;
      return [nominee.id, { votes, share: totalVotes === 0 ? 0 : votes / totalVotes }];
    }),
  );
}

type VoteStatusInput = {
  nomineeId: number;
  votedNomineeId?: number;
  pendingNomineeId: number | null;
  isVotingOpen: boolean;
};

export function getVoteStatus({
  nomineeId,
  votedNomineeId,
  pendingNomineeId,
  isVotingOpen,
}: VoteStatusInput): VoteStatus {
  if (votedNomineeId === nomineeId) return 'voted';
  if (votedNomineeId !== undefined) return 'locked';
  if (!isVotingOpen) return 'closed';
  if (pendingNomineeId === nomineeId) return 'pending';
  return 'available';
}
