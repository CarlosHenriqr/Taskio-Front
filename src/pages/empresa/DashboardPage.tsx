import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  Users,
  RefreshCw,
  Star,
  ArrowUpRight,
  Handshake,
  FolderKanban,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Badge, Btn, StatCard } from '@/components/taskio/ui';
import {
  HighlightCard,
  ListItemCard,
  MetaChip,
  SectionCard,
  TechPill,
} from '@/components/shared/ContentCards';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { ProBadge } from '@/components/shared/ProBadge';
import { formatJobPayment } from '@/lib/jobPayment';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { ApiRequestError } from '@/lib/api/client';
import { fetchCompanyApplications, fetchCompanyJobs } from '@/lib/companyJobs';
import { matchingApi } from '@/lib/api/matching.api';
import { filterByMinMatch } from '@/lib/matching.util';
import { cn, formatRelativeDate } from '@/lib/utils';
import type { Application, Job, RecommendedCandidate } from '@/types/api';

type RecommendedForJob = RecommendedCandidate & {
  jobId: string;
  jobTitle: string;
};

type ChartPeriod = '7d' | '1m' | '6m' | '1y';

const CHART_PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '1m', label: '1 mês' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 ano' },
];

const PERIOD_DESCRIPTION: Record<ChartPeriod, string> = {
  '7d': 'Candidaturas recebidas nos últimos 7 dias.',
  '1m': 'Candidaturas recebidas no último mês.',
  '6m': 'Candidaturas recebidas nos últimos 6 meses.',
  '1y': 'Candidaturas recebidas no último ano.',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildChartData(applications: Application[], period: ChartPeriod) {
  const now = new Date();

  if (period === '6m' || period === '1y') {
    const months = period === '6m' ? 6 : 12;
    const buckets = Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()], candidatos: 0 };
    });
    const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));
    applications.forEach((a) => {
      const d = new Date(a.createdAt);
      const i = indexByKey.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (i !== undefined) buckets[i].candidatos++;
    });
    return buckets.map(({ label, candidatos }) => ({ label, candidatos }));
  }

  const days = period === '7d' ? 7 : 30;
  const today = startOfDay(now);
  const counts = new Array(days).fill(0);
  applications.forEach((a) => {
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
    return { label, candidatos: counts[i] };
  });
}

function interestKey(jobId: string, userId: string) {
  return `${jobId}:${userId}`;
}

export function EmpresaDashboardPage() {
  const { user } = useAuth();
  const [sentInterests, setSentInterests] = useState<Set<string>>(new Set());
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('7d');

  usePageShell({
    title: 'Dashboard',
    description: 'Acompanhe o pulso dos seus projetos e candidaturas.',
    actions: (
      <Link to="/empresa/conta">
        <Btn size="sm" variant="secondary">
          <ArrowUpRight className="h-3.5 w-3.5" /> Atualizar perfil
        </Btn>
      </Link>
    ),
  });

  const jobsQuery = useQuery({
    queryKey: ['company', 'jobs', user?.id],
    queryFn: () => fetchCompanyJobs(),
    enabled: !!user?.id,
  });

  const appsQuery = useQuery({
    queryKey: ['company', 'applications', user?.id],
    queryFn: () => fetchCompanyApplications(),
    enabled: !!user?.id,
  });

  const jobs = jobsQuery.data ?? [];
  const openJobs = useMemo(
    () => jobs.filter((j) => j.status === 'OPEN').slice(0, 3),
    [jobs],
  );

  const recommendationQueries = useQueries({
    queries: openJobs.map((job) => ({
      queryKey: ['matching', 'candidates', job.id],
      queryFn: () => matchingApi.recommendedCandidates(job.id, 8),
      enabled: !!job.id,
    })),
  });

  const recommendedCandidates = useMemo(() => {
    const items: RecommendedForJob[] = openJobs.flatMap((job, index) => {
      const candidates = recommendationQueries[index]?.data ?? [];
      return filterByMinMatch(candidates, (c) => c.matchPercent)
        .slice(0, 2)
        .map((candidate) => ({
          ...candidate,
          jobId: job.id,
          jobTitle: job.title,
        }));
    });

    return items.sort((a, b) => b.matchPercent - a.matchPercent).slice(0, 4);
  }, [openJobs, recommendationQueries]);

  const interestMutation = useMutation({
    mutationFn: ({ jobId, userId }: { jobId: string; userId: string }) =>
      matchingApi.expressHiringInterest(jobId, userId),
    onSuccess: (data) => {
      setSentInterests((prev) => new Set(prev).add(interestKey(data.jobId, data.candidateUserId)));
      toast.success(`Interesse enviado para ${data.candidateName} no projeto "${data.jobTitle}".`);
    },
    onError: (error, variables) => {
      const code = error instanceof ApiRequestError ? error.code : undefined;
      if (code === 'INTEREST_ALREADY_SENT') {
        setSentInterests((prev) => new Set(prev).add(interestKey(variables.jobId, variables.userId)));
        toast.info('Você já manifestou interesse neste candidato para este projeto.');
        return;
      }
      if (code === 'CANDIDATE_ALREADY_APPLIED') {
        toast.info('Este candidato já se candidatou a este projeto.');
        return;
      }
      toast.error(
        error instanceof ApiRequestError ? error.message : 'Não foi possível enviar o interesse.',
      );
    },
  });

  const recommendationsLoading =
    openJobs.length > 0 && recommendationQueries.some((q) => q.isLoading);
  const applications = appsQuery.data ?? [];
  const openJobsCount = jobs.filter((j) => j.status === 'OPEN').length;
  const inProgress = applications.filter((a) => a.status === 'ACCEPTED').length;
  const chartData = useMemo(
    () => buildChartData(applications, chartPeriod),
    [applications, chartPeriod],
  );
  const isLoading = jobsQuery.isLoading;
  const isError = jobsQuery.isError;

  const content = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <ErrorState
          description="Não foi possível carregar o dashboard."
          onRetry={() => jobsQuery.refetch()}
        />
      );
    }
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Projetos publicados" value={jobs.length} icon={Briefcase} />
          <StatCard
            label="Candidatos recebidos"
            value={applications.length}
            icon={Users}
          />
          <StatCard
            label="Em andamento"
            value={inProgress}
            delta={openJobsCount > 0 ? `${openJobsCount} projetos abertos` : undefined}
            deltaTone="neutral"
            icon={RefreshCw}
          />
          <StatCard label="Projetos abertos" value={openJobsCount} deltaTone="neutral" icon={Star} />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.52 0.14 175)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="oklch(0.52 0.14 175)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.925 0.008 80)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="oklch(0.52 0.02 80)"
                    fontSize={11}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={false}
                    interval={chartPeriod === '1m' ? 3 : 0}
                    minTickGap={8}
                  />
                  <YAxis
                    stroke="oklch(0.52 0.02 80)"
                    fontSize={11}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 6,
                      border: '1px solid oklch(0.925 0.008 80)',
                      fontSize: 12,
                      fontFamily: 'Plus Jakarta Sans',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="candidatos"
                    stroke="oklch(0.52 0.14 175)"
                    strokeWidth={2}
                    fill="url(#c1)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Projetos recentes"
            actionTo="/empresa/projetos"
            actionLabel="Ver todas"
          >
            <div className="space-y-2">
              {jobs.slice(0, 3).map((p: Job) => {
                const payment = formatJobPayment(p);
                return (
                  <ListItemCard
                    key={p.id}
                    to={`/empresa/projetos/${p.id}`}
                    title={p.title}
                    subtitle={`${formatRelativeDate(p.createdAt)} · ${p._count?.applications ?? 0} candidatos`}
                    meta={payment ? <MetaChip>{payment}</MetaChip> : undefined}
                    trailing={<JobStatusBadge status={p.status} />}
                  />
                );
              })}
              {jobs.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum projeto publicado ainda.</p>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          className="mt-6"
          title="Candidatos recomendados"
          description="Matches por projeto aberto. Manifeste interesse e o candidato receberá uma notificação no app."
          actionTo="/empresa/candidatos"
          actionLabel="Ver todos"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendationsLoading &&
              Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
            {!recommendationsLoading &&
              recommendedCandidates.map((c) => {
                const sent = sentInterests.has(interestKey(c.jobId, c.id));
                const pending =
                  interestMutation.isPending &&
                  interestMutation.variables?.jobId === c.jobId &&
                  interestMutation.variables?.userId === c.id;

                return (
                  <HighlightCard key={`${c.jobId}-${c.id}`}>
                    <div className="flex items-start gap-3">
                      <UserAvatar name={c.name} avatarUrl={c.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1">
                            <p className="truncate font-display text-sm font-semibold">{c.name}</p>
                            {c.isFeatured && <ProBadge />}
                          </div>
                          <Badge tone="success">{c.matchPercent}% match</Badge>
                        </div>
                        <Link
                          to={`/empresa/projetos/${c.jobId}`}
                          className="mt-1.5 inline-flex max-w-full items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <FolderKanban className="h-3 w-3 shrink-0" />
                          <span className="truncate">Projeto: {c.jobTitle}</span>
                        </Link>
                        {!!c.matchedTechnologies?.length && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {c.matchedTechnologies.slice(0, 3).map((tech) => (
                              <TechPill key={tech} highlight>
                                {tech}
                              </TechPill>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Btn
                      size="sm"
                      variant={sent ? 'secondary' : 'outline'}
                      className="w-full"
                      disabled={sent || pending}
                      onClick={() =>
                        interestMutation.mutate({ jobId: c.jobId, userId: c.id })
                      }
                    >
                      <Handshake className="h-3.5 w-3.5" />
                      {sent
                        ? 'Interesse enviado'
                        : pending
                          ? 'Enviando...'
                          : 'Tenho interesse em contratar'}
                    </Btn>
                  </HighlightCard>
                );
              })}
            {!recommendationsLoading && !recommendedCandidates.length && (
              <p className="col-span-2 text-sm text-muted-foreground">
                {openJobs.length > 0
                  ? 'Nenhum candidato com compatibilidade ≥ 70% nos projetos abertos.'
                  : 'Publique um projeto aberto para ver recomendações de candidatos.'}
              </p>
            )}
          </div>
        </SectionCard>
      </>
    );
  };

  return <PageTransition>{content()}</PageTransition>;
}
