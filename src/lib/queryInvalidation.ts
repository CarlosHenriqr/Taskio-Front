import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

export async function invalidateProfile(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.matching.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all }),
  ]);
}

export async function invalidateCompany(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.company.all });
}

export async function invalidateCompanyJobs(
  queryClient: QueryClient,
  userId?: string,
): Promise<void> {
  if (userId) {
    await queryClient.invalidateQueries({ queryKey: queryKeys.company.jobs(userId) });
  } else {
    await queryClient.invalidateQueries({ queryKey: ['company', 'jobs'] });
  }
}

export async function invalidateCompanyApplications(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['company', 'applications'] }),
    queryClient.invalidateQueries({ queryKey: ['company', 'all-applications'] }),
    queryClient.invalidateQueries({ queryKey: ['company', 'application'] }),
    queryClient.invalidateQueries({ queryKey: ['company', 'job-applications'] }),
  ]);
}

export async function invalidatePublicJobs(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
}

export async function invalidateApplications(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['my-applications'] }),
    invalidateCompanyApplications(queryClient),
    queryClient.invalidateQueries({ queryKey: ['plans', 'me'] }),
  ]);
}

export async function invalidateMatching(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.matching.all });
}

export async function invalidateAfterJobPublish(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    invalidateCompanyJobs(queryClient),
    invalidatePublicJobs(queryClient),
    invalidateMatching(queryClient),
    queryClient.invalidateQueries({ queryKey: ['plans', 'me'] }),
  ]);
}

export async function invalidateNotifications(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  ]);
}

export async function invalidatePlans(queryClient: QueryClient, userId?: string): Promise<void> {
  if (userId) {
    await queryClient.invalidateQueries({ queryKey: queryKeys.plans.me(userId) });
  } else {
    await queryClient.invalidateQueries({ queryKey: ['plans', 'me'] });
  }
}
