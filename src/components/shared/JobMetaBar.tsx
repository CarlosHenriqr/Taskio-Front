import { Building2, Calendar, Clock } from 'lucide-react';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import type { JobStatus } from '@/types/api';
import { formatRelativeDate } from '@/lib/utils';

type JobMetaBarProps = {
  companyName?: string | null;
  deadline?: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
  status?: JobStatus;
  className?: string;
};

function formatDate(date?: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function JobMetaBar({
  companyName,
  deadline,
  expiresAt,
  createdAt,
  status,
  className = '',
}: JobMetaBarProps) {
  const deadlineLabel = formatDate(deadline);
  const expiresLabel = formatDate(expiresAt);

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground ${className}`}>
      {companyName && (
        <span className="inline-flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground/80">{companyName}</span>
        </span>
      )}
      {deadlineLabel && (
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          Prazo: {deadlineLabel}
        </span>
      )}
      {expiresLabel && !deadlineLabel && (
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          Encerra: {expiresLabel}
        </span>
      )}
      {createdAt && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Publicada {formatRelativeDate(createdAt)}
        </span>
      )}
      {status && <JobStatusBadge status={status} />}
    </div>
  );
}
