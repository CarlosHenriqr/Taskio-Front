import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PillTone = 'primary' | 'success' | 'warning' | 'neutral' | 'danger' | 'info';

export type PillFilterOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
  tone?: PillTone;
};

const TONE_SELECTED: Record<PillTone, string> = {
  primary:
    'border-primary/45 bg-primary/10 text-primary shadow-[0_0_0_1px_oklch(0.52_0.14_175/0.12)]',
  success:
    'border-success/40 bg-success/10 text-success shadow-[0_0_0_1px_oklch(0.62_0.15_145/0.15)]',
  warning:
    'border-warning/40 bg-warning/10 text-warning-foreground shadow-[0_0_0_1px_oklch(0.75_0.12_85/0.15)]',
  neutral: 'border-border bg-muted/60 text-foreground shadow-sm',
  danger:
    'border-destructive/35 bg-destructive/8 text-destructive shadow-[0_0_0_1px_oklch(0.55_0.2_25/0.12)]',
  info: 'border-info/35 bg-info/10 text-info shadow-[0_0_0_1px_oklch(0.55_0.12_240/0.12)]',
};

const TONE_COUNT: Record<PillTone, string> = {
  primary: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning-foreground',
  neutral: 'bg-muted text-muted-foreground',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-info/15 text-info',
};

type PillFilterProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: PillFilterOption<T>[];
  counts?: Partial<Record<T, number>>;
  ariaLabel: string;
  className?: string;
  showCounts?: boolean;
  size?: 'sm' | 'md';
};

export function PillFilter<T extends string>({
  value,
  onChange,
  options,
  counts,
  ariaLabel,
  className,
  showCounts = true,
  size = 'md',
}: PillFilterProps<T>) {
  const padding = size === 'sm' ? 'px-2.5 py-1.5' : 'px-3 py-2';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;
        const tone = option.tone ?? 'primary';
        const count = counts?.[option.value];

        return (
          <button
            key={option.value || '__all__'}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border text-left transition-all duration-200',
              padding,
              selected
                ? TONE_SELECTED[tone]
                : 'border-border/70 bg-surface text-muted-foreground hover:border-primary/20 hover:bg-surface-muted/50 hover:text-foreground',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            <span className={cn('font-semibold tracking-tight', textSize)}>{option.label}</span>
            {showCounts && count !== undefined && (
              <span
                className={cn(
                  'min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold tabular-nums',
                  selected ? TONE_COUNT[tone] : 'bg-muted/70 text-muted-foreground',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function buildPillCounts<T extends string>(
  items: unknown[],
  getValue: (item: unknown) => T,
  optionValues: T[],
): Record<T, number> {
  const counts = Object.fromEntries(optionValues.map((v) => [v, 0])) as Record<T, number>;
  items.forEach((item) => {
    const key = getValue(item);
    if (key in counts) counts[key] += 1;
  });
  return counts;
}
