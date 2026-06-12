import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  tone?: 'primary' | 'neutral';
  className?: string;
};

export function UserAvatar({ name, avatarUrl, tone = 'primary', className }: UserAvatarProps) {
  const initials = getInitials(name);

  if (avatarUrl) {
    return (
      <div
        className={cn(
          'relative h-11 w-11 shrink-0 overflow-hidden rounded-xl shadow-sm',
          className,
        )}
      >
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-semibold shadow-sm',
        tone === 'primary'
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground',
        className,
      )}
    >
      {initials}
    </div>
  );
}
