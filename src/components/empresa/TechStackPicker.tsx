import { useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Chip } from '@/components/taskio/ui';
import { cn } from '@/lib/utils';
import type { Technology } from '@/types/api';

const CATEGORY_ORDER = [
  'Frontend',
  'Backend',
  'Mobile',
  'Banco de Dados',
  'DevOps/Cloud',
  'Design/Produto',
  'Outros',
];

const FALLBACK_CATEGORY = 'Outros';

function groupByCategory(technologies: Technology[]): Array<[string, Technology[]]> {
  const groups = new Map<string, Technology[]>();
  for (const tech of technologies) {
    const category = tech.category?.trim() || FALLBACK_CATEGORY;
    const bucket = groups.get(category);
    if (bucket) bucket.push(tech);
    else groups.set(category, [tech]);
  }

  return [...groups.entries()].sort(([a], [b]) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

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
  const grouped = useMemo(() => groupByCategory(technologies), [technologies]);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="grid gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {hint && <p className="mt-0.5 text-xs text-foreground/60">{hint}</p>}
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-foreground/70 transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform duration-200', collapsed && '-rotate-90')}
          />
          {collapsed ? 'Mostrar' : 'Ocultar'}
        </button>
      </div>
      {!collapsed && (
        <div className="grid gap-3 rounded-xl border border-border/70 bg-surface-muted/30 p-3">
          {grouped.map(([category, techs]) => (
            <div key={category} className="grid gap-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {techs.map((t) => {
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
                          : 'border-transparent bg-background/80 text-foreground/75 hover:border-border hover:bg-background hover:text-foreground',
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 shrink-0" />}
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
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
