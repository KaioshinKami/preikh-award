import { apiRequest } from '@/shared/api/api';
import type { NominationsData, Variant, VotesByNomination } from '../model/types';

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

// "supported": the same name was already suggested, so the visitor's support went to it.
export type SubmitResult = { id: number; status: 'pending' | 'supported' };

export function submitApplication(details: ApplicationDetails): Promise<SubmitResult> {
  return apiRequest<SubmitResult>('/applications', { method: 'POST', body: details });
}

export async function fetchVariants(nominationId: number): Promise<Variant[]> {
  const { variants } = await apiRequest<{ variants: Variant[] }>(
    `/applications?nominationId=${nominationId}`,
  );
  return variants;
}

// Both return how many people now support the pick.
export function supportVariant(id: number): Promise<{ supports: number }> {
  return apiRequest(`/applications/${id}/support`, { method: 'POST' });
}

export function unsupportVariant(id: number): Promise<{ supports: number }> {
  return apiRequest(`/applications/${id}/support`, { method: 'DELETE' });
}
