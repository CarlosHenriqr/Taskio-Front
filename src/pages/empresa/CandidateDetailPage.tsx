import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Mail, Phone } from 'lucide-react';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { MatchScoreBadge, MatchScoreBar } from '@/components/shared/MatchScoreBadge';
import { ApplicationActions } from '@/components/empresa/ApplicationActions';
import { empresaNav } from '@/lib/nav';
import { useAuth } from '@/contexts/AuthContext';
import { findCompanyApplication } from '@/lib/companyJobs';
import { profileApi } from '@/lib/api/profile.api';
import { computeSkillMatch } from '@/lib/matching.util';
import { getInitials, formatRelativeDate } from '@/lib/utils';

export function EmpresaCandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const detailQuery = useQuery({
    queryKey: ['company', 'application', id],
    queryFn: () => findCompanyApplication(user!.id, id!),
    enabled: !!user?.id && !!id,
  });

  const application = detailQuery.data?.application;
  const job = detailQuery.data?.job;

  const candidateUserId = application?.userId ?? application?.user?.id;

  const profileQuery = useQuery({
    queryKey: ['profile', 'public', candidateUserId],
    queryFn: () => profileApi.getPublicUser(candidateUserId!),
    enabled: !!candidateUserId,
  });

  const profile = profileQuery.data;

  const matchData = useMemo(() => {
    if (job?.technologies?.length && profile?.techStack?.length) {
      return computeSkillMatch(
        job.technologies,
        profile.techStack.map((s) => s.technology.id),
      );
    }
    if (application?.matchPercent != null) {
      return {
        matchPercent: application.matchPercent,
        matchedTechnologies: application.matchedTechnologies ?? [],
      };
    }
    return { matchPercent: 0, matchedTechnologies: [] as string[] };
  }, [application, job, profile]);

  if (detailQuery.isLoading) {
    return (
      <AppShell nav={empresaNav} subtitle="Empresa" title="Candidato" primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}>
        <PageLoader />
      </AppShell>
    );
  }

  if (detailQuery.isError || !application) {
    return (
      <AppShell nav={empresaNav} subtitle="Empresa" title="Candidato" primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}>
        <ErrorState title="Candidatura não encontrada" onRetry={() => detailQuery.refetch()} />
      </AppShell>
    );
  }

  const candidateName = application.user?.name ?? 'Candidato';

  return (
    <AppShell
      nav={empresaNav}
      subtitle="Empresa"
      primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}
      title="Perfil do candidato"
      actions={
        <Link to="/empresa/candidatos">
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="grid h-20 w-20 place-items-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                  {getInitials(candidateName)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl font-bold tracking-tight">{candidateName}</h2>
                    <ApplicationStatusBadge status={application.status} />
                    <MatchScoreBadge score={matchData.matchPercent} />
                  </div>
                  <p className="text-sm text-muted-foreground">{job?.title}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {application.user?.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {application.user.email}
                      </span>
                    )}
                    {application.user?.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {application.user.phone}
                      </span>
                    )}
                    <span>Candidatura {formatRelativeDate(application.createdAt)}</span>
                  </div>
                  {application.resumeUrl && (
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Ver currículo
                    </a>
                  )}
                </div>
              </div>
            </Card>

            {application.coverLetter && (
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold">Carta de apresentação</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </Card>
            )}

            {profile?.bio && (
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold">Sobre</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              </Card>
            )}

            {profile?.experiences && profile.experiences.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold">Experiência profissional</h3>
                <ol className="mt-4 space-y-5 border-l-2 border-border pl-5">
                  {profile.experiences.map((e) => (
                    <li key={e.id} className="relative">
                      <span className="absolute -left-[27px] top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-background bg-primary" />
                      <p className="font-display font-semibold">
                        {e.roleTitle ?? 'Cargo não informado'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.companyName} ·{' '}
                        {new Date(e.startDate).getFullYear()}
                        {e.endDate ? ` — ${new Date(e.endDate).getFullYear()}` : ' — Presente'}
                      </p>
                      {e.description && (
                        <p className="mt-1.5 text-sm text-muted-foreground">{e.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </Card>
            )}
          </div>

          <aside className="space-y-5">
            <Card className="p-6">
              <h3 className="font-display font-semibold">Compatibilidade</h3>
              <MatchScoreBar score={matchData.matchPercent} className="mt-3" />
              {!!matchData.matchedTechnologies.length && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground">Tecnologias em comum</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {matchData.matchedTechnologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!matchData.matchedTechnologies.length && matchData.matchPercent === 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Nenhuma tecnologia da vaga encontrada no perfil do candidato.
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Decisão</h3>
              <div className="mt-4">
                <ApplicationActions
                  applicationId={application.id}
                  status={application.status}
                  candidateName={candidateName}
                  onSuccess={() => detailQuery.refetch()}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Vaga</h3>
              <p className="mt-2 font-medium">{job?.title}</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-4">{job?.description}</p>
            </Card>

            {profile?.techStack && profile.techStack.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display font-semibold">Stack</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.techStack.map((s) => (
                    <span
                      key={s.technology.id}
                      className="rounded-md border bg-surface-muted px-2 py-0.5 text-xs font-medium"
                    >
                      {s.technology.name}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {profile?.portfolio && profile.portfolio.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display font-semibold">Portfólio</h3>
                <div className="mt-3 space-y-2">
                  {profile.portfolio.map((p) => (
                    <div key={p.id} className="rounded-lg border p-3">
                      <p className="font-semibold text-sm">{p.title}</p>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Ver projeto
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </PageTransition>
    </AppShell>
  );
}
