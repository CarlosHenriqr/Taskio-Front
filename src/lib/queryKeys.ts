export const queryKeys = {
  profile: {
    all: ['profile'] as const,
    me: (userId: string) => ['profile', 'me', userId] as const,
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
    all: (userId: string) => ['my-applications', userId] as const,
    list: (userId: string, statusFilter: string) => ['my-applications', userId, statusFilter] as const,
    detail: (userId: string, id: string) => ['my-applications', userId, id] as const,
  },
  matching: {
    all: ['matching'] as const,
    jobs: (limit?: number) => ['matching', 'jobs', limit] as const,
    candidates: (jobId: string) => ['matching', 'candidates', jobId] as const,
  },
  notifications: {
    all: (userId: string) => ['notifications', userId] as const,
    unreadCount: (userId: string) => ['notifications', userId, 'unread-count'] as const,
    panel: (userId: string) => ['notifications', userId, 'panel'] as const,
  },
  technologies: {
    all: ['technologies'] as const,
  },
  reviews: {
    summary: (userId: string) => ['reviews', userId, 'summary'] as const,
    received: (userId: string, page: number) => ['reviews', userId, 'received', page] as const,
  },
  admin: {
    users: (type: string) => ['admin', 'users', type] as const,
    jobs: ['admin', 'jobs'] as const,
  },
};
