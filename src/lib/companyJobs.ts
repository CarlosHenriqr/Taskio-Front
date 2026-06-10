import { applicationsApi } from '@/lib/api/applications.api';
import { jobsApi } from '@/lib/api/jobs.api';
import type { Application, ApplicationStatus, Job } from '@/types/api';

export async function fetchCompanyJobs(): Promise<Job[]> {
  return jobsApi.listMine();
}

export async function fetchCompanyApplications(params?: {
  jobId?: string;
  status?: ApplicationStatus;
}): Promise<Application[]> {
  return applicationsApi.listCompany(params);
}

export async function findCompanyApplication(
  applicationId: string,
): Promise<{ application: Application; job: Job } | null> {
  try {
    return await applicationsApi.getCompanyById(applicationId);
  } catch {
    return null;
  }
}
