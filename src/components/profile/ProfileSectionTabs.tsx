import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfileSectionTabOption<T extends string> = {
  value: T;
  label: string;
  description: string;
  icon: LucideIcon;
};

type ProfileSectionTabsProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly ProfileSectionTabOption<T>[];
  className?: string;
};

export function ProfileSectionTabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: ProfileSectionTabsProps<T>) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <div
      className={cn(
        'relative mx-auto flex w-full max-w-xl rounded-xl border border-border/60 bg-muted/30 p-1',
        className,
      )}
      role="tablist"
      aria-label="Seções de configuração"
    >
      <div
        className="pointer-events-none absolute bottom-1 top-1 rounded-lg bg-card shadow-sm ring-1 ring-border/50 transition-[left] duration-200 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          left: `calc(0.25rem + ${selectedIndex} * ((100% - 0.5rem) / ${options.length}))`,
        }}
        aria-hidden
      />

      {options.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors',
              selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/90',
            )}
          >
            <span
              className={cn(
                'grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors',
                selected
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/15'
                  : 'bg-transparent text-muted-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-tight">
                {option.label}
              </span>
              <span
                className={cn(
                  'mt-0.5 block truncate text-[11px] leading-snug',
                  selected ? 'text-muted-foreground' : 'text-muted-foreground/80',
                )}
              >
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
