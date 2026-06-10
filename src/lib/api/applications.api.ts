import { apiRequest } from '@/lib/api/client';
import type { Application, ApplicationStatus, Job } from '@/types/api';

export const applicationsApi = {
  myApplications: (status?: ApplicationStatus) => {
    const q = status ? `?status=${status}` : '';
    return apiRequest<Application[]>(`/applications/me${q}`);
  },

  getById: (id: string) => apiRequest<Application>(`/applications/me/${id}`),

  listCompany: (params?: { jobId?: string; status?: ApplicationStatus }) => {
    const q = new URLSearchParams();
    if (params?.jobId) q.set('jobId', params.jobId);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    return apiRequest<Application[]>(`/applications/company${qs ? `?${qs}` : ''}`);
  },

  getCompanyById: (id: string) =>
    apiRequest<{ application: Application; job: Job }>(`/applications/${id}`),

  updateStatus: (id: string, status: ApplicationStatus) =>
    apiRequest<Application>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),

  cancel: (id: string) =>
    apiRequest<Application>(`/applications/${id}/cancel`, { method: 'PATCH' }),

  confirmCompletion: (id: string) =>
    apiRequest<Application>(`/applications/${id}/confirm-completion`, { method: 'PATCH' }),
};
