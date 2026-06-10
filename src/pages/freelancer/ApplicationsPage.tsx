import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase } from 'lucide-react';
import { Btn, EmptyState } from '@/components/taskio/ui';
import { AvatarBadge, EntityListCard, FilterBar } from '@/components/shared/ContentCards';
import {
  ApplicationStatusFilter,
  buildApplicationStatusCounts,
  type ApplicationStatusFilterValue,
} from '@/components/shared/filters/applicationStatusFilter';
import { formatJobPayment } from '@/lib/jobPayment';
import { getInitials } from '@/lib/utils';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { applicationsApi } from '@/lib/api/applications.api';
import { formatRelativeDate } from '@/lib/utils';

export function FreelancerApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusFilterValue>('');

  const query = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationsApi.myApplications(),
  });

  const allApps = query.data ?? [];
  const statusCounts = useMemo(() => buildApplicationStatusCounts(allApps), [allApps]);
  const apps = useMemo(
    () => allApps.filter((a) => !statusFilter || a.status === statusFilter),
    [allApps, statusFilter],
  );

  usePageShell({
    title: 'Meus trabalhos',
    description: 'Acompanhe todas as suas candidaturas e contratos.',
    primaryAction: { label: 'Ver vagas', to: '/freelancer/vagas' },
  });

  return (
    <PageTransition>
        <FilterBar
          className="flex-col items-stretch"
          trailing={`${apps.length} candidatura${apps.length === 1 ? '' : 's'}`}
        >
          <ApplicationStatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            counts={statusCounts}
            className="w-full"
          />
        </FilterBar>

        {query.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {query.isError && <ErrorState onRetry={() => query.refetch()} />}
        {!query.isLoading && allApps.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="Nenhuma candidatura"
            description="Explore projetos e envie sua primeira proposta."
            action={
              <Link to="/freelancer/vagas">
                <span className="text-sm font-semibold text-primary hover:underline">
                  Buscar projetos
                </span>
              </Link>
            }
          />
        )}
        {!query.isLoading && allApps.length > 0 && apps.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="Nenhuma candidatura com esse filtro"
            description="Tente outro status."
            action={
              <Btn variant="secondary" onClick={() => setStatusFilter('')}>
                Limpar filtro
              </Btn>
            }
          />
        )}
        <div className="space-y-3">
          {apps.map((a) => {
            const payment = a.job ? formatJobPayment(a.job) : null;
            return (
              <EntityListCard
                key={a.id}
                to={`/freelancer/trabalhos/${a.id}`}
                avatar={
                  <AvatarBadge tone="neutral">
                    {getInitials(a.job?.company?.name ?? 'E')}
                  </AvatarBadge>
                }
                title={a.job?.title ?? 'Projeto'}
                subtitle={`${a.job?.company?.name ?? 'Empresa'} · ${formatRelativeDate(a.createdAt)}`}
                detail={
                  a.coverLetter?.trim()
                    ? a.coverLetter.trim()
                    : payment ?? undefined
                }
                badges={<ApplicationStatusBadge status={a.status} />}
              />
            );
          })}
        </div>
    </PageTransition>
  );
}
