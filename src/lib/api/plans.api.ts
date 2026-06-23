import { apiRequest } from '@/lib/api/client';
import type { BillingInterval, PlanMeResponse, PublicPlansGroup } from '@/types/api';

export const plansApi = {
  me: () => apiRequest<PlanMeResponse>('/plans/me'),

  list: (audience?: 'USER' | 'COMPANY') => {
    const query = audience ? `?audience=${audience}` : '';
    return apiRequest<PublicPlansGroup[]>(`/plans${query}`, { auth: false });
  },

  mockUpgrade: (targetCode?: string, billingInterval?: BillingInterval) =>
    apiRequest<PlanMeResponse>('/plans/mock-upgrade', {
      method: 'POST',
      body: {
        ...(targetCode ? { targetCode } : {}),
        ...(billingInterval ? { billingInterval } : {}),
      },
    }),

  cancel: () => apiRequest<PlanMeResponse>('/plans/cancel', { method: 'POST' }),
};
