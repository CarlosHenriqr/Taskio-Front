import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Briefcase, SlidersHorizontal, X } from 'lucide-react';
import { Btn, Card, Chip, EmptyState, Field } from '@/components/taskio/ui';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { PillFilter } from '@/components/shared/PillFilter';
import {
  DEADLINE_OPTIONS,
  MIN_MATCH_OPTIONS,
  SORT_OPTIONS,
  TECH_ROLE_OPTIONS,
  type DeadlineFilterValue,
  type MinMatchFilterValue,
  type SortFilterValue,
  type TechRoleFilterValue,
} from '@/components/shared/filters/jobsPageFilters';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { useAuth } from '@/contexts/AuthContext';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobCard } from '@/components/shared/JobCard';
import { jobsApi } from '@/lib/api/jobs.api';
import { profileApi } from '@/lib/api/profile.api';
import { technologiesApi } from '@/lib/api/technologies.api';
import { computeSkillMatch } from '@/lib/matching.util';
import { queryKeys } from '@/lib/queryKeys';

type SortOption = SortFilterValue;

export function FreelancerJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [minMatchFilter, setMinMatchFilter] = useState<MinMatchFilterValue>('');
  const [techFilter, setTechFilter] = useState('');
  const [techRoleFilter, setTechRoleFilter] = useState<TechRoleFilterValue>('');
  const [stackOnlyFilter, setStackOnlyFilter] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilterValue>('');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const jobsQuery = useQuery({
    queryKey: ['jobs', 'list', search],
    queryFn: () => jobsApi.list({ search: search || undefined, active: true }),
  });

  const profileQuery = useQuery({
    queryKey: queryKeys.profile.me(user!.id),
    queryFn: () => profileApi.me(),
    enabled: !!user?.id,
  });

  const techQuery = useQuery({
    queryKey: ['technologies'],
    queryFn: () => technologiesApi.list(),
  });

  const jobs = jobsQuery.data ?? [];

  const jobsWithMatch = useMemo(() => {
    const userTechIds = profileQuery.data?.techStack?.map((s) => s.technology.id) ?? [];
    return jobs.map((job) => ({
      job,
      matchPercent: computeSkillMatch(job.technologies, userTechIds).matchPercent,
    }));
  }, [jobs, profileQuery.data]);

  const userTechIds = useMemo(
    () => profileQuery.data?.techStack?.map((s) => s.technology.id) ?? [],
    [profileQuery.data],
  );
  const userTechIdSet = useMemo(() => new Set(userTechIds), [userTechIds]);

  const filteredJobs = useMemo(() => {
    let result = [...jobsWithMatch];

    if (minMatchFilter) {
      const min = Number(minMatchFilter);
      result = result.filter(({ matchPercent }) => matchPercent >= min);
    }

    if (stackOnlyFilter && userTechIdSet.size > 0) {
      result = result.filter(({ job }) =>
        job.technologies?.some((jt) => userTechIdSet.has(jt.technology.id)),
      );
    }

    if (techFilter) {
      result = result.filter(({ job }) =>
        job.technologies?.some(
          (jt) =>
            jt.technology.id === techFilter && (!techRoleFilter || jt.type === techRoleFilter),
        ),
      );
    } else if (techRoleFilter) {
      result = result.filter(({ job }) =>
        job.technologies?.some((jt) => jt.type === techRoleFilter),
      );
    }

    if (deadlineFilter) {
      const cutoff = Date.now() + Number(deadlineFilter) * 86_400_000;
      result = result.filter(({ job }) => new Date(job.expiresAt).getTime() <= cutoff);
    }

    if (sortBy === 'match') {
      result.sort((a, b) => b.matchPercent - a.matchPercent);
    } else if (sortBy === 'recent') {
      result.sort(
        (a, b) => new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime(),
      );
    } else if (sortBy === 'deadline_asc') {
      result.sort(
        (a, b) => new Date(a.job.expiresAt).getTime() - new Date(b.job.expiresAt).getTime(),
      );
    } else {
      result.sort(
        (a, b) => new Date(b.job.expiresAt).getTime() - new Date(a.job.expiresAt).getTime(),
      );
    }

    return result;
  }, [
    jobsWithMatch,
    minMatchFilter,
    techFilter,
    techRoleFilter,
    stackOnlyFilter,
    deadlineFilter,
    sortBy,
    userTechIdSet,
  ]);

  const hasActiveFilters =
    !!minMatchFilter ||
    !!techFilter ||
    !!techRoleFilter ||
    stackOnlyFilter ||
    !!deadlineFilter ||
    sortBy !== 'match';

  const clearFilters = () => {
    setMinMatchFilter('');
    setTechFilter('');
    setTechRoleFilter('');
    setStackOnlyFilter(false);
    setDeadlineFilter('');
    setSortBy('match');
  };

  const techFilterOptions = useMemo(() => {
    const stack = profileQuery.data?.techStack?.map((s) => s.technology) ?? [];
    const stackIds = new Set(stack.map((t) => t.id));
    const others = (techQuery.data ?? []).filter((t) => !stackIds.has(t.id));
    const all = [...stack, ...others];
    return { stack, others, all };
  }, [profileQuery.data, techQuery.data]);

  const sortLabels: Record<SortOption, string> = {
    match: 'Maior compatibilidade',
    recent: 'Mais recentes',
    deadline_asc: 'Prazo mais próximo',
    deadline_desc: 'Prazo mais distante',
  };

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (minMatchFilter) {
      chips.push({
        key: 'match',
        label: `≥ ${minMatchFilter}% compatível`,
        onRemove: () => setMinMatchFilter(''),
      });
    }

    if (techFilter) {
      const techName =
        techFilterOptions.all.find((t) => t.id === techFilter)?.name ?? 'Tecnologia';
      chips.push({
        key: 'tech',
        label: techName,
        onRemove: () => setTechFilter(''),
      });
    }

    if (techRoleFilter === 'REQUIRED') {
      chips.push({
        key: 'role',
        label: 'Skills obrigatórias',
        onRemove: () => setTechRoleFilter(''),
      });
    } else if (techRoleFilter === 'DESIRABLE') {
      chips.push({
        key: 'role',
        label: 'Skills desejáveis',
        onRemove: () => setTechRoleFilter(''),
      });
    }

    if (stackOnlyFilter) {
      chips.push({
        key: 'stack',
        label: 'Com minha stack',
        onRemove: () => setStackOnlyFilter(false),
      });
    }

    if (deadlineFilter) {
      chips.push({
        key: 'deadline',
        label: `Expira em ${deadlineFilter} dias`,
        onRemove: () => setDeadlineFilter(''),
      });
    }

    if (sortBy !== 'match') {
      chips.push({
        key: 'sort',
        label: sortLabels[sortBy],
        onRemove: () => setSortBy('match'),
      });
    }

    return chips;
  }, [
    minMatchFilter,
    techFilter,
    techRoleFilter,
    stackOnlyFilter,
    deadlineFilter,
    sortBy,
    techFilterOptions.all,
  ]);

  const activeFilterCount = activeFilterChips.length;

  usePageShell({
    title: 'Buscar vagas',
    description: 'Encontre projetos compatíveis com seu perfil técnico.',
    primaryAction: { label: 'Ver vagas', to: '/freelancer/vagas' },
  });

  return (
    <PageTransition>
        <Card className="mb-5 overflow-hidden p-0">
          <div className="flex items-stretch">
            <div className="relative flex min-w-0 flex-1 items-center">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="search"
                className="h-12 w-full bg-transparent pl-10 pr-10 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-0"
                placeholder="Buscar por título, stack ou empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') jobsQuery.refetch();
                }}
              />
              {search && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Limpar busca"
                  onClick={() => setSearch('')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Btn
              type="button"
              variant="ghost"
              size="md"
              className={`relative h-12 shrink-0 rounded-none border-l px-4 ${
                filtersOpen || hasActiveFilters
                  ? 'bg-primary/5 text-primary hover:bg-primary/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-label={filtersOpen ? 'Fechar filtros' : 'Abrir filtros'}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Btn>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/25 px-4 py-2.5">
            <span className="text-xs text-muted-foreground">
              {jobsQuery.isLoading
                ? 'Carregando vagas...'
                : `${filteredJobs.length} ${filteredJobs.length === 1 ? 'vaga' : 'vagas'}${
                    jobs.length !== filteredJobs.length ? ` de ${jobs.length}` : ''
                  }`}
            </span>
            {activeFilterChips.map((chip) => (
              <Chip key={chip.key} onRemove={chip.onRemove}>
                {chip.label}
              </Chip>
            ))}
            {hasActiveFilters && (
              <Btn
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-7 px-2 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                Limpar tudo
              </Btn>
            )}
          </div>

          {filtersOpen && (
            <div className="space-y-4 border-t bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Refinar resultados
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Compatibilidade">
                  <PillFilter
                    value={minMatchFilter}
                    onChange={setMinMatchFilter}
                    options={MIN_MATCH_OPTIONS}
                    ariaLabel="Filtrar por compatibilidade mínima"
                    showCounts={false}
                    size="sm"
                  />
                </Field>
                <Field label="Tipo na vaga">
                  <PillFilter
                    value={techRoleFilter}
                    onChange={setTechRoleFilter}
                    options={TECH_ROLE_OPTIONS}
                    ariaLabel="Filtrar por tipo de tecnologia na vaga"
                    showCounts={false}
                    size="sm"
                  />
                </Field>
                <Field label="Prazo de inscrição">
                  <PillFilter
                    value={deadlineFilter}
                    onChange={setDeadlineFilter}
                    options={DEADLINE_OPTIONS}
                    ariaLabel="Filtrar por prazo de inscrição"
                    showCounts={false}
                    size="sm"
                  />
                </Field>
                <Field label="Ordenar por">
                  <PillFilter
                    value={sortBy}
                    onChange={setSortBy}
                    options={SORT_OPTIONS}
                    ariaLabel="Ordenar listagem de vagas"
                    showCounts={false}
                    size="sm"
                  />
                </Field>
                <Field label="Tecnologia" className="lg:col-span-2">
                  <FilterSelect value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
                    <option value="">Todas as tecnologias</option>
                    {techFilterOptions.stack.length > 0 && (
                      <optgroup label="Minha stack">
                        {techFilterOptions.stack.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {techFilterOptions.others.length > 0 && (
                      <optgroup label="Outras tecnologias">
                        {techFilterOptions.others.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </FilterSelect>
                </Field>
                {userTechIds.length > 0 && (
                  <Field label="Perfil" className="lg:col-span-2">
                    <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border/70 bg-surface px-3 text-sm transition-colors hover:border-primary/25 hover:bg-surface-muted/40">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border accent-primary"
                        checked={stackOnlyFilter}
                        onChange={(e) => setStackOnlyFilter(e.target.checked)}
                      />
                      Só vagas com minha stack
                    </label>
                  </Field>
                )}
              </div>
            </div>
          )}
        </Card>

        {jobsQuery.isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {jobsQuery.isError && <ErrorState onRetry={() => jobsQuery.refetch()} />}
        {!jobsQuery.isLoading && jobs.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="Nenhuma vaga encontrada"
            description="Tente outros termos de busca ou volte mais tarde."
          />
        )}
        {!jobsQuery.isLoading && jobs.length > 0 && filteredJobs.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="Nenhuma vaga com esses filtros"
            description={
              hasActiveFilters
                ? 'Ajuste os filtros de compatibilidade, tecnologia ou prazo.'
                : 'Tente alterar a ordenação ou os termos de busca.'
            }
          />
        )}
        <div className="space-y-4">
          {filteredJobs.map(({ job, matchPercent }) => (
            <JobCard
              key={job.id}
              job={job}
              detailPath={`/freelancer/vagas/${job.id}`}
              matchPercent={profileQuery.data ? matchPercent : undefined}
              showApply
              onApply={() => navigate(`/freelancer/vagas/${job.id}`)}
            />
          ))}
        </div>
    </PageTransition>
  );
}
