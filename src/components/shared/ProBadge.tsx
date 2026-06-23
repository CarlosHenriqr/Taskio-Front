import { BadgeCheck } from 'lucide-react';

type ProBadgeProps = {
  className?: string;
  withLabel?: boolean;
  title?: string;
};

const DEFAULT_TITLE = 'Freelancer Pro · perfil em destaque no matching';

export function ProBadge({ className = '', withLabel = false, title = DEFAULT_TITLE }: ProBadgeProps) {
  if (withLabel) {
    return (
      <span
        title={title}
        className={`inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary ${className}`}
      >
        <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
        Pro
      </span>
    );
  }

  return (
    <span
      title={title}
      role="img"
      aria-label="Freelancer Pro"
      className={`inline-flex shrink-0 text-primary ${className}`}
    >
      <BadgeCheck className="h-4 w-4 fill-primary/15" />
    </span>
  );
}
