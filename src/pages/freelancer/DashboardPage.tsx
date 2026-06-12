import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, RefreshCw, Sparkles, Star, ArrowUpRight } from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Badge, Btn, StatCard } from '@/components/taskio/ui';
import { ListItemCard, MetaChip, SectionCard } from '@/components/shared/ContentCards';
import { formatJobPayment } from '@/lib/jobPayment';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { useAuth } from '@/contexts/AuthContext';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { applicationsApi } from '@/lib/api/applications.api';
import { reviewsApi } from '@/lib/api/reviews.api';
import { useRecommendedJobs } from '@/hooks/useRecommendedJobs';
import { formatRelativeDate } from '@/lib/utils';
import { queryKeys } from '@/lib/queryKeys';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function buildChartData(apps: { createdAt: string }[]) {
  const counts = new Array(7).fill(0);
  const now = new Date();
  apps.forEach((a) => {
    const diffDays = Math.floor((now.getTime() - new Date(a.createdAt).getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 7) counts[6 - diffDays]++;
  });
  return DAYS.map((day, i) => ({ day, propostas: counts[i] }));
}

export function FreelancerDashboardPage() {
  const { user } = useAuth();

  const appsQuery = useQuery({
    queryKey: queryKeys.applications.all(user!.id),
    queryFn: () => applicationsApi.myApplications(),
    enabled: !!user?.id,
  });

  const { jobs: recommendedJobs } = useRecommendedJobs(20);

  const reviewsQuery = useQuery({
    queryKey: queryKeys.reviews.summary(user!.id),
    queryFn: () => reviewsApi.summary(),
    enabled: !!user?.id,
  });

  const apps = appsQuery.data ?? [];
  const inProgress = apps.filter((a) => a.status === 'ACCEPTED').length;
  const chartData = buildChartData(apps);
  const rating = reviewsQuery.data?.averageRating?.toFixed(1) ?? '—';

  usePageShell({
    title: 'Dashboard',
    description: 'Acompanhe candidaturas, propostas e ganhos.',
    primaryAction: { label: 'Ver vagas', to: '/freelancer/vagas' },
    actions: (
      <Link to="/freelancer/perfil/editar">
        <Btn size="sm">
          <ArrowUpRight className="h-3.5 w-3.5" /> Atualizar perfil
        </Btn>
      </Link>
    ),
  });

  return (
    <PageTransition>
        {appsQuery.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {appsQuery.isError && <ErrorState onRetry={() => appsQuery.refetch()} />}
        {!appsQuery.isLoading && !appsQuery.isError && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Candidaturas enviadas" value={apps.length} icon={Briefcase} />
              <StatCard
                label="Serviços em andamento"
                value={inProgress}
                deltaTone="neutral"
                icon={RefreshCw}
              />
              <StatCard
                label="Projetos recomendados"
                value={recommendedJobs.length}
                icon={Sparkles}
              />
              <StatCard
                label="Avaliação média"
                value={rating}
                delta={
                  reviewsQuery.data
                    ? `${reviewsQuery.data.totalReviews} reviews`
                    : undefined
                }
                deltaTone="neutral"
                icon={Star}
              />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <SectionCard title="Atividade da semana" description="Candidaturas enviadas.">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="oklch(0.925 0.008 80)" vertical={false} />
                      <XAxis dataKey="day" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                      <YAxis fontSize={11} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 6,
                          border: '1px solid oklch(0.925 0.008 80)',
                          fontSize: 12,
                          fontFamily: 'Plus Jakarta Sans',
                        }}
                      />
                      <Bar dataKey="propostas" fill="oklch(0.52 0.14 175)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard
                title="Vagas recomendadas"
                actionTo="/freelancer/recomendadas"
                actionLabel="Ver todas"
              >
                <div className="space-y-2">
                  {recommendedJobs.slice(0, 3).map((p) => (
                    <ListItemCard
                      key={p.id}
                      to={`/freelancer/vagas/${p.id}`}
                      title={p.title}
                      subtitle={p.company?.name ?? 'Empresa'}
                      badge={<Badge tone="success">{p.matchPercent}% compatível</Badge>}
                    />
                  ))}
                  {!recommendedJobs.length && (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma vaga com compatibilidade ≥ 70%. Complete sua stack técnica.
                    </p>
                  )}
                </div>
              </SectionCard>
            </div>

            <SectionCard
              className="mt-6"
              title="Candidaturas recentes"
              actionTo="/freelancer/trabalhos"
              actionLabel="Ver todas"
            >
              <div className="space-y-2">
                {apps.slice(0, 5).map((a) => {
                  const payment = a.job ? formatJobPayment(a.job) : null;
                  return (
                    <ListItemCard
                      key={a.id}
                      to={`/freelancer/trabalhos/${a.id}`}
                      title={a.job?.title ?? 'Projeto'}
                      subtitle={`${a.job?.company?.name ?? 'Empresa'} · ${formatRelativeDate(a.createdAt)}`}
                      detail={a.coverLetter?.trim() || undefined}
                      meta={payment ? <MetaChip>{payment}</MetaChip> : undefined}
                      trailing={<ApplicationStatusBadge status={a.status} />}
                    />
                  );
                })}
                {apps.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma candidatura ainda.</p>
                )}
              </div>
            </SectionCard>
          </>
        )}
    </PageTransition>
  );
}
