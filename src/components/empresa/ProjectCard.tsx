import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { Btn } from '@/components/taskio/ui';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { MetaChip, TechPill, interactiveCardClass } from '@/components/shared/ContentCards';
import type { Job } from '@/types/api';
import { formatRelativeDate } from '@/lib/utils';
import { getJobDescriptionPreview } from '@/lib/jobDescription.util';
import { formatJobPayment } from '@/lib/jobPayment';
import { cn } from '@/lib/utils';

type ProjectCardProps = {
  job: Job;
  onPause?: () => void;
  onClose?: () => void;
  actionsDisabled?: boolean;
};

export function ProjectCard({ job, onPause, onClose, actionsDisabled }: ProjectCardProps) {
  const detailPath = `/empresa/projetos/${job.id}`;
  const stack = job.technologies?.map((t) => t.technology.name) ?? [];
  const candidateCount = job._count?.applications ?? 0;
  const paymentLabel = formatJobPayment(job);

  return (
    <article className={cn(interactiveCardClass, 'group flex flex-col p-5 hover:-translate-y-0.5')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <MetaChip icon={Clock}>{formatRelativeDate(job.createdAt)}</MetaChip>
            <MetaChip icon={Users}>
              {candidateCount} candidato{candidateCount === 1 ? '' : 's'}
            </MetaChip>
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
        <JobStatusBadge status={job.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
        <Link to={`/empresa/candidatos?jobId=${job.id}`}>
          <Btn variant="ghost" size="sm">
            <Users className="h-3.5 w-3.5" />
            Candidatos
          </Btn>
        </Link>
        {job.status === 'OPEN' && onPause && (
          <Btn variant="ghost" size="sm" disabled={actionsDisabled} onClick={onPause}>
            Pausar
          </Btn>
        )}
        {job.status !== 'CLOSED' && job.status !== 'CANCELLED' && onClose && (
          <Btn variant="ghost" size="sm" disabled={actionsDisabled} onClick={onClose}>
            Encerrar
          </Btn>
        )}
        <Link to={detailPath}>
          <Btn size="sm">Detalhes</Btn>
        </Link>
      </div>
    </article>
  );
}
