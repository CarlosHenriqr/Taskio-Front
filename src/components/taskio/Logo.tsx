import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

const LOGO_SRC = '/taskiologo-removebg-preview.ico';

export function Logo({
  subtitle,
  className = '',
  tierBadge,
}: {
  subtitle?: string;
  className?: string;
  tierBadge?: ReactNode;
}) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <img
        src={LOGO_SRC}
        alt="TASKIO"
        className="h-8 w-8 shrink-0 object-contain"
        width={32}
        height={32}
      />
      <div className="flex min-w-0 flex-col leading-none">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-display text-[15px] font-bold tracking-tight">TASKIO</span>
          {tierBadge}
        </div>
        {subtitle && (
          <span className="mt-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
