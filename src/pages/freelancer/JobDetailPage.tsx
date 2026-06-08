import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, Field, TextArea } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobDescriptionView } from '@/components/shared/JobDescriptionView';
import { JobMetaBar } from '@/components/shared/JobMetaBar';
import { JobTechStack } from '@/components/shared/JobTechStack';
import { freelancerNav } from '@/lib/nav';
import { jobsApi } from '@/lib/api/jobs.api';
import { profileApi } from '@/lib/api/profile.api';
import { mapApiErrors } from '@/lib/utils';
import { invalidateApplications } from '@/lib/queryInvalidation';
import { ApiRequestError } from '@/lib/api/client';

export function FreelancerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const jobQuery = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id!),
    enabled: !!id,
  });

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.me(),
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
      toast.error(message);
    },
  });

  const job = jobQuery.data;

  if (jobQuery.isLoading) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Vaga" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <PageLoader />
      </AppShell>
    );
  }

  if (jobQuery.isError || !job) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Vaga" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <ErrorState onRetry={() => jobQuery.refetch()} />
      </AppShell>
    );
  }

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title={job.title}
      description={job.company?.name}
      actions={
        <Link to="/freelancer/vagas">
          <Btn variant="secondary" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Btn>
        </Link>
      }
    >
      <PageTransition>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <Card className="p-6">
              <h2 className="font-display text-xl font-bold tracking-tight">{job.title}</h2>
              <JobMetaBar
                className="mt-3"
                companyName={job.company?.name}
                deadline={job.deadline}
                expiresAt={job.expiresAt}
                createdAt={job.createdAt}
                status={job.status}
              />
              <div className="mt-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Sobre a vaga
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
                    disabled={applyMutation.isPending || !hasResume || profileQuery.isLoading}
                  >
                    {applyMutation.isPending ? 'Enviando...' : 'Enviar candidatura'}
                  </Btn>
                </form>
              </Card>
            )}
            {job.status !== 'OPEN' && (
              <Card className="p-6 text-sm text-muted-foreground">
                Esta vaga não está aceitando candidaturas no momento.
              </Card>
            )}
          </aside>
        </div>
      </PageTransition>
    </AppShell>
  );
}
