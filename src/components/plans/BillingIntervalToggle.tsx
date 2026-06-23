import { cn } from '@/lib/utils';
import type { BillingInterval } from '@/types/api';

const INTERVALS: { value: BillingInterval; label: string }[] = [
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'YEARLY', label: 'Anual' },
];

type BillingIntervalToggleProps = {
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  savingsLabel?: string;
  className?: string;
};

export function BillingIntervalToggle({
  value,
  onChange,
  savingsLabel = 'Economize 17%',
  className,
}: BillingIntervalToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-border/70 bg-surface-muted/40 p-0.5',
        className,
      )}
      role="group"
      aria-label="Intervalo de cobrança"
    >
      {INTERVALS.map((interval) => (
        <button
          key={interval.value}
          type="button"
          onClick={() => onChange(interval.value)}
          aria-pressed={value === interval.value}
          className={cn(
            'relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === interval.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {interval.label}
          {interval.value === 'YEARLY' && savingsLabel && (
            <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {savingsLabel}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function billingIntervalFromQuery(value: string | null): BillingInterval {
  return value === 'yearly' ? 'YEARLY' : 'MONTHLY';
}

export function billingQueryFromInterval(interval: BillingInterval): string {
  return interval === 'YEARLY' ? 'yearly' : 'monthly';
}

export function appendBillingQuery(path: string, interval: BillingInterval): string {
  const query = billingQueryFromInterval(interval);
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}billing=${query}`;
}
