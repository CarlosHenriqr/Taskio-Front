import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Mail, Phone } from 'lucide-react';
import { Btn } from '@/components/taskio/ui';
import { ContentPanel, TechPill } from '@/components/shared/ContentCards';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { CompletionConfirmationCard } from '@/components/shared/CompletionConfirmationCard';
import { ReviewForm } from '@/components/shared/ReviewForm';
import { MatchScoreBadge, MatchScoreBar } from '@/components/shared/MatchScoreBadge';
import { ApplicationActions } from '@/components/empresa/ApplicationActions';
import { findCompanyApplication } from '@/lib/companyJobs';
import { profileApi } from '@/lib/api/profile.api';
import { reviewsApi } from '@/lib/api/reviews.api';
import { computeSkillMatch } from '@/lib/matching.util';
import { invalidateApplications } from '@/lib/queryInvalidation';
import { formatRelativeDate } from '@/lib/utils';

export function EmpresaCandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ['company', 'application', id],
    queryFn: () => findCompanyApplication(id!),
    enabled: !!id,
  });

  const application = detailQuery.data?.application;
  const job = detailQuery.data?.job;
  const candidateName = application?.user?.name ?? 'Candidato';

  usePageShell({
    title: application ? 'Perfil do candidato' : 'Candidato',
    actions: application ? (
      <Link to="/empresa/candidatos">
        <Btn variant="secondary" size="sm">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Btn>
      </Link>
    ) : undefined,
  });

  const reviewStatusQuery = useQuery({
    queryKey: ['reviews', 'application', id],
    queryFn: () => reviewsApi.applicationStatus(id!),
    enabled: !!id && application?.status === 'COMPLETED',
  });

  const refreshApplication = async () => {
    await invalidateApplications(queryClient);
    const result = await detailQuery.refetch();
    if (result.data?.application?.status === 'COMPLETED') {
      await queryClient.invalidateQueries({ queryKey: ['reviews', 'application', id] });
    }
  };

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
    return <PageLoader />;
  }

  if (detailQuery.isError || !application) {
    return <ErrorState title="Candidatura não encontrada" onRetry={() => detailQuery.refetch()} />;
  }

  return (
    <PageTransition>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <ContentPanel>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <UserAvatar
                  name={candidateName}
                  avatarUrl={profile?.avatarUrl ?? application.user?.avatarUrl}
                  className="h-20 w-20 text-2xl"
                />
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
            </ContentPanel>

            {application.coverLetter && (
              <ContentPanel title="Carta de apresentação">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </ContentPanel>
            )}

            {profile?.bio && (
              <ContentPanel title="Sobre">
                <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              </ContentPanel>
            )}

            {profile?.experiences && profile.experiences.length > 0 && (
              <ContentPanel title="Experiência profissional">
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
              </ContentPanel>
            )}
          </div>

          <aside className="space-y-5">
            <ContentPanel title="Compatibilidade">
              <MatchScoreBar score={matchData.matchPercent} className="mt-3" />
              {!!matchData.matchedTechnologies.length && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground">Tecnologias em comum</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {matchData.matchedTechnologies.map((tech) => (
                      <TechPill key={tech} highlight>
                        {tech}
                      </TechPill>
                    ))}
                  </div>
                </div>
              )}
              {!matchData.matchedTechnologies.length && matchData.matchPercent === 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Nenhuma tecnologia da vaga encontrada no perfil do candidato.
                </p>
              )}
            </ContentPanel>

            <ContentPanel title="Decisão">
              <ApplicationActions
                applicationId={application.id}
                status={application.status}
                candidateName={candidateName}
                onSuccess={() => detailQuery.refetch()}
              />
            </ContentPanel>

            {application.status === 'ACCEPTED' && (
              <CompletionConfirmationCard
                application={application}
                viewerRole="company"
                onSuccess={refreshApplication}
              />
            )}

            {application.status === 'COMPLETED' && (
              <ReviewForm
                applicationId={application.id}
                title="Avaliar freelancer"
                reviewStatus={reviewStatusQuery.data}
                isLoading={reviewStatusQuery.isLoading}
                onSuccess={refreshApplication}
              />
            )}

            <ContentPanel title="Vaga">
              <p className="font-medium">{job?.title}</p>
              <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                {job?.description}
              </p>
            </ContentPanel>

            {profile?.techStack && profile.techStack.length > 0 && (
              <ContentPanel title="Stack">
                <div className="flex flex-wrap gap-1.5">
                  {profile.techStack.map((s) => (
                    <TechPill key={s.technology.id}>{s.technology.name}</TechPill>
                  ))}
                </div>
              </ContentPanel>
            )}

            {profile?.portfolio && profile.portfolio.length > 0 && (
              <ContentPanel title="Portfólio">
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
              </ContentPanel>
            )}
          </aside>
        </div>
    </PageTransition>
  );
}
