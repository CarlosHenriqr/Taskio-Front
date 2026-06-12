import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Loader2 } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications.api';
import { getNotificationPath } from '@/lib/notificationLinks';
import { invalidateNotifications } from '@/lib/queryInvalidation';
import { queryKeys } from '@/lib/queryKeys';
import { formatRelativeDate, getNotificationTitle } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types/api';

type NotificationDropdownProps = {
  allPath: string;
  unreadCount?: number;
  className?: string;
};

export function NotificationDropdown({ allPath, unreadCount: unreadCountProp, className }: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const listQuery = useQuery({
    queryKey: queryKeys.notifications.panel(user!.id),
    queryFn: () => notificationsApi.list({ limit: 12 }),
    enabled: open && !!user?.id,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: async () => {
      await invalidateNotifications(queryClient);
    },
  });

  const unreadCount = unreadCountProp ?? 0;
  const notifications = listQuery.data ?? [];

  const handleNotificationClick = (notification: Notification) => {
    if (!user) return;

    const path = getNotificationPath(notification, user.type);
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    setOpen(false);

    if (path) {
      navigate(path);
    } else {
      navigate(allPath);
    }
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Notificações"
        className={`relative grid h-9 w-9 place-items-center rounded-md border bg-surface text-muted-foreground transition-colors hover:text-foreground ${
          open ? 'border-primary/40 text-foreground ring-1 ring-primary/20' : ''
        }`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 font-mono text-[9px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div
        role="dialog"
        aria-label="Painel de notificações"
        className={`absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-lg border bg-surface shadow-xl transition-all duration-200 ease-out ${
          open
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="font-display text-sm font-semibold">Notificações</p>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Fechar
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {listQuery.isLoading && (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </div>
          )}

          {!listQuery.isLoading && notifications.length === 0 && (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium">Nenhuma notificação</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Você será avisado quando houver novidades.
              </p>
            </div>
          )}

          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleNotificationClick(n)}
              className={`w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-muted/50 ${
                !n.read ? 'bg-primary/5' : 'bg-surface'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    n.read ? 'bg-transparent' : 'bg-primary'
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug">
                    {getNotificationTitle(n.type)}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.content}</p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground/80">
                    {formatRelativeDate(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <span
                    role="presentation"
                    onClick={(e) => {
                      e.stopPropagation();
                      markReadMutation.mutate(n.id);
                    }}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Marcar como lida"
                    title="Marcar como lida"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="border-t bg-muted/30 px-4 py-2.5">
          <Link
            to={allPath}
            onClick={() => setOpen(false)}
            className="block text-center text-xs font-semibold text-primary transition-colors hover:underline"
          >
            Ver todas as notificações
          </Link>
        </div>
      </div>
    </div>
  );
}
