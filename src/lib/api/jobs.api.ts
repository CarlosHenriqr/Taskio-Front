import { apiRequest } from '@/lib/api/client';
import type { Job, JobPaymentType, JobStatus } from '@/types/api';

export type CreateJobPayload = {
  title: string;
  description: string;
  requirements?: string;
  deadline: string;
  expiresAt: string;
  requiredTechnologyIds: string[];
  desirableTechnologyIds: string[];
  paymentType: JobPaymentType;
  currency?: string;
  budgetMin?: number;
  budgetMax?: number;
  hourlyRate?: number;
};

export const jobsApi = {
  list: (params?: { search?: string; active?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.active !== undefined) q.set('active', String(params.active));
    const qs = q.toString();
    return apiRequest<Job[]>(`/vagas${qs ? `?${qs}` : ''}`, { auth: false });
  },

  listMine: () => apiRequest<Job[]>('/vagas/me'),

  getById: (id: string) => apiRequest<Job>(`/vagas/${id}`, { auth: false }),

  create: (payload: CreateJobPayload) =>
    apiRequest<Job>('/vagas', { method: 'POST', body: payload }),

  update: (id: string, payload: Partial<CreateJobPayload>) =>
    apiRequest<Job>(`/vagas/${id}`, { method: 'PUT', body: payload }),

  updateStatus: (id: string, status: JobStatus) =>
    apiRequest<Job>(`/vagas/${id}/status`, { method: 'PATCH', body: { status } }),

  remove: (id: string) => apiRequest<Job>(`/vagas/${id}`, { method: 'DELETE' }),

  apply: (id: string, payload: { resumeUrl?: string; coverLetter?: string }) =>
    apiRequest(`/vagas/${id}/apply`, { method: 'POST', body: payload }),

  listApplications: (jobId: string, status?: string) => {
    const q = status ? `?status=${status}` : '';
    return apiRequest(`/vagas/${jobId}/applications${q}`);
  },

  listCandidates: (jobId: string, status?: string) => {
    const q = status ? `?status=${status}` : '';
    return apiRequest(`/vagas/${jobId}/candidates${q}`);
  },
};
