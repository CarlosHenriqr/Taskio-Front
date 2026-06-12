import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { jobsApi } from '@/lib/api/jobs.api';
import { profileApi } from '@/lib/api/profile.api';
import { rankJobsByProfileMatch } from '@/lib/matching.util';
import { queryKeys } from '@/lib/queryKeys';
import type { MatchingJob } from '@/types/api';

export function useRecommendedJobs(limit?: number) {
  const { user } = useAuth();

  const jobsQuery = useQuery({
    queryKey: queryKeys.jobs.list('active'),
    queryFn: () => jobsApi.list({ active: true }),
  });

  const profileQuery = useQuery({
    queryKey: queryKeys.profile.me(user!.id),
    queryFn: () => profileApi.me(),
    enabled: !!user?.id,
  });

  const jobs = useMemo((): MatchingJob[] => {
    if (!jobsQuery.data || !profileQuery.data) return [];
    const userTechIds = profileQuery.data.techStack?.map((s) => s.technology.id) ?? [];
    const ranked = rankJobsByProfileMatch(jobsQuery.data, userTechIds);
    return limit ? ranked.slice(0, limit) : ranked;
  }, [jobsQuery.data, profileQuery.data, limit]);

  return {
    jobs,
    isLoading: jobsQuery.isLoading || profileQuery.isLoading,
    isError: jobsQuery.isError || profileQuery.isError,
    refetch: () => Promise.all([jobsQuery.refetch(), profileQuery.refetch()]),
  };
}
