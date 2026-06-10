import { NotificationListCard } from '@/components/shared/ContentCards';
import { getNotificationTitle, formatRelativeDate } from '@/lib/utils';
import type { Notification } from '@/types/api';

type NotificationListProps = {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkRead?: (id: string) => void;
  markReadPending?: boolean;
};

export function NotificationList({
  notifications,
  onNotificationClick,
  onMarkRead,
  markReadPending,
}: NotificationListProps) {
  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <NotificationListCard
          key={n.id}
          title={getNotificationTitle(n.type)}
          content={n.content}
          time={formatRelativeDate(n.createdAt)}
          unread={!n.read}
          onClick={() => onNotificationClick(n)}
          onMarkRead={onMarkRead ? () => onMarkRead(n.id) : undefined}
          markReadPending={markReadPending}
        />
      ))}
    </div>
  );
}
