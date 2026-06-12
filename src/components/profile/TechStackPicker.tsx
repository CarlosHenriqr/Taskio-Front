import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Field, TextInput } from '@/components/taskio/ui';
import { ErrorState } from '@/components/feedback/ErrorState';
import type { Technology } from '@/types/api';

type TechStackPickerProps = {
  technologies: Technology[];
  selectedIds: string[];
  onToggle: (technologyId: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export function TechStackPicker({
  technologies,
  selectedIds,
  onToggle,
  isLoading,
  isError,
  onRetry,
}: TechStackPickerProps) {
  const [search, setSearch] = useState('');

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const techByCategory = useMemo(() => {
    const groups = new Map<string, Technology[]>();
    for (const t of technologies) {
      const cat = t.category ?? 'Outros';
      const list = groups.get(cat) ?? [];
      list.push(t);
      groups.set(cat, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [technologies]);

  const selectedTechs = useMemo(
    () => technologies.filter((t) => selectedSet.has(t.id)),
    [technologies, selectedSet],
  );

  const normalizedSearch = search.trim().toLowerCase();

  const visibleCategories = useMemo(() => {
    return techByCategory
      .map(([category, items]) => {
        const filtered = normalizedSearch
          ? items.filter((t) => t.name.toLowerCase().includes(normalizedSearch))
          : items;
        const selectedInCategory = items.filter((t) => selectedSet.has(t.id)).length;
        return { category, items: filtered, total: items.length, selectedInCategory };
      })
      .filter(
        ({ items, selectedInCategory }) =>
          items.length > 0 || (normalizedSearch === '' && selectedInCategory > 0),
      );
  }, [techByCategory, normalizedSearch, selectedSet]);

  if (isLoading) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-7 w-20 animate-pulse rounded-md bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4">
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (technologies.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        Nenhuma tecnologia disponível no catálogo. Tente recarregar a página.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <Field label="Buscar tecnologia">
        <TextInput
          icon={Search}
          placeholder="Ex.: React, Node, Figma..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Field>

      {selectedTechs.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            Selecionadas ({selectedTechs.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedTechs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggle(t.id)}
                className="inline-flex items-center gap-1 rounded-md border border-primary bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {t.name}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {visibleCategories.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma tecnologia encontrada.</p>
        )}
        {visibleCategories.map(({ category, items, total, selectedInCategory }) => {
          const hasSearch = normalizedSearch.length > 0;
          const hasSelected = selectedInCategory > 0;
          const defaultOpen = hasSearch || hasSelected;

          return (
            <details
              key={category}
              open={defaultOpen}
              className="group rounded-lg border border-border bg-surface"
            >
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  <span>{category}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {selectedInCategory}/{total}
                  </span>
                </span>
              </summary>
              <div className="max-h-48 overflow-y-auto border-t border-border px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {items.map((t) => {
                    const selected = selectedSet.has(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onToggle(t.id)}
                        className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'bg-surface-muted hover:border-primary/40'
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
