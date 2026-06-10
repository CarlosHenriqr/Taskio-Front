import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Btn, Card } from '@/components/taskio/ui';
import { cn } from '@/lib/utils';

type AlertTone = 'success' | 'danger' | 'info' | 'warning' | 'primary';

export const interactiveCardClass =
  'rounded-xl border border-border/70 bg-card shadow-sm transition-all duration-200 hover:border-primary/25 hover:bg-surface-muted/40 hover:shadow-md';

export const sectionCardClass = 'rounded-xl border border-border/70 bg-card p-6 shadow-sm';

export function SectionCard({
  title,
  description,
  action,
  actionTo,
  actionLabel,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionTo?: string;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn(sectionCardClass, className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
        {actionTo && actionLabel && (
          <Link
            to={actionTo}
            className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary link-underline"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

export function MetaChip({
  icon: Icon,
  children,
  className,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground',
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}

export function TechPill({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <span
      className={cn(
        'rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium',
        highlight
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-border/60 bg-surface-muted/80 text-foreground/80',
      )}
    >
      {children}
    </span>
  );
}

export function ListItemCard({
  to,
  onClick,
  title,
  subtitle,
  detail,
  meta,
  badge,
  trailing,
  className,
}: {
  to?: string;
  onClick?: () => void;
  title: string;
  subtitle?: string;
  detail?: string;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {title}
          </p>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
        )}
        {meta && <div className="mt-2 flex flex-wrap gap-1.5">{meta}</div>}
        {detail && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground/90">
            {detail}
          </p>
        )}
      </div>
      {trailing ?? <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />}
    </>
  );

  const classes = cn(
    interactiveCardClass,
    'flex items-center gap-3 p-4 text-left',
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(classes, 'w-full')}>
      {content}
    </button>
  );
}

export function EntityListCard({
  to,
  onClick,
  avatar,
  title,
  subtitle,
  detail,
  badges,
  actions,
  className,
}: {
  to?: string;
  onClick?: () => void;
  avatar: React.ReactNode;
  title: string;
  subtitle?: string;
  detail?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  const inner = (
    <div className={cn(interactiveCardClass, 'flex items-center gap-4 p-4', className)}>
      {avatar}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-sm font-semibold text-foreground">{title}</p>
          {badges}
        </div>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        {detail && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground/90">
            {detail}
          </p>
        )}
      </div>
      {actions}
      {!actions && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block">
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    );
  }

  return inner;
}

export function AvatarBadge({
  children,
  tone = 'primary',
  className,
}: {
  children: React.ReactNode;
  tone?: 'primary' | 'neutral';
  className?: string;
}) {
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
      {children}
    </div>
  );
}

export function NotificationListCard({
  title,
  content,
  time,
  unread,
  onClick,
  onMarkRead,
  markReadPending,
}: {
  title: string;
  content: string;
  time: string;
  unread?: boolean;
  onClick: () => void;
  onMarkRead?: () => void;
  markReadPending?: boolean;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        interactiveCardClass,
        'flex cursor-pointer items-start justify-between gap-4 p-4 text-left',
        unread && 'border-primary/35 bg-primary/[0.04] ring-1 ring-primary/10',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
          <p className="font-display text-sm font-semibold">{title}</p>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{content}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
          {time}
        </p>
      </div>
      {unread && onMarkRead && (
        <Btn
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead();
          }}
          disabled={markReadPending}
        >
          Marcar lida
        </Btn>
      )}
    </Card>
  );
}

export function HighlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(interactiveCardClass, 'flex flex-col gap-3 p-4', className)}>
      {children}
    </div>
  );
}

export function FilterBar({
  children,
  trailing,
  className,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      {children}
      {trailing && (
        <span className="text-sm text-muted-foreground sm:ml-auto">{trailing}</span>
      )}
    </Card>
  );
}

export function ContextBanner({
  label,
  title,
  action,
  className,
}: {
  label: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'mb-4 flex flex-col gap-3 border-primary/25 bg-primary/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary/80">
          {label}
        </p>
        <p className="mt-0.5 font-display text-base font-semibold tracking-tight">{title}</p>
      </div>
      {action}
    </Card>
  );
}

const alertToneClass: Record<AlertTone, string> = {
  success: 'border-success/30 bg-success/5',
  danger: 'border-destructive/25 bg-destructive/5',
  info: 'border-info/30 bg-info/5',
  warning: 'border-warning/30 bg-warning/5',
  primary: 'border-primary/25 bg-primary/[0.04]',
};

const alertTitleClass: Record<AlertTone, string> = {
  success: 'text-success',
  danger: 'text-destructive',
  info: 'text-info',
  warning: 'text-warning-foreground',
  primary: 'text-primary',
};

export function StatusAlertCard({
  icon: Icon,
  title,
  tone = 'info',
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  tone?: AlertTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('p-5', alertToneClass[tone], className)}>
      <div className="flex gap-3">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', alertTitleClass[tone])} />
        <div className="min-w-0 flex-1">
          <p className={cn('font-display font-semibold', alertTitleClass[tone])}>{title}</p>
          <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{children}</div>
        </div>
      </div>
    </Card>
  );
}

export function ContentPanel({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn(sectionCardClass, className)}>
      {title && (
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      <div className={title || description ? 'mt-4' : undefined}>{children}</div>
    </Card>
  );
}
