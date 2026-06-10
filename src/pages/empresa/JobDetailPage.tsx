import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight, Pause, Pencil, Users, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge, JobStatusBadge } from '@/components/shared/StatusBadge';
import { CompletionConfirmationCard } from '@/components/shared/CompletionConfirmationCard';
import { ReviewForm } from '@/components/shared/ReviewForm';
import { JobDescriptionView } from '@/components/shared/JobDescriptionView';
import { JobMetaBar } from '@/components/shared/JobMetaBar';
import { JobPaymentBlock } from '@/components/shared/JobPaymentBlock';
import { JobTechStack } from '@/components/shared/JobTechStack';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCompanyApplications } from '@/lib/companyJobs';
import { jobsApi } from '@/lib/api/jobs.api';
import { reviewsApi } from '@/lib/api/reviews.api';
import { invalidateApplications, invalidateCompany } from '@/lib/queryInvalidation';
import { getInitials, formatRelativeDate } from '@/lib/utils';
import type { JobStatus } from '@/types/api';

export function EmpresaJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const jobQuery = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id!),
    enabled: !!id,
  });

  const job = jobQuery.data;
  const isOwner = job?.company?.id === user?.id;

  const appsQuery = useQuery({
    queryKey: ['company', 'job-applications', id],
    queryFn: () => fetchCompanyApplications({ jobId: id! }),
    enabled: !!id && isOwner,
  });

  const applications = appsQuery.data ?? [];
  const acceptedApp = applications.find((a) => a.status === 'ACCEPTED');
  const completedApp = applications.find((a) => a.status === 'COMPLETED');

  const reviewStatusQuery = useQuery({
    queryKey: ['reviews', 'application', completedApp?.id],
    queryFn: () => reviewsApi.applicationStatus(completedApp!.id),
    enabled: !!completedApp?.id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: JobStatus) => jobsApi.updateStatus(id!, status),
    onSuccess: async () => {
      await invalidateCompany(queryClient);
      toast.success('Status do projeto atualizado.');
      await jobQuery.refetch();
    },
    onError: () => toast.error('Erro ao atualizar status do projeto.'),
  });

  const refresh = async () => {
    await invalidateApplications(queryClient);
    await appsQuery.refetch();
    await jobQuery.refetch();
    if (completedApp) {
      await queryClient.invalidateQueries({
        queryKey: ['reviews', 'application', completedApp.id],
      });
    }
  };

  usePageShell({
    title: job?.title ?? 'Projeto',
    description: job
      ? `${applications.length} candidatura${applications.length === 1 ? '' : 's'}`
      : undefined,
    actions: job && isOwner ? (
      <div className="flex flex-wrap gap-2">
        <Link to={`/empresa/projetos/${job.id}/editar`}>
          <Btn variant="secondary" size="sm">
            <Pencil className="h-3.5 w-3.5" /> Editar projeto
          </Btn>
        </Link>
        <Link to="/empresa/projetos">
          <Btn variant="secondary" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Btn>
        </Link>
      </div>
    ) : undefined,
  });

  if (jobQuery.isLoading) {
    return <PageLoader />;
  }

  if (jobQuery.isError || !job) {
    return <ErrorState title="Projeto não encontrado" onRetry={() => jobQuery.refetch()} />;
  }

  if (!isOwner) {
    return (
      <ErrorState title="Acesso negado" description="Este projeto não pertence à sua empresa." />
    );
  }

  return (
    <PageTransition>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <JobStatusBadge status={job.status} />
                <span className="text-xs text-muted-foreground">
                  Publicado {formatRelativeDate(job.createdAt)}
                </span>
              </div>

              <h2 className="mt-4 font-display text-xl font-bold">{job.title}</h2>

              <JobMetaBar
                className="mt-3"
                deadline={job.deadline}
                expiresAt={job.expiresAt}
                createdAt={job.createdAt}
                status={job.status}
              />

              <JobPaymentBlock payment={job} className="mt-6" />

              <div className="mt-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Sobre o projeto
                </h3>
                <div className="mt-3">
                  <JobDescriptionView description={job.description} requirements={job.requirements} />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                <Link to={`/empresa/projetos/${job.id}/editar`}>
                  <Btn variant="secondary" size="sm">
                    <Pencil className="h-3.5 w-3.5" /> Editar projeto
                  </Btn>
                </Link>
                <Link to={`/empresa/candidatos?jobId=${job.id}`}>
                  <Btn variant="secondary" size="sm">
                    <Users className="h-3.5 w-3.5" /> Ver candidatos
                  </Btn>
                </Link>
                {job.status === 'OPEN' && (
                  <Btn
                    variant="secondary"
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate('PAUSED')}
                  >
                    <Pause className="h-3.5 w-3.5" /> Pausar
                  </Btn>
                )}
                {job.status !== 'CLOSED' && job.status !== 'CANCELLED' && (
                  <Btn
                    variant="ghost"
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate('CLOSED')}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Encerrar
                  </Btn>
                )}
              </div>
            </Card>
          </div>

          <aside className="space-y-5">
            <JobTechStack technologies={job.technologies} />

            {acceptedApp && (
              <CompletionConfirmationCard
                application={acceptedApp}
                viewerRole="company"
                onSuccess={refresh}
              />
            )}

            {completedApp && (
              <ReviewForm
                applicationId={completedApp.id}
                title="Avaliar freelancer"
                reviewStatus={reviewStatusQuery.data}
                isLoading={reviewStatusQuery.isLoading}
                onSuccess={refresh}
              />
            )}

            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Candidatos
                </h3>
                <Link to={`/empresa/candidatos?jobId=${job.id}`}>
                  <Btn size="sm" variant="secondary">
                    Ver todos
                  </Btn>
                </Link>
              </div>

              {appsQuery.isLoading && (
                <p className="mt-4 text-sm text-muted-foreground">Carregando candidaturas...</p>
              )}

              {!appsQuery.isLoading && applications.length === 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhuma candidatura recebida ainda.
                </p>
              )}

              <div className="mt-4 space-y-2">
                {applications.map((app) => (
                  <Link
                    key={app.id}
                    to={`/empresa/candidatos/${app.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-surface-muted/50"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                      {getInitials(app.user?.name ?? '?')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{app.user?.name ?? 'Candidato'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(app.createdAt)}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </Card>
          </aside>
        </div>
    </PageTransition>
  );
}
