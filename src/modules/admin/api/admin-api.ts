import { apiRequest } from '@/shared/api/api';
import type {
  AdminNomination,
  AdminStats,
  Application,
  ApplicationStatus,
  NominationInput,
  NomineeInput,
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
