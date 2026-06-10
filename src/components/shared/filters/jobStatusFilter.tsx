import { Ban, CircleDot, Layers, PauseCircle, XCircle } from 'lucide-react';
import { PillFilter, buildPillCounts, type PillFilterOption } from '@/components/shared/PillFilter';
import { JOB_STATUS_LABELS } from '@/lib/utils';
import type { JobStatus } from '@/types/api';

export type JobStatusFilterValue = JobStatus | '';

const JOB_STATUSES: JobStatus[] = ['OPEN', 'PAUSED', 'CLOSED', 'CANCELLED'];

const JOB_STATUS_OPTIONS: PillFilterOption<JobStatusFilterValue>[] = [
  { value: '', label: 'Todos', icon: Layers, tone: 'primary' },
  { value: 'OPEN', label: JOB_STATUS_LABELS.OPEN, icon: CircleDot, tone: 'success' },
  { value: 'PAUSED', label: JOB_STATUS_LABELS.PAUSED, icon: PauseCircle, tone: 'warning' },
  { value: 'CLOSED', label: JOB_STATUS_LABELS.CLOSED, icon: XCircle, tone: 'neutral' },
  { value: 'CANCELLED', label: JOB_STATUS_LABELS.CANCELLED, icon: Ban, tone: 'danger' },
];

export function buildJobStatusCounts(jobs: { status: JobStatus }[]) {
  const partial = buildPillCounts(jobs, (j) => (j as { status: JobStatus }).status, JOB_STATUSES);
  return {
    '': jobs.length,
    ...partial,
  } as Record<JobStatusFilterValue, number>;
}

type JobStatusFilterProps = {
  value: JobStatusFilterValue;
  onChange: (value: JobStatusFilterValue) => void;
  counts: Record<JobStatusFilterValue, number>;
  className?: string;
};

export function JobStatusFilter({ value, onChange, counts, className }: JobStatusFilterProps) {
  return (
    <PillFilter
      value={value}
      onChange={onChange}
      options={JOB_STATUS_OPTIONS}
      counts={counts}
      ariaLabel="Filtrar por status do projeto"
      className={className}
    />
  );
}
