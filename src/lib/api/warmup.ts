import { API_BASE } from '@/lib/api/config';

let warmupStarted = false;

/** Dispara GET /health em background para reduzir cold start (ex.: Render). */
export function warmApiServer(): void {
  if (warmupStarted) return;
  warmupStarted = true;

  fetch(`${API_BASE}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {
    warmupStarted = false;
  });
}
