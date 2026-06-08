import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, type LoginPayload, type RegisterCompanyPayload, type RegisterUserPayload } from '@/lib/api/auth.api';
import {
  AUTH_SESSION_EXPIRED_EVENT,
  clearAuthSession,
  getRefreshToken,
  getStoredUser,
  refreshAccessToken,
} from '@/lib/api/client';
import { getDashboardPath } from '@/lib/nav';
import type { AuthUser } from '@/types/api';
import { toast } from 'sonner';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<string>;
  registerUser: (payload: RegisterUserPayload) => Promise<string>;
  registerCompany: (payload: RegisterCompanyPayload) => Promise<string>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(() => !!getStoredUser() && !!getRefreshToken());

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      toast.error('Sua sessão expirou. Faça login novamente.');
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const storedUser = getStoredUser();
      const refreshToken = getRefreshToken();
      if (!storedUser || !refreshToken) {
        setIsInitializing(false);
        return;
      }

      const tokens = await refreshAccessToken({ silent: true });
      if (!tokens && !cancelled) {
        clearAuthSession();
        setUser(null);
      }
      if (!cancelled) setIsInitializing(false);
    }

    void bootstrapSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(payload);
      authApi.persistSession(data);
      setUser(data.user);
      return getDashboardPath(data.user.type, data.user.role);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerUser = useCallback(async (payload: RegisterUserPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.registerUser(payload);
      authApi.persistSession(data);
      setUser(data.user);
      return getDashboardPath(data.user.type, data.user.role);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerCompany = useCallback(async (payload: RegisterCompanyPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.registerCompany(payload);
      authApi.persistSession(data);
      setUser(data.user);
      return getDashboardPath(data.user.type, data.user.role);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      } else {
        clearAuthSession();
      }
    } catch {
      clearAuthSession();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isInitializing,
      login,
      registerUser,
      registerCompany,
      logout,
    }),
    [user, isLoading, isInitializing, login, registerUser, registerCompany, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
