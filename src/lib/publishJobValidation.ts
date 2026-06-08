import { ApiRequestError } from '@/lib/api/client';

export type PublishJobFormValues = {
  title: string;
  description: string;
  requirements: string;
  deadline: string;
  expiresAt: string;
  requiredIds: string[];
  desirableIds: string[];
};

export function validatePublishJobForm(values: PublishJobFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  const title = values.title.trim();
  const description = values.description.trim();

  if (title.length < 3) {
    errors.title = 'O título deve ter pelo menos 3 caracteres.';
  } else if (title.length > 120) {
    errors.title = 'O título deve ter no máximo 120 caracteres.';
  }

  if (description.length < 20) {
    errors.description = 'A descrição deve ter pelo menos 20 caracteres.';
  } else if (description.length > 5000) {
    errors.description = 'A descrição deve ter no máximo 5000 caracteres.';
  }

  if (values.requirements.length > 5000) {
    errors.requirements = 'Os requisitos devem ter no máximo 5000 caracteres.';
  }

  const deadline = parseDateTimeLocal(values.deadline);
  if (!deadline) {
    errors.deadline = 'Informe o prazo de entrega.';
  }

  const expiresAt = parseDateTimeLocal(values.expiresAt);
  if (!expiresAt) {
    errors.expiresAt = 'Informe a data de expiração.';
  }

  const now = new Date();
  if (deadline && deadline <= now) {
    errors.deadline = 'O prazo de entrega deve ser uma data futura.';
  }
  if (expiresAt && expiresAt <= now) {
    errors.expiresAt = 'A data de expiração deve ser futura.';
  }
  if (deadline && expiresAt && deadline > expiresAt) {
    errors.deadline = 'O prazo não pode ser posterior à data de expiração.';
  }

  return errors;
}

export function parseDateTimeLocal(value: string): Date | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toIsoDateTimeLocal(value: string): string {
  const date = parseDateTimeLocal(value);
  if (!date) {
    throw new Error('Data inválida.');
  }
  return date.toISOString();
}

const API_CODE_TO_FIELD: Record<string, string> = {
  INVALID_EXPIRES_AT: 'expiresAt',
  INVALID_DEADLINE: 'deadline',
  INVALID_DEADLINE_RANGE: 'deadline',
  INVALID_TECHNOLOGY_IDS: 'technologies',
};

/** Mapeia erros da API de criação de vaga para campos do formulário. */
export function mapPublishJobApiErrors(err: unknown): {
  message: string;
  fields: Record<string, string>;
} {
  if (!(err instanceof ApiRequestError)) {
    if (err instanceof Error && err.message) {
      return { message: err.message, fields: {} };
    }
    return { message: 'Não foi possível publicar a vaga. Tente novamente.', fields: {} };
  }

  const fields: Record<string, string> = {};
  let message = err.message || 'Não foi possível publicar a vaga. Tente novamente.';

  if (err.errors) {
    for (const [key, msgs] of Object.entries(err.errors)) {
      const text = msgs?.[0];
      if (!text) continue;
      if (key === 'requiredTechnologyIds' || key === 'desirableTechnologyIds') {
        fields.technologies = text;
      } else {
        fields[key] = text;
      }
    }
  }

  if (err.code && API_CODE_TO_FIELD[err.code]) {
    fields[API_CODE_TO_FIELD[err.code]] = message;
  }

  if (err.code === 'SESSION_EXPIRED') {
    message = 'Sua sessão expirou. Faça login novamente.';
  }

  if (err.code === 'NETWORK_ERROR') {
    message = 'Não foi possível conectar ao servidor. Verifique se a API está rodando na porta 3333.';
  }

  if (err.code === 'FORBIDDEN') {
    message = 'Faça login como empresa para publicar vagas.';
  }

  return { message, fields };
}
