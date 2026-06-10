import { Link } from 'react-router-dom';

const LOGO_SRC = '/taskiologo-removebg-preview.ico';

export function Logo({
  subtitle,
  className = '',
}: {
  subtitle?: string;
  className?: string;
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
      <div className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-bold tracking-tight">TASKIO</span>
        {subtitle && (
          <span className="mt-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
