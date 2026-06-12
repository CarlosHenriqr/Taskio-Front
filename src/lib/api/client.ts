import type { ApiError, ApiSuccess, AuthTokens, AuthUser } from '@/types/api';
import { API_BASE } from '@/lib/api/config';

const TOKEN_KEY = 'taskio_access_token';
const REFRESH_KEY = 'taskio_refresh_token';
const USER_KEY = 'taskio_user';
const REMEMBER_ME_KEY = 'taskio_remember_me';

const AUTH_KEYS = [TOKEN_KEY, REFRESH_KEY, USER_KEY] as const;

function isRememberMeEnabled(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
}

function getAuthStorage(): Storage {
  return isRememberMeEnabled() ? localStorage : sessionStorage;
}

function clearStorageKeys(storage: Storage): void {
  for (const key of AUTH_KEYS) {
    storage.removeItem(key);
  }
}

function clearLegacyLocalStorageAuth(): void {
  clearStorageKeys(localStorage);
}

export function getAccessToken(): string | null {
  return getAuthStorage().getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return getAuthStorage().getItem(REFRESH_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = getAuthStorage().getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export type SetAuthSessionOptions = {
  rememberMe?: boolean;
};

export function setAuthSession(
  tokens: AuthTokens,
  user: AuthUser,
  options: SetAuthSessionOptions = {},
): void {
  const rememberMe = options.rememberMe ?? isRememberMeEnabled();
  localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');

  const target = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;

  clearStorageKeys(other);
  if (!rememberMe) {
    clearLegacyLocalStorageAuth();
  }

  target.setItem(TOKEN_KEY, tokens.accessToken);
  target.setItem(REFRESH_KEY, tokens.refreshToken);
  target.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(REMEMBER_ME_KEY);
  clearStorageKeys(localStorage);
  clearStorageKeys(sessionStorage);
}

export function migrateLegacyAuthStorage(): void {
  if (localStorage.getItem(REMEMBER_ME_KEY) !== null) return;

  const hasLegacyTokens =
    localStorage.getItem(TOKEN_KEY) || localStorage.getItem(REFRESH_KEY) || localStorage.getItem(USER_KEY);

  if (!hasLegacyTokens) return;

  const accessToken = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  if (accessToken && refreshToken && userRaw) {
    try {
      const user = JSON.parse(userRaw) as AuthUser;
      setAuthSession({ accessToken, refreshToken }, user, { rememberMe: true });
      return;
    } catch {
      clearLegacyLocalStorageAuth();
    }
  }
}

export const AUTH_SESSION_EXPIRED_EVENT = 'taskio:auth-session-expired';

export function notifyAuthSessionExpired(): void {
  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

let refreshPromise: Promise<(AuthTokens & { user?: AuthUser }) | null> | null = null;

export async function refreshAccessToken(options?: {
  silent?: boolean;
}): Promise<(AuthTokens & { user?: AuthUser }) | null> {
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
        const storage = getAuthStorage();
        storage.setItem(TOKEN_KEY, json.data.accessToken);
        storage.setItem(REFRESH_KEY, json.data.refreshToken);
        if (json.data.user) {
          storage.setItem(USER_KEY, JSON.stringify(json.data.user));
        }
        return {
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
          user: json.data.user,
        };
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
