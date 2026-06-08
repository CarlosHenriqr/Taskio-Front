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
  Star,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, Field, TextArea } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { JobDescriptionView } from '@/components/shared/JobDescriptionView';
import { JobMetaBar } from '@/components/shared/JobMetaBar';
import { JobTechStack } from '@/components/shared/JobTechStack';
import { freelancerNav } from '@/lib/nav';
import { applicationsApi } from '@/lib/api/applications.api';
import { reviewsApi } from '@/lib/api/reviews.api';
import { formatRelativeDate, mapApiErrors } from '@/lib/utils';
import { invalidateApplications } from '@/lib/queryInvalidation';
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
      <Card className="border-success/30 bg-success/5 p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="font-display font-semibold text-success">Candidatura aceita!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {companyName ?? 'A empresa'} aceitou sua candidatura. Em breve entrará em contato
              pelo seu <strong>e-mail</strong> ou <strong>telefone</strong> cadastrados no perfil.
            </p>
            {(companyEmail || companyPhone) && (
              <div className="mt-3 space-y-1 text-sm">
                <p className="font-medium">Contato da empresa:</p>
                {companyEmail && (
                  <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {companyEmail}
                  </p>
                )}
                {companyPhone && (
                  <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {companyPhone}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (status === 'REJECTED') {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-5">
        <div className="flex gap-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-display font-semibold text-destructive">Candidatura recusada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Desta vez não deu certo, mas continue explorando outras vagas compatíveis com seu
              perfil.
            </p>
            <Link to="/freelancer/vagas" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              Buscar outras vagas
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  if (status === 'REVIEWED') {
    return (
      <Card className="border-info/30 bg-info/5 p-5">
        <div className="flex gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <div>
            <p className="font-display font-semibold">Em análise</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A empresa está avaliando seu perfil. Você será notificado quando houver uma decisão.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (status === 'PENDING') {
    return (
      <Card className="border-warning/30 bg-warning/5 p-5">
        <div className="flex gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" />
          <div>
            <p className="font-display font-semibold">Aguardando resposta</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sua candidatura foi enviada. A empresa ainda não respondeu.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}

export function FreelancerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  const detailQuery = useQuery({
    queryKey: ['my-applications', id],
    queryFn: () => applicationsApi.getById(id!),
    enabled: !!id,
  });

  const application = detailQuery.data;
  const job = application?.job;
  const company = job?.company;

  const cancelMutation = useMutation({
    mutationFn: () => applicationsApi.cancel(id!),
    onSuccess: async () => {
      await invalidateApplications(queryClient);
      toast.success('Candidatura cancelada.');
      navigate('/freelancer/trabalhos');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        applicationId: id!,
        rating,
        comment: comment || undefined,
      }),
    onSuccess: () => {
      toast.success('Avaliação enviada!');
      setComment('');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  if (detailQuery.isLoading) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Trabalho" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <PageLoader />
      </AppShell>
    );
  }

  if (detailQuery.isError || !application) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Trabalho" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <ErrorState title="Candidatura não encontrada" onRetry={() => detailQuery.refetch()} />
      </AppShell>
    );
  }

  const canCancel = CANCELLABLE.includes(application.status);

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title={job?.title ?? 'Candidatura'}
      description={company?.name}
      actions={
        <Link to="/freelancer/trabalhos">
          <Btn variant="secondary" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Btn>
        </Link>
      }
    >
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
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <ApplicationStatusBadge status={application.status} />
                <span className="text-xs text-muted-foreground">
                  Candidatura enviada {formatRelativeDate(application.createdAt)}
                </span>
              </div>

              <h2 className="mt-4 font-display text-xl font-bold">{job?.title}</h2>

              <JobMetaBar
                className="mt-3"
                companyName={company?.name}
                deadline={job?.deadline}
                expiresAt={job?.expiresAt}
                createdAt={job?.createdAt}
                status={job?.status}
              />

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
            </Card>

            {application.coverLetter && (
              <Card className="p-6">
                <h3 className="font-display font-semibold">Sua carta de apresentação</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </Card>
            )}

            {application.resumeUrl && (
              <Card className="p-6">
                <h3 className="font-display font-semibold">Currículo enviado</h3>
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir currículo
                </a>
              </Card>
            )}
          </div>

          <aside className="space-y-5">
            <JobTechStack technologies={job?.technologies} />

            {canCancel && (
              <Card className="p-6">
                <h3 className="font-display font-semibold">Gerenciar candidatura</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Você pode cancelar enquanto a candidatura estiver pendente ou em análise.
                </p>
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
              </Card>
            )}

            <Card className="p-6">
              <h3 className="font-display font-semibold">Empresa</h3>
              <p className="mt-2 font-medium">{company?.name ?? '—'}</p>
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
            </Card>

            {application.status === 'COMPLETED' && (
              <Card className="p-6">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-warning" /> Avaliar empresa
                </h3>
                <form
                  className="mt-4 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    reviewMutation.mutate();
                  }}
                >
                  <Field label="Nota (1-5)">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                    />
                  </Field>
                  <Field label="Comentário">
                    <TextArea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Como foi trabalhar neste projeto?"
                    />
                  </Field>
                  <Btn type="submit" className="w-full" disabled={reviewMutation.isPending}>
                    Enviar avaliação
                  </Btn>
                </form>
              </Card>
            )}
          </aside>
        </div>
      </PageTransition>
    </AppShell>
  );
}
