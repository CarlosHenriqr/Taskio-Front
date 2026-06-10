import { Check } from 'lucide-react';
import { Chip } from '@/components/taskio/ui';
import { cn } from '@/lib/utils';
import type { Technology } from '@/types/api';

type TechStackPickerProps = {
  label: string;
  hint?: string;
  error?: string;
  technologies: Technology[];
  selectedIds: string[];
  variant: 'required' | 'desirable';
  onToggle: (id: string) => void;
  showChips?: boolean;
};

const variantStyles = {
  required: {
    selected:
      'border-primary/45 bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm',
    chip: 'primary' as const,
  },
  desirable: {
    selected:
      'border-sky-500/45 bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/15 shadow-sm',
    chip: 'default' as const,
  },
};

export function TechStackPicker({
  label,
  hint,
  error,
  technologies,
  selectedIds,
  variant,
  onToggle,
  showChips = true,
}: TechStackPickerProps) {
  const styles = variantStyles[variant];
  const selected = technologies.filter((t) => selectedIds.includes(t.id));

  return (
    <div className="grid gap-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-border/70 bg-surface-muted/30 p-3">
        {technologies.map((t) => {
          const isSelected = selectedIds.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onToggle(t.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
                isSelected
                  ? styles.selected
                  : 'border-transparent bg-background/80 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground',
              )}
            >
              {isSelected && <Check className="h-3 w-3 shrink-0" />}
              {t.name}
            </button>
          );
        })}
      </div>
      {showChips && selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((t) => (
            <Chip key={t.id} onRemove={() => onToggle(t.id)}>
              {t.name}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
