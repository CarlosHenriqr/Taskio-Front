import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
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
import { cn, formatRelativeDate } from '@/lib/utils';
import { queryKeys } from '@/lib/queryKeys';

type ChartPeriod = '7d' | '1m' | '6m' | '1y';

const CHART_PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '1m', label: '1 mês' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 ano' },
];

const PERIOD_DESCRIPTION: Record<ChartPeriod, string> = {
  '7d': 'Candidaturas enviadas nos últimos 7 dias.',
  '1m': 'Candidaturas enviadas no último mês.',
  '6m': 'Candidaturas enviadas nos últimos 6 meses.',
  '1y': 'Candidaturas enviadas no último ano.',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildChartData(apps: { createdAt: string }[], period: ChartPeriod) {
  const now = new Date();

  if (period === '6m' || period === '1y') {
    const months = period === '6m' ? 6 : 12;
    const buckets = Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()], propostas: 0 };
    });
    const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));
    apps.forEach((a) => {
      const d = new Date(a.createdAt);
      const i = indexByKey.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (i !== undefined) buckets[i].propostas++;
    });
    return buckets.map(({ label, propostas }) => ({ label, propostas }));
  }

  const days = period === '7d' ? 7 : 30;
  const today = startOfDay(now);
  const counts = new Array(days).fill(0);
  apps.forEach((a) => {
    const d = startOfDay(new Date(a.createdAt));
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diff >= 0 && diff < days) counts[days - 1 - diff]++;
  });
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const label =
      period === '7d'
        ? WEEKDAYS[d.getDay()]
        : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { label, propostas: counts[i] };
  });
}

export function FreelancerDashboardPage() {
  const { user } = useAuth();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('7d');

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
  const chartData = useMemo(() => buildChartData(apps, chartPeriod), [apps, chartPeriod]);
  const rating = reviewsQuery.data?.averageRating?.toFixed(1) ?? '—';

  usePageShell({
    title: 'Dashboard',
    description: 'Acompanhe candidaturas, propostas e ganhos.',
    primaryAction: { label: 'Ver projetos', to: '/freelancer/projetos' },
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
              <SectionCard
                title="Atividade"
                description={PERIOD_DESCRIPTION[chartPeriod]}
                action={
                  <div className="flex shrink-0 flex-wrap gap-0.5 rounded-lg border border-border/70 bg-surface-muted/40 p-0.5">
                    {CHART_PERIODS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setChartPeriod(p.value)}
                        aria-pressed={chartPeriod === p.value}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                          chartPeriod === p.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="oklch(0.925 0.008 80)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        fontSize={11}
                        fontFamily="JetBrains Mono"
                        tickLine={false}
                        axisLine={false}
                        interval={chartPeriod === '1m' ? 3 : 0}
                        minTickGap={8}
                      />
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
                title="Projetos recomendados"
                actionTo="/freelancer/recomendadas"
                actionLabel="Ver todas"
              >
                <div className="space-y-2">
                  {recommendedJobs.slice(0, 3).map((p) => (
                    <ListItemCard
                      key={p.id}
                      to={`/freelancer/projetos/${p.id}`}
                      title={p.title}
                      subtitle={p.company?.name ?? 'Empresa'}
                      badge={<Badge tone="success">{p.matchPercent}% compatível</Badge>}
                    />
                  ))}
                  {!recommendedJobs.length && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum projeto com compatibilidade ≥ 70%. Complete sua stack técnica.
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
