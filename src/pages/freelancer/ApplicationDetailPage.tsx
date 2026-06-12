import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Btn } from '@/components/taskio/ui';
import { ContentPanel, StatusAlertCard } from '@/components/shared/ContentCards';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { CompletionConfirmationCard } from '@/components/shared/CompletionConfirmationCard';
import { ReviewForm } from '@/components/shared/ReviewForm';
import { JobDescriptionView } from '@/components/shared/JobDescriptionView';
import { JobMetaBar } from '@/components/shared/JobMetaBar';
import { JobPaymentBlock } from '@/components/shared/JobPaymentBlock';
import { JobTechStack } from '@/components/shared/JobTechStack';
import { applicationsApi } from '@/lib/api/applications.api';
import { reviewsApi } from '@/lib/api/reviews.api';
import { formatRelativeDate, mapApiErrors } from '@/lib/utils';
import { invalidateApplications } from '@/lib/queryInvalidation';
import { queryKeys } from '@/lib/queryKeys';
import type { ApplicationStatus } from '@/types/api';

const CANCELLABLE: ApplicationStatus[] = ['PENDING', 'REVIEWED'];

function ApplicationStatusAlert({
  status,
  companyName,
  companyEmail,
  companyPhone,
}: {
  status: ApplicationStatus;
  companyName?: string;
  companyEmail?: string | null;
  companyPhone?: string | null;
}) {
  if (status === 'ACCEPTED') {
    return (
      <StatusAlertCard icon={CheckCircle2} title="Candidatura aceita!" tone="success">
        <p>
          {companyName ?? 'A empresa'} aceitou sua candidatura. Em breve entrará em contato
          pelo seu <strong>e-mail</strong> ou <strong>telefone</strong> cadastrados no perfil.
        </p>
        {(companyEmail || companyPhone) && (
          <div className="mt-3 space-y-1">
            <p className="font-medium text-foreground">Contato da empresa:</p>
            {companyEmail && (
              <p className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {companyEmail}
              </p>
            )}
            {companyPhone && (
              <p className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {companyPhone}
              </p>
            )}
          </div>
        )}
      </StatusAlertCard>
    );
  }

  if (status === 'REJECTED') {
    return (
      <StatusAlertCard icon={XCircle} title="Candidatura recusada" tone="danger">
        <p>
          Desta vez não deu certo, mas continue explorando outras vagas compatíveis com seu
          perfil.
        </p>
        <Link to="/freelancer/vagas" className="mt-3 inline-block font-semibold text-primary hover:underline">
          Buscar outras vagas
        </Link>
      </StatusAlertCard>
    );
  }

  if (status === 'REVIEWED') {
    return (
      <StatusAlertCard icon={Clock} title="Em análise" tone="info">
        A empresa está avaliando seu perfil. Você será notificado quando houver uma decisão.
      </StatusAlertCard>
    );
  }

  if (status === 'PENDING') {
    return (
      <StatusAlertCard icon={Clock} title="Aguardando resposta" tone="warning">
        Sua candidatura foi enviada. A empresa ainda não respondeu.
      </StatusAlertCard>
    );
  }

  return null;
}

export function FreelancerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const detailQuery = useQuery({
    queryKey: queryKeys.applications.detail(user!.id, id!),
    queryFn: () => applicationsApi.getById(id!),
    enabled: !!id && !!user?.id,
  });

  const application = detailQuery.data;
  const job = application?.job;
  const company = job?.company;

  const reviewStatusQuery = useQuery({
    queryKey: ['reviews', 'application', id],
    queryFn: () => reviewsApi.applicationStatus(id!),
    enabled: !!id && application?.status === 'COMPLETED',
  });

  const refreshApplication = async () => {
    await invalidateApplications(queryClient);
    const result = await detailQuery.refetch();
    if (result.data?.status === 'COMPLETED') {
      await queryClient.invalidateQueries({ queryKey: ['reviews', 'application', id] });
    }
  };

  const cancelMutation = useMutation({
    mutationFn: () => applicationsApi.cancel(id!),
    onSuccess: async () => {
      await invalidateApplications(queryClient);
      toast.success('Candidatura cancelada.');
      navigate('/freelancer/trabalhos');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  usePageShell({
    title: job?.title ?? 'Candidatura',
    description: company?.name,
    primaryAction: { label: 'Ver vagas', to: '/freelancer/vagas' },
    actions: application ? (
      <Link to="/freelancer/trabalhos">
        <Btn variant="secondary" size="sm">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Btn>
      </Link>
    ) : undefined,
  });

  if (detailQuery.isLoading) {
    return <PageLoader />;
  }

  if (detailQuery.isError || !application) {
    return <ErrorState title="Candidatura não encontrada" onRetry={() => detailQuery.refetch()} />;
  }

  const canCancel = CANCELLABLE.includes(application.status);

  return (
    <PageTransition>
        <div className="mb-5">
          <ApplicationStatusAlert
            status={application.status}
            companyName={company?.name}
            companyEmail={company?.email}
            companyPhone={company?.phone}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <ContentPanel>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <ApplicationStatusBadge status={application.status} />
                <span className="text-xs text-muted-foreground">
                  Candidatura enviada {formatRelativeDate(application.createdAt)}
                </span>
              </div>

              <h2 className="mt-4 font-display text-xl font-bold tracking-tight">{job?.title}</h2>

              <JobMetaBar
                className="mt-3"
                companyName={company?.name}
                deadline={job?.deadline}
                expiresAt={job?.expiresAt}
                createdAt={job?.createdAt}
                status={job?.status}
              />

              <JobPaymentBlock payment={job} className="mt-6" />

              <div className="mt-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Sobre a vaga
                </h3>
                <div className="mt-3">
                  <JobDescriptionView
                    description={job?.description}
                    requirements={job?.requirements}
                  />
                </div>
              </div>

              {job?.id && (
                <Link
                  to={`/freelancer/vagas/${job.id}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Ver página pública da vaga
                </Link>
              )}
            </ContentPanel>

            {application.coverLetter && (
              <ContentPanel title="Sua carta de apresentação">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </ContentPanel>
            )}

            {application.resumeUrl && (
              <ContentPanel title="Currículo enviado">
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir currículo
                </a>
              </ContentPanel>
            )}
          </div>

          <aside className="space-y-5">
            <JobTechStack technologies={job?.technologies} />

            {canCancel && (
              <ContentPanel
                title="Gerenciar candidatura"
                description="Você pode cancelar enquanto a candidatura estiver pendente ou em análise."
              >
                {!confirmCancel ? (
                  <Btn
                    className="mt-4 w-full"
                    variant="danger"
                    onClick={() => setConfirmCancel(true)}
                  >
                    Cancelar candidatura
                  </Btn>
                ) : (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Confirmar cancelamento?</p>
                    <div className="flex gap-2">
                      <Btn
                        className="flex-1"
                        variant="danger"
                        disabled={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate()}
                      >
                        {cancelMutation.isPending ? 'Cancelando...' : 'Sim, cancelar'}
                      </Btn>
                      <Btn
                        className="flex-1"
                        variant="secondary"
                        disabled={cancelMutation.isPending}
                        onClick={() => setConfirmCancel(false)}
                      >
                        Voltar
                      </Btn>
                    </div>
                  </div>
                )}
              </ContentPanel>
            )}

            <ContentPanel title="Empresa">
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={company?.name ?? 'Empresa'}
                  avatarUrl={company?.avatarUrl}
                  tone="neutral"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{company?.name ?? '—'}</p>
                  {company?.email && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> {company.email}
                    </p>
                  )}
                  {company?.phone && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" /> {company.phone}
                    </p>
                  )}
                </div>
              </div>
            </ContentPanel>

            {application.status === 'ACCEPTED' && (
              <CompletionConfirmationCard
                application={application}
                viewerRole="user"
                onSuccess={refreshApplication}
              />
            )}

            {application.status === 'COMPLETED' && (
              <ReviewForm
                applicationId={application.id}
                title="Avaliar empresa"
                reviewStatus={reviewStatusQuery.data}
                isLoading={reviewStatusQuery.isLoading}
                onSuccess={refreshApplication}
              />
            )}
          </aside>
        </div>
    </PageTransition>
  );
}
