import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiRequestError } from '@/lib/api/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dias`;
  return d.toLocaleDateString('pt-BR');
}

export const JOB_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberta',
  PAUSED: 'Pausada',
  CLOSED: 'Encerrada',
  CANCELLED: 'Cancelada',
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  REVIEWED: 'Em análise',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  APPLICATION_ACCEPTED: 'Candidatura aceita!',
  APPLICATION_REJECTED: 'Candidatura recusada',
  APPLICATION_STATUS_CHANGED: 'Atualização de candidatura',
  APPLICATION_COMPLETION_PENDING: 'Confirmação de conclusão pendente',
  APPLICATION_COMPLETED: 'Projeto finalizado',
  NEW_APPLICATION: 'Nova candidatura',
  COMPANY_HIRING_INTEREST: 'Interesse de contratação',
};

export function getNotificationTitle(type: string): string {
  return NOTIFICATION_TYPE_LABELS[type] ?? 'Notificação';
}

export const SKILL_LEVEL_LABELS: Record<string, string> = {
  BASICO: 'Básico',
  INTERMEDIARIO: 'Intermediário',
  AVANCADO: 'Avançado',
  ESPECIALISTA: 'Especialista',
};

export function mapApiErrors(err: unknown): { message: string; fields: Record<string, string> } {
  if (err instanceof ApiRequestError) {
    const fields: Record<string, string> = {};
    if (err.errors) {
      for (const [key, msgs] of Object.entries(err.errors)) {
        fields[key] = msgs[0] ?? '';
      }
    }
    if (err.code === 'INVALID_CREDENTIALS') {
      return {
        message:
          'E-mail/CPF/CNPJ ou senha incorretos. Confira o tipo de conta (Freelancer ou Empresa) e se o cadastro foi feito neste ambiente.',
        fields: { ...fields, email: fields.email ?? 'Verifique o identificador informado.' },
      };
    }
    if (err.code === 'SESSION_EXPIRED') {
      return { message: 'Sua sessão expirou. Faça login novamente.', fields };
    }
    if (err.code === 'MISSING_RESUME_URL') {
      return {
        message: 'Publique seu currículo em Editar perfil antes de se candidatar.',
        fields,
      };
    }
    if (err.code === 'INVALID_STATUS_TRANSITION') {
      return {
        message: 'Esta ação não é permitida para o status atual da candidatura.',
        fields,
      };
    }
    if (err.code === 'APPLICATION_STATUS_FINAL') {
      return {
        message: 'Esta candidatura já foi finalizada e não pode ser alterada.',
        fields,
      };
    }
    if (err.code === 'APPLICATION_CANNOT_CANCEL') {
      return {
        message: 'Esta candidatura não pode ser cancelada no status atual.',
        fields,
      };
    }
    if (err.code === 'INVALID_RESET_CODE') {
      return {
        message: 'Código inválido ou expirado. Solicite um novo código.',
        fields: { ...fields, code: fields.code ?? 'Código inválido ou expirado.' },
      };
    }
    if (err.code === 'PLAN_LIMIT_REACHED') {
      const details = err.details as {
        limit?: number;
        current?: number;
        metric?: string;
      } | undefined;
      const metricLabels: Record<string, string> = {
        maxActiveJobs: 'projetos ativos',
        maxApplicationsPerMonth: 'candidaturas neste mês',
      };
      const metricLabel = details?.metric ? metricLabels[details.metric] ?? 'uso do plano' : 'uso do plano';
      const usage =
        details?.current != null && details?.limit != null
          ? ` (${details.current}/${details.limit})`
          : '';
      return {
        message: `Limite do plano atingido para ${metricLabel}${usage}. Faça upgrade em Configurar conta para continuar.`,
        fields,
      };
    }
    return { message: err.message, fields };
  }
  if (err instanceof Error && err.message) {
    return { message: err.message, fields: {} };
  }
  return { message: 'Ocorreu um erro. Tente novamente.', fields: {} };
}
