import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { Btn, Card } from '@/components/taskio/ui';
import { cn } from '@/lib/utils';

type ConfirmDialogTone = 'default' | 'danger';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const isDanger = tone === 'danger';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={() => !loading && onCancel()}
        aria-hidden
      />
      <Card className="relative z-10 w-full max-w-md p-6 shadow-xl">
        <button
          type="button"
          onClick={() => !loading && onCancel()}
          disabled={loading}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div
            className={cn(
              'grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1',
              isDanger
                ? 'bg-destructive/10 text-destructive ring-destructive/15'
                : 'bg-primary/10 text-primary ring-primary/15',
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
            {description && (
              <div className="mt-1.5 text-sm text-muted-foreground">{description}</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Btn variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Btn>
          <Btn
            variant={isDanger ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processando...' : confirmLabel}
          </Btn>
        </div>
      </Card>
    </div>,
    document.body,
  );
}
