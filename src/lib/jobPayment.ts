import type { Job, JobPaymentType } from '@/types/api';

export type JobPaymentFormValues = {
  paymentType: JobPaymentType | '';
  budgetMin: string;
  budgetMax: string;
  hourlyRate: string;
};

export function formatMoney(value: number, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatJobPayment(job: Pick<
  Job,
  'paymentType' | 'budgetMin' | 'budgetMax' | 'hourlyRate' | 'currency'
>): string | null {
  const currency = job.currency ?? 'BRL';

  if (job.paymentType === 'FIXED_RANGE' && job.budgetMin != null && job.budgetMax != null) {
    return `${formatMoney(Number(job.budgetMin), currency)} – ${formatMoney(Number(job.budgetMax), currency)}`;
  }

  if (job.paymentType === 'HOURLY' && job.hourlyRate != null) {
    return `${formatMoney(Number(job.hourlyRate), currency)}/hora`;
  }

  return null;
}

export function parseMoneyInput(value: string): number | null {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function validateJobPaymentForm(values: JobPaymentFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.paymentType) {
    errors.paymentType = 'Selecione como pretende pagar pelo projeto.';
    return errors;
  }

  if (values.paymentType === 'FIXED_RANGE') {
    const min = parseMoneyInput(values.budgetMin);
    const max = parseMoneyInput(values.budgetMax);
    if (min == null) errors.budgetMin = 'Informe o valor mínimo.';
    if (max == null) errors.budgetMax = 'Informe o valor máximo.';
    if (min != null && max != null && max < min) {
      errors.budgetMax = 'O valor máximo deve ser maior ou igual ao mínimo.';
    }
  }

  if (values.paymentType === 'HOURLY') {
    if (parseMoneyInput(values.hourlyRate) == null) {
      errors.hourlyRate = 'Informe o valor por hora.';
    }
  }

  return errors;
}

export function toJobPaymentPayload(values: JobPaymentFormValues) {
  if (values.paymentType === 'FIXED_RANGE') {
    return {
      paymentType: 'FIXED_RANGE' as const,
      currency: 'BRL' as const,
      budgetMin: parseMoneyInput(values.budgetMin)!,
      budgetMax: parseMoneyInput(values.budgetMax)!,
    };
  }

  return {
    paymentType: 'HOURLY' as const,
    currency: 'BRL' as const,
    hourlyRate: parseMoneyInput(values.hourlyRate)!,
  };
}

export function jobToPaymentFormValues(job: Job): JobPaymentFormValues {
  return {
    paymentType: job.paymentType ?? '',
    budgetMin: job.budgetMin != null ? String(job.budgetMin) : '',
    budgetMax: job.budgetMax != null ? String(job.budgetMax) : '',
    hourlyRate: job.hourlyRate != null ? String(job.hourlyRate) : '',
  };
}
