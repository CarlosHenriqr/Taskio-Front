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

export async function invalidatePublicJobs(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
}

export async function invalidateApplications(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.applications.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.company.all }),
  ]);
}

export async function invalidateMatching(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.matching.all });
}

export async function invalidateAfterJobPublish(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    invalidateCompany(queryClient),
    invalidatePublicJobs(queryClient),
    invalidateMatching(queryClient),
  ]);
}

export async function invalidateNotifications(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount }),
  ]);
}

export async function invalidateAdminUsers(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
}

export async function invalidateAdminJobs(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.admin.jobs });
}
