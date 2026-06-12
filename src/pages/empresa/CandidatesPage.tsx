import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, ExternalLink } from 'lucide-react';
import { Btn, EmptyState } from '@/components/taskio/ui';
import { ContextBanner, EntityListCard, FilterBar } from '@/components/shared/ContentCards';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { FilterSelect } from '@/components/shared/FilterSelect';
import {
  ApplicationStatusFilter,
  buildApplicationStatusCounts,
  type ApplicationStatusFilterValue,
} from '@/components/shared/filters/applicationStatusFilter';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { MatchScoreBadge } from '@/components/shared/MatchScoreBadge';
import { ApplicationActions } from '@/components/empresa/ApplicationActions';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCompanyApplications, fetchCompanyJobs } from '@/lib/companyJobs';
import { formatRelativeDate } from '@/lib/utils';

export function EmpresaCandidatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobIdFilter = searchParams.get('jobId') ?? '';
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusFilterValue>('');

  usePageShell({
    title: 'Candidatos',
    description: 'Gerencie candidaturas de todos os seus projetos.',
  });

  const jobsQuery = useQuery({
    queryKey: ['company', 'jobs', user?.id],
    queryFn: () => fetchCompanyJobs(),
    enabled: !!user?.id,
  });

  const appsQuery = useQuery({
    queryKey: ['company', 'applications', user?.id, jobIdFilter],
    queryFn: async () => {
      const apps = await fetchCompanyApplications({
        jobId: jobIdFilter || undefined,
      });
      const jobTitleById = new Map((jobsQuery.data ?? []).map((j) => [j.id, j.title]));
      return apps.map((a) => ({
        ...a,
        jobTitle: a.job?.title ?? jobTitleById.get(a.jobId) ?? 'Projeto',
      }));
    },
    enabled: !!user?.id,
  });

  const selectedJob = (jobsQuery.data ?? []).find((j) => j.id === jobIdFilter);
  const allApplications = appsQuery.data ?? [];
  const statusCounts = useMemo(
    () => buildApplicationStatusCounts(allApplications, false),
    [allApplications],
  );

  const applications = useMemo(
    () =>
      [...allApplications]
        .filter((a) => !statusFilter || a.status === statusFilter)
        .sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0)),
    [allApplications, statusFilter],
  );

  return (
    <PageTransition>
        {selectedJob && (
          <ContextBanner
            label="Projeto selecionado"
            title={selectedJob.title}
            action={
              <Link to={`/empresa/projetos/${selectedJob.id}`}>
                <Btn size="sm" variant="secondary">
                  <ExternalLink className="h-3.5 w-3.5" /> Ver projeto
                </Btn>
              </Link>
            }
          />
        )}

        <FilterBar
          className="flex-col items-stretch gap-4"
          trailing={`${applications.length} candidatura${applications.length === 1 ? '' : 's'}`}
        >
          <FilterSelect
            className="w-full sm:max-w-md"
            value={jobIdFilter}
            onChange={(e) => {
              const v = e.target.value;
              navigate(v ? `/empresa/candidatos?jobId=${v}` : '/empresa/candidatos');
            }}
          >
            <option value="">Todos os projetos</option>
            {(jobsQuery.data ?? []).map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </FilterSelect>
          <ApplicationStatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            counts={statusCounts}
            includeCancelled={false}
            className="w-full"
          />
        </FilterBar>

        {(jobsQuery.isLoading || appsQuery.isLoading) && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {(jobsQuery.isError || appsQuery.isError) && (
          <ErrorState onRetry={() => { jobsQuery.refetch(); appsQuery.refetch(); }} />
        )}
        {!jobsQuery.isLoading && !appsQuery.isLoading && allApplications.length === 0 && (
          <EmptyState
            icon={Users}
            title="Nenhuma candidatura"
            description="Publique projetos para começar a receber candidatos."
          />
        )}
        {!jobsQuery.isLoading && !appsQuery.isLoading && allApplications.length > 0 && applications.length === 0 && (
          <EmptyState
            icon={Users}
            title="Nenhuma candidatura com esse filtro"
            description="Tente outro status ou projeto."
            action={
              <Btn
                variant="secondary"
                onClick={() => {
                  setStatusFilter('');
                  navigate('/empresa/candidatos');
                }}
              >
                Limpar filtros
              </Btn>
            }
          />
        )}
        <div className="space-y-3">
          {applications.map((a) => (
            <div key={a.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link to={`/empresa/candidatos/${a.id}`} className="min-w-0 flex-1">
                <EntityListCard
                  avatar={
                    <UserAvatar
                      name={a.user?.name ?? 'Candidato'}
                      avatarUrl={a.user?.avatarUrl}
                    />
                  }
                  title={a.user?.name ?? 'Candidato'}
                  subtitle={`${a.jobTitle} · ${formatRelativeDate(a.createdAt)}`}
                  detail={
                    a.matchedTechnologies?.length
                      ? `Stack: ${a.matchedTechnologies.join(', ')}`
                      : undefined
                  }
                  badges={
                    <>
                      <MatchScoreBadge score={a.matchPercent} />
                      <ApplicationStatusBadge status={a.status} />
                    </>
                  }
                />
              </Link>
              <ApplicationActions
                applicationId={a.id}
                status={a.status}
                candidateName={a.user?.name}
                variant="compact"
              />
            </div>
          ))}
        </div>
    </PageTransition>
  );
}
