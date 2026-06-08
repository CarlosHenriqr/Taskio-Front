import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/taskio/AppShell';
import { Card, EmptyState, Select } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { MatchScoreBadge } from '@/components/shared/MatchScoreBadge';
import { ApplicationActions } from '@/components/empresa/ApplicationActions';
import { empresaNav } from '@/lib/nav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCompanyJobs } from '@/lib/companyJobs';
import { jobsApi } from '@/lib/api/jobs.api';
import { matchingApi } from '@/lib/api/matching.api';
import { getInitials, formatRelativeDate } from '@/lib/utils';
import type { Application, ApplicationStatus } from '@/types/api';

export function EmpresaCandidatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobIdFilter = searchParams.get('jobId') ?? '';
  const [statusFilter, setStatusFilter] = useState('');

  const jobsQuery = useQuery({
    queryKey: ['company', 'jobs', user?.id],
    queryFn: () => fetchCompanyJobs(user!.id),
    enabled: !!user?.id,
  });

  const appsQuery = useQuery({
    queryKey: ['company', 'all-applications', user?.id, jobIdFilter, statusFilter, jobsQuery.data],
    queryFn: async () => {
      const jobs = (jobsQuery.data ?? []).filter(
        (job) => !jobIdFilter || job.id === jobIdFilter,
      );
      const result: Array<
        Application & { jobTitle: string; matchPercent: number; matchedTechnologies: string[] }
      > = [];
      for (const job of jobs) {
        const [apps, matches] = await Promise.all([
          jobsApi.listApplications(job.id, statusFilter || undefined) as Promise<Application[]>,
          matchingApi.recommendedCandidates(job.id, 100).catch(() => []),
        ]);
        const matchByUserId = new Map(matches.map((m) => [m.id, m]));
        apps.forEach((a) => {
          const userId = a.userId ?? a.user?.id ?? '';
          const match = matchByUserId.get(userId);
          result.push({
            ...a,
            jobId: a.jobId ?? job.id,
            jobTitle: job.title,
            matchPercent: match?.matchPercent ?? 0,
            matchedTechnologies: match?.matchedTechnologies ?? [],
          });
        });
      }
      return result;
    },
    enabled: !!jobsQuery.data,
  });

  const applications = (appsQuery.data ?? [])
    .filter((a) => !jobIdFilter || a.jobId === jobIdFilter)
    .sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0));

  return (
    <AppShell
      nav={empresaNav}
      subtitle="Empresa"
      primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}
      title="Candidatos"
      description="Gerencie candidaturas de todos os seus projetos."
    >
      <PageTransition>
        <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <Select
            className="sm:w-56"
            value={jobIdFilter}
            onChange={(e) => {
              const v = e.target.value;
              navigate(v ? `/empresa/candidatos?jobId=${v}` : '/empresa/candidatos');
            }}
          >
            <option value="">Todas os projetos</option>
            {(jobsQuery.data ?? []).map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </Select>
          <Select
            className="sm:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | '')}
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="REVIEWED">Em análise</option>
            <option value="ACCEPTED">Aceita</option>
            <option value="REJECTED">Recusada</option>
            <option value="COMPLETED">Concluída</option>
          </Select>
          <span className="ml-auto text-sm text-muted-foreground">
            {applications.length} candidaturas
          </span>
        </Card>

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
        {!jobsQuery.isLoading && !appsQuery.isLoading && applications.length === 0 && (
          <EmptyState
            icon={Users}
            title="Nenhuma candidatura"
            description="Publique projetos para começar a receber candidatos."
          />
        )}
        <div className="space-y-3">
          {applications.map((a) => (
            <Card
              key={a.id}
              className="flex items-center gap-4 p-4 transition-colors duration-150 hover:bg-surface-muted/50"
            >
              <Link to={`/empresa/candidatos/${a.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                  {getInitials(a.user?.name ?? '?')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{a.user?.name ?? 'Candidato'}</p>
                    <MatchScoreBadge score={a.matchPercent} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {a.jobTitle} · {formatRelativeDate(a.createdAt)}
                  </p>
                  {!!a.matchedTechnologies?.length && (
                    <p className="mt-1 truncate text-[10px] text-muted-foreground">
                      Stack: {a.matchedTechnologies.join(', ')}
                    </p>
                  )}
                </div>
                <ApplicationStatusBadge status={a.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
              <ApplicationActions
                applicationId={a.id}
                status={a.status}
                candidateName={a.user?.name}
                variant="compact"
                onSuccess={() => appsQuery.refetch()}
              />
            </Card>
          ))}
        </div>
      </PageTransition>
    </AppShell>
  );
}
