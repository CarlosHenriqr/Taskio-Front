/** Tempos de cache (ms) por domínio — reduz refetch desnecessário. */
export const STALE_TIME = {
  profile: 5 * 60 * 1000,
  plans: 5 * 60 * 1000,
  jobs: 2 * 60 * 1000,
  applications: 60 * 1000,
  notifications: 30 * 1000,
  matching: 2 * 60 * 1000,
  technologies: 10 * 60 * 1000,
  default: 60 * 1000,
} as const;

export const NOTIFICATION_POLL_MS = 30_000;
