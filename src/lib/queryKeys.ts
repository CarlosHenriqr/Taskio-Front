export const queryKeys = {
  profile: {
    all: ['profile'] as const,
    me: ['profile', 'me'] as const,
    public: (userId: string) => ['profile', 'public', userId] as const,
  },
  company: {
    all: ['company'] as const,
    jobs: (userId: string) => ['company', 'jobs', userId] as const,
    applications: (userId: string, jobIds?: string[]) =>
      ['company', 'applications', userId, jobIds] as const,
    allApplications: (userId: string, jobIdFilter: string, statusFilter: string) =>
      ['company', 'all-applications', userId, jobIdFilter, statusFilter] as const,
    application: (id: string) => ['company', 'application', id] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    list: (search: string) => ['jobs', 'list', search] as const,
    detail: (id: string) => ['jobs', id] as const,
  },
  applications: {
    all: ['my-applications'] as const,
    list: (statusFilter: string) => ['my-applications', statusFilter] as const,
    detail: (id: string) => ['my-applications', id] as const,
  },
  matching: {
    all: ['matching'] as const,
    jobs: (limit?: number) => ['matching', 'jobs', limit] as const,
    candidates: (jobId: string) => ['matching', 'candidates', jobId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  technologies: {
    all: ['technologies'] as const,
  },
  reviews: {
    summary: ['reviews', 'summary'] as const,
    received: (page: number) => ['reviews', 'received', page] as const,
  },
  admin: {
    users: (type: string) => ['admin', 'users', type] as const,
    jobs: ['admin', 'jobs'] as const,
  },
};
