import { apiRequest } from '@/shared/api/api';
import type {
  AdminNomination,
  AdminStats,
  AdminUser,
  Application,
  ApplicationStatus,
  NominationInput,
  NomineeInput,
  UserRole,
  VotesFilter,
  VotesPage,
  VotingSettings,
} from '../model/types';

export function fetchStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>('/admin/stats');
}

export function fetchSettings(): Promise<VotingSettings> {
  return apiRequest<VotingSettings>('/admin/settings');
}

export function updateSettings(changes: Partial<VotingSettings>): Promise<VotingSettings> {
  return apiRequest<VotingSettings>('/admin/settings', { method: 'PUT', body: changes });
}

export async function fetchAdminNominations(): Promise<AdminNomination[]> {
  const { nominations } = await apiRequest<{ nominations: AdminNomination[] }>(
    '/admin/nominations',
  );
  return nominations;
}

export async function createNomination(input: NominationInput): Promise<void> {
  await apiRequest('/admin/nominations', { method: 'POST', body: input });
}

export async function updateNomination(id: number, input: NominationInput): Promise<void> {
  await apiRequest(`/admin/nominations/${id}`, { method: 'PUT', body: input });
}

export async function deleteNomination(id: number): Promise<void> {
  await apiRequest(`/admin/nominations/${id}`, { method: 'DELETE' });
}

export async function createNominee(nominationId: number, input: NomineeInput): Promise<void> {
  await apiRequest(`/admin/nominations/${nominationId}/nominees`, { method: 'POST', body: input });
}

export async function updateNominee(id: number, input: NomineeInput): Promise<void> {
  await apiRequest(`/admin/nominees/${id}`, { method: 'PUT', body: input });
}

export async function deleteNominee(id: number): Promise<void> {
  await apiRequest(`/admin/nominees/${id}`, { method: 'DELETE' });
}

export async function fetchApplications(status: ApplicationStatus): Promise<Application[]> {
  const { applications } = await apiRequest<{ applications: Application[] }>(
    `/admin/applications?status=${status}`,
  );
  return applications;
}

export async function approveApplication(id: number): Promise<void> {
  await apiRequest(`/admin/applications/${id}/approve`, { method: 'POST' });
}

export async function rejectApplication(id: number): Promise<void> {
  await apiRequest(`/admin/applications/${id}/reject`, { method: 'POST' });
}

export async function fetchUsers(search: string): Promise<AdminUser[]> {
  const query = search ? `?${new URLSearchParams({ search })}` : '';
  const { users } = await apiRequest<{ users: AdminUser[] }>(`/admin/users${query}`);
  return users;
}

export async function updateUserRole(id: number, role: UserRole): Promise<void> {
  await apiRequest(`/admin/users/${id}/role`, { method: 'PUT', body: { role } });
}

export async function deleteUser(id: number): Promise<void> {
  await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
}

export function fetchVotes({
  userId,
  nominationId,
  search,
  limit,
  offset,
}: VotesFilter): Promise<VotesPage> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (userId) params.set('userId', String(userId));
  if (nominationId) params.set('nominationId', String(nominationId));
  if (search) params.set('search', search);
  return apiRequest<VotesPage>(`/admin/votes?${params}`);
}

export async function deleteVote(id: number): Promise<void> {
  await apiRequest(`/admin/votes/${id}`, { method: 'DELETE' });
}
