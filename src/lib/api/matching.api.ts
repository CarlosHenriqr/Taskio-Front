import { apiRequest } from '@/lib/api/client';
import { withNormalizedMatch } from '@/lib/matching.util';
import type { MatchingJob, RecommendedCandidate } from '@/types/api';

type RawMatchingJob = MatchingJob & { matchScore?: number; matchPercent?: number };
type RawRecommendedCandidate = RecommendedCandidate & {
  matchScore?: number;
  matchPercent?: number;
};

export const matchingApi = {
  recommendedJobs: async (limit = 20): Promise<MatchingJob[]> => {
    const data = await apiRequest<RawMatchingJob[]>(`/matching/jobs?limit=${limit}`);
    return data.map((job) => withNormalizedMatch(job));
  },

  recommendedCandidates: async (jobId: string, limit = 20): Promise<RecommendedCandidate[]> => {
    const data = await apiRequest<RawRecommendedCandidate[]>(
      `/matching/jobs/${jobId}/candidates?limit=${limit}`,
    );
    return data.map((candidate) => withNormalizedMatch(candidate));
  },

  expressHiringInterest: (jobId: string, userId: string) =>
    apiRequest<{ jobId: string; jobTitle: string; candidateUserId: string; candidateName: string }>(
      `/matching/jobs/${jobId}/candidates/${userId}/interest`,
      { method: 'POST' },
    ),
};
