import { apiRequest } from '@/shared/api/api';
import type { CeremonyNomination } from '../model/types';

// The admin API: it sends the vote counts to an admin and refuses everyone else, so the results
// stay secret until they are shown at the ceremony.
export async function fetchCeremonyNominations(): Promise<CeremonyNomination[]> {
  const { nominations } = await apiRequest<{ nominations: CeremonyNomination[] }>(
    '/admin/nominations',
  );
  return nominations;
}
