import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card, Field, TextArea } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobDescriptionView } from '@/components/shared/JobDescriptionView';
import { JobMetaBar } from '@/components/shared/JobMetaBar';
import { JobPaymentBlock } from '@/components/shared/JobPaymentBlock';
import { JobTechStack } from '@/components/shared/JobTechStack';
import { jobsApi } from '@/lib/api/jobs.api';
import { profileApi } from '@/lib/api/profile.api';
import { mapApiErrors } from '@/lib/utils';
import { invalidateApplications } from '@/lib/queryInvalidation';
import { queryKeys } from '@/lib/queryKeys';
import { ApiRequestError } from '@/lib/api/client';

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function FreelancerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(() => setCooldownSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  const jobQuery = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id!),
    enabled: !!id,
  });

  const profileQuery = useQuery({
    queryKey: queryKeys.profile.me(user!.id),
    queryFn: () => profileApi.me(),
    enabled: !!user?.id,
  });

  const hasResume = !!profileQuery.data?.resumeUrl?.trim();

  const applyMutation = useMutation({
    mutationFn: () => jobsApi.apply(id!, { coverLetter: coverLetter || undefined }),
    onSuccess: async () => {
      await invalidateApplications(queryClient);
      toast.success('Candidatura enviada com sucesso!');
      navigate('/freelancer/trabalhos');
    },
    onError: (err) => {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      if (err instanceof ApiRequestError && err.code === 'SESSION_EXPIRED') return;
      if (err instanceof ApiRequestError && err.code === 'APPLICATION_REAPPLY_COOLDOWN') {
        const seconds = Number(err.details?.retryAfterSeconds) || 0;
        if (seconds > 0) setCooldownSeconds(seconds);
      }
      toast.error(message);
    },
  });

  const job = jobQuery.data;

  usePageShell({
    title: job?.title ?? 'Projeto',
    description: job?.company?.name,
    primaryAction: { label: 'Ver projetos', to: '/freelancer/projetos' },
    actions: job ? (
      <Link to="/freelancer/projetos">
        <Btn variant="secondary" size="sm">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Btn>
      </Link>
    ) : undefined,
  });

  if (jobQuery.isLoading) {
    return <PageLoader />;
  }

  if (jobQuery.isError || !job) {
    return <ErrorState onRetry={() => jobQuery.refetch()} />;
  }

  return (
    <PageTransition>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <Card className="p-6">
              <h2 className="font-display text-xl font-bold tracking-tight">{job.title}</h2>
              <JobMetaBar
                className="mt-3"
                companyName={job.company?.name}
                reviewSummary={job.company?.reviewSummary}
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
                  <JobDescriptionView
                    description={job.description}
                    requirements={job.requirements}
                  />
                </div>
              </div>
            </Card>
          </div>

          <aside className="space-y-5">
            <JobTechStack technologies={job.technologies} />

            {job.status === 'OPEN' && (
              <Card className="p-6">
                <h3 className="font-display font-semibold">Candidatar-se</h3>
                {!hasResume && !profileQuery.isLoading && (
                  <p className="mt-2 text-sm text-destructive">
                    Publique seu currículo antes de se candidatar.{' '}
                    <Link to="/freelancer/perfil/editar" className="font-semibold underline">
                      Ir para editar perfil
                    </Link>
                  </p>
                )}
                <form
                  className="mt-4 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!hasResume) {
                      toast.error('Publique seu currículo em Editar perfil antes de se candidatar.');
                      return;
                    }
                    applyMutation.mutate();
                  }}
                >
                  <Field label="Carta de apresentação" error={errors.coverLetter}>
                    <TextArea
                      placeholder="Conte por que você é ideal para este projeto..."
                      rows={5}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </Field>
                  <Btn
                    className="w-full"
                    type="submit"
                    disabled={
                      applyMutation.isPending ||
                      !hasResume ||
                      profileQuery.isLoading ||
                      cooldownSeconds > 0
                    }
                  >
                    {cooldownSeconds > 0
                      ? `Aguarde ${formatCountdown(cooldownSeconds)} e tente novamente`
                      : applyMutation.isPending
                        ? 'Enviando...'
                        : 'Enviar candidatura'}
                  </Btn>
                </form>
              </Card>
            )}
            {job.status !== 'OPEN' && (
              <Card className="p-6 text-sm text-muted-foreground">
                Este projeto não está aceitando candidaturas no momento.
              </Card>
            )}
          </aside>
        </div>
    </PageTransition>
  );
}
