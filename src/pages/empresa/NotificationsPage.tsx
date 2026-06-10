import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/taskio/ui';
import { NotificationList } from '@/components/shared/NotificationList';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { notificationsApi } from '@/lib/api/notifications.api';
import { getNotificationPath } from '@/lib/notificationLinks';
import { invalidateNotifications } from '@/lib/queryInvalidation';
import type { Notification } from '@/types/api';

export function EmpresaNotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ limit: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: async () => {
      await invalidateNotifications(queryClient);
      toast.success('Notificação marcada como lida.');
    },
    onError: () => toast.error('Erro ao marcar notificação.'),
  });

  const notifications = listQuery.data ?? [];

  const handleNotificationClick = (notification: Notification) => {
    const path = getNotificationPath(notification, 'company');
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (path) navigate(path);
  };

  usePageShell({
    title: 'Notificações',
    description: 'Acompanhe atualizações de candidaturas e projetos.',
  });

  return (
    <PageTransition>
        {listQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {listQuery.isError && <ErrorState onRetry={() => listQuery.refetch()} />}
        {!listQuery.isLoading && notifications.length === 0 && (
          <EmptyState
            icon={Bell}
            title="Nenhuma notificação"
            description="Você será avisado quando houver novidades."
          />
        )}
        <NotificationList
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkRead={(id) => markReadMutation.mutate(id)}
          markReadPending={markReadMutation.isPending}
        />
    </PageTransition>
  );
}
