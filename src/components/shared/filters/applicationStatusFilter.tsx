import {
  Ban,
  CheckCircle2,
  CircleCheck,
  Clock,
  Eye,
  Layers,
  XCircle,
} from 'lucide-react';
import { PillFilter, buildPillCounts, type PillFilterOption } from '@/components/shared/PillFilter';
import { APPLICATION_STATUS_LABELS } from '@/lib/utils';
import type { ApplicationStatus } from '@/types/api';

export type ApplicationStatusFilterValue = ApplicationStatus | '';

const BASE_STATUSES: ApplicationStatus[] = [
  'PENDING',
  'REVIEWED',
  'ACCEPTED',
  'REJECTED',
  'COMPLETED',
];

function getApplicationStatusOptions(
  includeCancelled: boolean,
): PillFilterOption<ApplicationStatusFilterValue>[] {
  const statuses = (includeCancelled
    ? [...BASE_STATUSES, 'CANCELLED']
    : BASE_STATUSES) as ApplicationStatus[];

  const iconMap: Record<ApplicationStatus, PillFilterOption<ApplicationStatus>['icon']> = {
    PENDING: Clock,
    REVIEWED: Eye,
    ACCEPTED: CheckCircle2,
    REJECTED: XCircle,
    COMPLETED: CircleCheck,
    CANCELLED: Ban,
  };

  const toneMap: Record<ApplicationStatus, PillFilterOption<ApplicationStatus>['tone']> = {
    PENDING: 'warning',
    REVIEWED: 'info',
    ACCEPTED: 'success',
    REJECTED: 'danger',
    COMPLETED: 'primary',
    CANCELLED: 'neutral',
  };

  return [
    { value: '', label: 'Todos', icon: Layers, tone: 'primary' as const },
    ...statuses.map((status) => ({
      value: status,
      label: APPLICATION_STATUS_LABELS[status] ?? status,
      icon: iconMap[status],
      tone: toneMap[status],
    })),
  ];
}

export function buildApplicationStatusCounts(
  applications: { status: ApplicationStatus }[],
  includeCancelled = true,
): Record<ApplicationStatusFilterValue, number> {
  const statuses: ApplicationStatus[] = includeCancelled
    ? [...BASE_STATUSES, 'CANCELLED']
    : BASE_STATUSES;

  const partial = buildPillCounts(
    applications,
    (a) => (a as { status: ApplicationStatus }).status,
    statuses,
  );

  const counts = { '': applications.length } as Record<ApplicationStatusFilterValue, number>;
  statuses.forEach((status) => {
    counts[status] = partial[status] ?? 0;
  });
  return counts;
}

type ApplicationStatusFilterProps = {
  value: ApplicationStatusFilterValue;
  onChange: (value: ApplicationStatusFilterValue) => void;
  counts: Record<ApplicationStatusFilterValue, number>;
  includeCancelled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
};

export function ApplicationStatusFilter({
  value,
  onChange,
  counts,
  includeCancelled = true,
  className,
  size,
}: ApplicationStatusFilterProps) {
  return (
    <PillFilter
      value={value}
      onChange={onChange}
      options={getApplicationStatusOptions(includeCancelled)}
      counts={counts}
      ariaLabel="Filtrar por status da candidatura"
      className={className}
      size={size}
    />
  );
}
