import { Link } from 'react-router-dom';
import { Building2, Clock } from 'lucide-react';
import { Btn } from '@/components/taskio/ui';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { MatchScoreBadge } from '@/components/shared/MatchScoreBadge';
import { MetaChip, TechPill, interactiveCardClass } from '@/components/shared/ContentCards';
import { UserAvatar } from '@/components/shared/UserAvatar';
import type { Job } from '@/types/api';
import { formatRelativeDate } from '@/lib/utils';
import { getJobDescriptionPreview } from '@/lib/jobDescription.util';
import { formatJobPayment } from '@/lib/jobPayment';
import { cn } from '@/lib/utils';

export function JobCard({
  job,
  detailPath,
  showApply,
  onApply,
  matchPercent,
}: {
  job: Job;
  detailPath: string;
  showApply?: boolean;
  onApply?: () => void;
  matchPercent?: number;
}) {
  const stack = job.technologies?.map((t) => t.technology.name) ?? [];
  const paymentLabel = formatJobPayment(job);

  return (
    <article className={cn(interactiveCardClass, 'group p-5 hover:-translate-y-0.5')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2">
              <UserAvatar
                name={job.company?.name ?? 'Empresa'}
                avatarUrl={job.company?.avatarUrl}
                tone="neutral"
                className="h-7 w-7 rounded-lg text-[10px]"
              />
              <MetaChip icon={Building2}>{job.company?.name ?? 'Empresa'}</MetaChip>
            </div>
            <MetaChip icon={Clock}>{formatRelativeDate(job.createdAt)}</MetaChip>
            {matchPercent !== undefined && (
              <MatchScoreBadge score={matchPercent} suffix="compatível" />
            )}
          </div>

          <Link
            to={detailPath}
            className="mt-3 block font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-primary"
          >
            {job.title}
          </Link>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {getJobDescriptionPreview(job.description)}
          </p>

          {paymentLabel && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
              {paymentLabel}
            </p>
          )}

          {stack.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stack.slice(0, 5).map((s) => (
                <TechPill key={s}>{s}</TechPill>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
          <JobStatusBadge status={job.status} />
          <div className="flex gap-2 sm:mt-2">
            <Link to={detailPath}>
              <Btn variant="secondary" size="sm">
                Detalhes
              </Btn>
            </Link>
            {showApply && job.status === 'OPEN' && (
              <Btn size="sm" onClick={onApply}>
                Candidatar-se
              </Btn>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
