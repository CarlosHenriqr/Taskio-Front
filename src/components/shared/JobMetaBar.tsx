import { Building2, Calendar, Clock, Wallet } from 'lucide-react';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import type { Job, JobStatus } from '@/types/api';
import { formatJobPayment } from '@/lib/jobPayment';
import { formatRelativeDate } from '@/lib/utils';

type JobMetaBarProps = {
  companyName?: string | null;
  deadline?: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
  status?: JobStatus;
  payment?: Pick<Job, 'paymentType' | 'budgetMin' | 'budgetMax' | 'hourlyRate' | 'currency'> | null;
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
  payment,
  className = '',
}: JobMetaBarProps) {
  const deadlineLabel = formatDate(deadline);
  const expiresLabel = formatDate(expiresAt);
  const paymentLabel = payment ? formatJobPayment(payment) : null;

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground ${className}`}>
      {paymentLabel && (
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
          <Wallet className="h-3.5 w-3.5 shrink-0" />
          {paymentLabel}
        </span>
      )}
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
