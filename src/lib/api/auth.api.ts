import { apiRequest, clearAuthSession, setAuthSession } from '@/lib/api/client';
import type { AuthTokens, AuthUser } from '@/types/api';

export type LoginPayload = {
  /** E-mail, CPF (freelancer) ou CNPJ (empresa), conforme o tipo de conta. */
  email: string;
  password: string;
  type: 'user' | 'company';
};

export type RegisterUserPayload = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone?: string;
};

export type RegisterCompanyPayload = {
  name: string;
  email: string;
  password: string;
  cnpj: string;
  segment?: string;
};

type AuthResponse = AuthTokens & { user: AuthUser };

export type PasswordResetAccountType = 'user' | 'company';

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: payload, auth: false }),

  registerUser: (payload: RegisterUserPayload) =>
    apiRequest<AuthResponse>('/auth/register/user', { method: 'POST', body: payload, auth: false }),

  registerCompany: (payload: RegisterCompanyPayload) =>
    apiRequest<AuthResponse>('/auth/register/company', { method: 'POST', body: payload, auth: false }),

  logout: async (refreshToken: string) => {
    try {
      await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false });
    } finally {
      clearAuthSession();
    }
  },

  forgotPassword: (email: string, type: PasswordResetAccountType = 'user') =>
    apiRequest<void>('/auth/password/forgot', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), type },
      auth: false,
    }),

  verifyResetCode: (email: string, code: string, type: PasswordResetAccountType = 'user') =>
    apiRequest<void>('/auth/password/verify-code', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), code: code.trim(), type },
      auth: false,
    }),

  resetPassword: (payload: {
    email: string;
    code: string;
    newPassword: string;
    confirmNewPassword: string;
    type?: PasswordResetAccountType;
  }) =>
    apiRequest<void>('/auth/password/reset', {
      method: 'POST',
      body: {
        ...payload,
        email: payload.email.trim().toLowerCase(),
        code: payload.code.trim(),
        type: payload.type ?? 'user',
      },
      auth: false,
    }),

  persistSession(data: AuthResponse, rememberMe = false) {
    setAuthSession(
      { accessToken: data.accessToken, refreshToken: data.refreshToken },
      data.user,
      { rememberMe },
    );
  },
};
