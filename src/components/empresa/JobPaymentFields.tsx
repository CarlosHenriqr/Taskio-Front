import { Banknote, Clock3, Wallet } from 'lucide-react';
import { Field, TextInput } from '@/components/taskio/ui';
import { cn } from '@/lib/utils';
import { formatJobPayment } from '@/lib/jobPayment';
import type { JobPaymentFormValues } from '@/lib/jobPayment';
import type { JobPaymentType } from '@/types/api';

type JobPaymentFieldsProps = {
  values: JobPaymentFormValues;
  errors: Record<string, string>;
  onChange: (patch: Partial<JobPaymentFormValues>) => void;
};

const PAYMENT_OPTIONS: {
  type: JobPaymentType;
  title: string;
  description: string;
  icon: typeof Wallet;
}[] = [
  {
    type: 'FIXED_RANGE',
    title: 'Faixa do projeto',
    description: 'Defina um valor mínimo e máximo para o trabalho completo.',
    icon: Banknote,
  },
  {
    type: 'HOURLY',
    title: 'Pagamento por hora',
    description: 'Informe quanto você paga por hora de trabalho.',
    icon: Clock3,
  },
];

function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  suffix,
  step = 1,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <Field label={label} error={error}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-muted-foreground">
          R$
        </span>
        <TextInput
          type="number"
          min={1}
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-14 font-mono tabular-nums"
          required
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}

export function JobPaymentFields({ values, errors, onChange }: JobPaymentFieldsProps) {
  const preview =
    values.paymentType &&
    formatJobPayment({
      paymentType: values.paymentType,
      budgetMin: values.budgetMin ? Number(values.budgetMin) : null,
      budgetMax: values.budgetMax ? Number(values.budgetMax) : null,
      hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : null,
      currency: 'BRL',
    });

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-medium text-foreground">Como você pretende pagar?</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Freelancers veem esse valor na listagem e no detalhe do projeto.
        </p>
        {errors.paymentType && (
          <p className="mt-2 text-xs text-destructive">{errors.paymentType}</p>
        )}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {PAYMENT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = values.paymentType === option.type;
            return (
              <button
                key={option.type}
                type="button"
                onClick={() =>
                  onChange({
                    paymentType: option.type,
                    budgetMin: '',
                    budgetMax: '',
                    hourlyRate: '',
                  })
                }
                className={cn(
                  'rounded-xl border p-4 text-left transition-all duration-200',
                  selected
                    ? 'border-primary/50 bg-primary/8 shadow-[0_0_0_1px_oklch(0.52_0.14_175/0.15)]'
                    : 'border-border bg-surface hover:border-primary/25 hover:bg-surface-muted/40',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors',
                      selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold">{option.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {values.paymentType === 'FIXED_RANGE' && (
        <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Faixa de investimento
          </p>
          <div className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <MoneyInput
              label="De"
              value={values.budgetMin}
              onChange={(v) => onChange({ budgetMin: v })}
              placeholder="2.000"
              error={errors.budgetMin}
            />
            <span className="hidden pb-2 text-center text-sm font-medium text-muted-foreground sm:block">
              até
            </span>
            <MoneyInput
              label="Até"
              value={values.budgetMax}
              onChange={(v) => onChange({ budgetMax: v })}
              placeholder="5.000"
              error={errors.budgetMax}
            />
          </div>
        </div>
      )}

      {values.paymentType === 'HOURLY' && (
        <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Valor por hora
          </p>
          <div className="mt-3 max-w-xs">
            <MoneyInput
              label="Remuneração"
              value={values.hourlyRate}
              onChange={(v) => onChange({ hourlyRate: v })}
              placeholder="80"
              error={errors.hourlyRate}
              suffix="/hora"
              step={1}
            />
          </div>
        </div>
      )}

      {preview && (
        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-surface-muted/50 px-3 py-2.5">
          <Wallet className="h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Prévia do orçamento
            </p>
            <p className="text-sm font-semibold text-foreground">{preview}</p>
          </div>
        </div>
      )}
    </div>
  );
}
