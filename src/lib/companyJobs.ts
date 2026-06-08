import { jobsApi } from '@/lib/api/jobs.api';
import { matchingApi } from '@/lib/api/matching.api';
import type { Application, Job } from '@/types/api';

export async function fetchCompanyJobs(companyId: string): Promise<Job[]> {
  const all = await jobsApi.list();
  return all.filter((j) => j.companyId === companyId);
}

export async function findCompanyApplication(
  companyId: string,
  applicationId: string,
): Promise<{ application: Application; job: Job } | null> {
  const jobs = await fetchCompanyJobs(companyId);
  for (const job of jobs) {
    const apps = (await jobsApi.listApplications(job.id)) as Application[];
    const found = apps.find((a) => a.id === applicationId);
    if (found) {
      let application: Application = { ...found, jobId: found.jobId ?? job.id };

      try {
        const matches = await matchingApi.recommendedCandidates(job.id, 100);
        const userId = found.userId ?? found.user?.id;
        const match = userId ? matches.find((m) => m.id === userId) : undefined;
        if (match) {
          application = {
            ...application,
            matchPercent: match.matchPercent,
            matchedTechnologies: match.matchedTechnologies,
          };
        }
      } catch {
        // candidatura permanece sem match da API de recomendação
      }

      return { application, job };
    }
  }
  return null;
}
