import { apiRequest } from '@/lib/api/client';
import type { Notification } from '@/types/api';

type NotificationsListResponse = {
  items: Notification[];
  page: number;
  limit: number;
  total: number;
};

export const notificationsApi = {
  list: async (params?: { page?: number; limit?: number; read?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.read !== undefined) q.set('read', String(params.read));
    const qs = q.toString();
    const data = await apiRequest<NotificationsListResponse>(
      `/notifications${qs ? `?${qs}` : ''}`,
    );
    return data.items;
  },

  markRead: (id: string) =>
    apiRequest<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),

  unreadCount: async () => {
    const data = await apiRequest<{ unreadCount: number }>('/notifications/unread-count');
    return { count: data.unreadCount };
  },
};
