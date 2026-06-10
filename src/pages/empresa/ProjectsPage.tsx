import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, FilePlus2 } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, EmptyState, TextInput } from '@/components/taskio/ui';
import { FilterBar } from '@/components/shared/ContentCards';
import {
  JobStatusFilter,
  buildJobStatusCounts,
  type JobStatusFilterValue,
} from '@/components/shared/filters/jobStatusFilter';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ProjectCard } from '@/components/empresa/ProjectCard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCompanyJobs } from '@/lib/companyJobs';
import { jobsApi } from '@/lib/api/jobs.api';
import { invalidateCompany } from '@/lib/queryInvalidation';
import type { JobStatus } from '@/types/api';

export function EmpresaProjectsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchInit = searchParams.get('search') ?? '';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState(searchInit);
  const [statusFilter, setStatusFilter] = useState<JobStatusFilterValue>('');

  usePageShell({
    title: 'Meus projetos',
    description: 'Acompanhe status, candidatos e orçamentos.',
    actions: (
      <Link to="/empresa/publicar">
        <Btn size="sm">
          <FilePlus2 className="h-3.5 w-3.5" /> Novo projeto
        </Btn>
      </Link>
    ),
  });

  const jobsQuery = useQuery({
    queryKey: ['company', 'jobs', user?.id],
    queryFn: () => fetchCompanyJobs(),
    enabled: !!user?.id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      jobsApi.updateStatus(id, status),
    onSuccess: async () => {
      await invalidateCompany(queryClient);
      toast.success('Status atualizado.');
    },
    onError: () => toast.error('Erro ao atualizar status.'),
  });

  const allJobs = jobsQuery.data ?? [];
  const statusCounts = useMemo(() => buildJobStatusCounts(allJobs), [allJobs]);

  const jobs = allJobs.filter((j) => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PageTransition>
        <FilterBar
          className="flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center"
          trailing={`${jobs.length} projeto${jobs.length === 1 ? '' : 's'}`}
        >
          <TextInput
            placeholder="Buscar por título, stack..."
            className="w-full sm:max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <JobStatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            counts={statusCounts}
            className="w-full sm:flex-1"
          />
        </FilterBar>

        {jobsQuery.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {jobsQuery.isError && (
          <ErrorState onRetry={() => jobsQuery.refetch()} />
        )}
        {!jobsQuery.isLoading && !jobsQuery.isError && allJobs.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="Nenhum projeto publicado"
            description="Crie sua primeira vaga e receba candidatos compatíveis em minutos."
            action={
              <Link to="/empresa/publicar">
                <Btn>Publicar projeto</Btn>
              </Link>
            }
          />
        )}
        {!jobsQuery.isLoading && allJobs.length > 0 && jobs.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="Nenhum projeto com esse filtro"
            description="Tente outro status ou limpe a busca para ver todos os projetos."
            action={
              <Btn
                variant="secondary"
                onClick={() => {
                  setStatusFilter('');
                  setSearch('');
                }}
              >
                Limpar filtros
              </Btn>
            }
          />
        )}
        {!jobsQuery.isLoading && jobs.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {jobs.map((p) => (
              <ProjectCard
                key={p.id}
                job={p}
                actionsDisabled={statusMutation.isPending}
                onPause={
                  p.status === 'OPEN'
                    ? () => statusMutation.mutate({ id: p.id, status: 'PAUSED' })
                    : undefined
                }
                onClose={
                  p.status !== 'CLOSED' && p.status !== 'CANCELLED'
                    ? () => statusMutation.mutate({ id: p.id, status: 'CLOSED' })
                    : undefined
                }
              />
            ))}
          </div>
        )}
    </PageTransition>
  );
}