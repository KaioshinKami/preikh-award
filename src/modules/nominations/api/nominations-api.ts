import { apiRequest } from '@/shared/api/api';
import type { NominationsData, VotesByNomination } from '../model/types';

type ApplicationDetails = {
  nominationId: number;
  nomineeName: string;
  comment: string;
};

export function fetchNominations(): Promise<NominationsData> {
  return apiRequest<NominationsData>('/nominations');
}

export async function fetchMyVotes(): Promise<VotesByNomination> {
  const { votes } = await apiRequest<{ votes: VotesByNomination }>('/votes/me');
  return votes;
}

export async function submitVote(nominationId: number, nomineeId: number): Promise<void> {
  await apiRequest('/votes', { method: 'POST', body: { nominationId, nomineeId } });
}

export async function submitApplication(details: ApplicationDetails): Promise<void> {
  await apiRequest('/applications', { method: 'POST', body: details });
}
