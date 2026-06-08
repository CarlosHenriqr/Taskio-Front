import type { Job, JobTechnology } from '@/types/api';
import type { MatchingJob } from '@/types/api';

export const MIN_RECOMMENDED_MATCH = 70;

export type SkillMatchResult = {
  matchPercent: number;
  matchedTechnologies: string[];
};

type MatchScorable = {
  matchPercent?: number | null;
  matchScore?: number | null;
};

export function normalizeMatchPercent(item: MatchScorable): number {
  const raw = item.matchPercent ?? item.matchScore ?? 0;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function filterByMinMatch<T>(
  items: T[],
  getScore: (item: T) => number,
  min = MIN_RECOMMENDED_MATCH,
): T[] {
  return items
    .filter((item) => getScore(item) >= min)
    .sort((a, b) => getScore(b) - getScore(a));
}

export function computeSkillMatch(
  jobTechnologies: JobTechnology[] | undefined,
  userTechIds: string[],
): SkillMatchResult {
  const technologies = jobTechnologies ?? [];
  const userTechSet = new Set(userTechIds);

  const required = technologies.filter((jt) => jt.type === 'REQUIRED');
  const desirable = technologies.filter((jt) => jt.type === 'DESIRABLE');

  const matchedRequired = required.filter((jt) => userTechSet.has(jt.technology.id));
  const matchedDesirable = desirable.filter((jt) => userTechSet.has(jt.technology.id));

  const requiredScore = required.length
    ? (matchedRequired.length / required.length) * 100
    : 100;
  const desirableScore = desirable.length
    ? (matchedDesirable.length / desirable.length) * 100
    : 0;

  const matchPercent = Math.min(
    100,
    Math.round((requiredScore * 0.8 + desirableScore * 0.2) * 100) / 100,
  );

  const matchedTechnologies = [...matchedRequired, ...matchedDesirable].map(
    (jt) => jt.technology.name,
  );

  return { matchPercent, matchedTechnologies };
}

export function rankJobsByProfileMatch(
  jobs: Job[],
  userTechIds: string[],
  minMatch = MIN_RECOMMENDED_MATCH,
): MatchingJob[] {
  return jobs
    .map((job) => {
      const { matchPercent, matchedTechnologies } = computeSkillMatch(job.technologies, userTechIds);
      return { ...job, matchPercent, matchedTechnologies };
    })
    .filter((job) => job.matchPercent >= minMatch)
    .sort((a, b) => b.matchPercent - a.matchPercent);
}

export function withNormalizedMatch<T extends MatchScorable>(
  item: T,
): T & { matchPercent: number; matchScore: number } {
  const matchPercent = normalizeMatchPercent(item);
  return {
    ...item,
    matchPercent,
    matchScore: item.matchScore ?? matchPercent,
  };
}
