/** URL base da API — sem barra no final. */
const PRODUCTION_API_FALLBACK = 'https://taskio-api-0vtm.onrender.com';

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, '');
}

export function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL;
  if (configured?.trim()) {
    return normalizeBaseUrl(configured);
  }

  if (import.meta.env.DEV) {
    return '/api';
  }

  console.warn(
    '[Taskio] VITE_API_URL ausente no build. Usando fallback da API Render. ' +
      'Defina VITE_API_URL no Cloudflare Pages e faça Retry deployment.',
  );
  return PRODUCTION_API_FALLBACK;
}

export const API_BASE = resolveApiBase();
