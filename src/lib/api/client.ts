import type { ApiError, ApiSuccess, AuthTokens, AuthUser } from '@/types/api';
import { API_BASE } from '@/lib/api/config';

const TOKEN_KEY = 'taskio_access_token';
const REFRESH_KEY = 'taskio_refresh_token';
const USER_KEY = 'taskio_user';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthSession(tokens: AuthTokens, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export const AUTH_SESSION_EXPIRED_EVENT = 'taskio:auth-session-expired';

export function notifyAuthSessionExpired(): void {
  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

let refreshPromise: Promise<AuthTokens | null> | null = null;

export async function refreshAccessToken(options?: { silent?: boolean }): Promise<AuthTokens | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
          if (!options?.silent) notifyAuthSessionExpired();
          return null;
        }
        const json = (await res.json()) as ApiSuccess<AuthTokens & { user?: AuthUser }>;
        localStorage.setItem(TOKEN_KEY, json.data.accessToken);
        localStorage.setItem(REFRESH_KEY, json.data.refreshToken);
        return { accessToken: json.data.accessToken, refreshToken: json.data.refreshToken };
      } catch {
        if (!options?.silent) notifyAuthSessionExpired();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, code?: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

  let res: Response;
  try {
    res = await doFetch();
  } catch {
    throw new ApiRequestError(0, 'Não foi possível conectar ao servidor. Verifique se a API está rodando.', 'NETWORK_ERROR');
  }

  if (res.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed.accessToken}`;
      res = await doFetch();
    } else {
      notifyAuthSessionExpired();
      throw new ApiRequestError(401, 'Sua sessão expirou. Faça login novamente.', 'SESSION_EXPIRED');
    }
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = json as ApiError;
    throw new ApiRequestError(
      res.status,
      err.message ?? 'Erro na requisição.',
      err.code,
      err.errors,
    );
  }

  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiSuccess<T>).data;
  }

  return json as T;
}
