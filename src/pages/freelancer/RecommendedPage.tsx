import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AppShell } from '@/components/taskio/AppShell';
import { EmptyState } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobCard } from '@/components/shared/JobCard';
import { freelancerNav } from '@/lib/nav';
import { useRecommendedJobs } from '@/hooks/useRecommendedJobs';

export function FreelancerRecommendedPage() {
  const navigate = useNavigate();
  const { jobs, isLoading, isError, refetch } = useRecommendedJobs();

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title="Vagas recomendadas"
      description="Projetos com maior compatibilidade com seu perfil técnico."
    >
      <PageTransition>
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !isError && jobs.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="Nenhuma recomendação"
            description="Nenhuma vaga com compatibilidade ≥ 70%. Complete sua stack técnica ou ajuste seu perfil."
          />
        )}
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              detailPath={`/freelancer/vagas/${job.id}`}
              matchPercent={job.matchPercent}
              showApply
              onApply={() => navigate(`/freelancer/vagas/${job.id}`)}
            />
          ))}
        </div>
      </PageTransition>
    </AppShell>
  );
}
