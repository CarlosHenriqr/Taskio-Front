import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Eye, Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Btn } from '@/components/taskio/ui';
import { applicationsApi } from '@/lib/api/applications.api';
import { APPLICATION_STATUS_LABELS, mapApiErrors } from '@/lib/utils';
import { invalidateApplications } from '@/lib/queryInvalidation';
import type { ApplicationStatus } from '@/types/api';

type ApplicationActionsProps = {
  applicationId: string;
  status: ApplicationStatus;
  candidateName?: string;
  variant?: 'compact' | 'full';
  onSuccess?: () => void;
};

const ACCEPT_FROM: ApplicationStatus[] = ['PENDING', 'REVIEWED'];
const REJECT_FROM: ApplicationStatus[] = ['PENDING', 'REVIEWED'];
const REVIEW_FROM: ApplicationStatus[] = ['PENDING'];
const COMPLETE_FROM: ApplicationStatus[] = ['ACCEPTED'];

function successMessage(status: ApplicationStatus): string {
  switch (status) {
    case 'ACCEPTED':
      return 'Candidato aceito com sucesso!';
    case 'REJECTED':
      return 'Candidatura recusada.';
    case 'REVIEWED':
      return 'Candidato marcado como em análise.';
    case 'COMPLETED':
      return 'Projeto marcado como concluído.';
    default:
      return 'Status atualizado.';
  }
}

function confirmLabel(status: ApplicationStatus, candidateName?: string): string {
  const name = candidateName ?? 'este candidato';
  switch (status) {
    case 'ACCEPTED':
      return `Aceitar ${name} para o projeto?`;
    case 'REJECTED':
      return `Recusar a candidatura de ${name}?`;
    case 'REVIEWED':
      return `Marcar ${name} como em análise?`;
    case 'COMPLETED':
      return 'Concluir este projeto e encerrar a vaga?';
    default:
      return 'Confirmar alteração?';
  }
}

export function ApplicationActions({
  applicationId,
  status,
  candidateName,
  variant = 'full',
  onSuccess,
}: ApplicationActionsProps) {
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<ApplicationStatus | null>(null);

  const statusMutation = useMutation({
    mutationFn: (next: ApplicationStatus) => applicationsApi.updateStatus(applicationId, next),
    onSuccess: async (_, next) => {
      await invalidateApplications(queryClient);
      toast.success(successMessage(next));
      setPendingAction(null);
      onSuccess?.();
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const isPending = statusMutation.isPending;
  const canAccept = ACCEPT_FROM.includes(status);
  const canReject = REJECT_FROM.includes(status);
  const canReview = REVIEW_FROM.includes(status);
  const canComplete = COMPLETE_FROM.includes(status);
  const hasActions = canAccept || canReject || canReview || canComplete;

  if (pendingAction) {
    return (
      <div
        className={
          variant === 'compact'
            ? 'flex flex-col gap-2 sm:flex-row sm:items-center'
            : 'rounded-lg border border-border bg-surface-muted/50 p-4'
        }
        onClick={(e) => e.preventDefault()}
      >
        <p
          className={
            variant === 'compact'
              ? 'text-xs text-muted-foreground'
              : 'text-sm font-medium text-foreground'
          }
        >
          {confirmLabel(pendingAction, candidateName)}
        </p>
        <div className={`flex gap-2 ${variant === 'full' ? 'mt-3' : ''}`}>
          <Btn
            size="sm"
            variant={pendingAction === 'REJECTED' ? 'danger' : 'primary'}
            disabled={isPending}
            onClick={() => statusMutation.mutate(pendingAction)}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              'Confirmar'
            )}
          </Btn>
          <Btn
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={() => setPendingAction(null)}
          >
            Cancelar
          </Btn>
        </div>
      </div>
    );
  }

  if (!hasActions) {
    if (variant === 'compact') return null;
    return (
      <p className="text-sm text-muted-foreground">
        Candidatura {APPLICATION_STATUS_LABELS[status]?.toLowerCase() ?? status.toLowerCase()}.
        Nenhuma ação disponível neste status.
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex shrink-0 gap-1.5" onClick={(e) => e.preventDefault()}>
        {canReview && (
          <Btn
            size="sm"
            variant="secondary"
            title="Marcar em análise"
            disabled={isPending}
            onClick={() => setPendingAction('REVIEWED')}
          >
            <Eye className="h-3.5 w-3.5" />
          </Btn>
        )}
        {canAccept && (
          <Btn
            size="sm"
            variant="primary"
            title="Aceitar candidato"
            disabled={isPending}
            onClick={() => setPendingAction('ACCEPTED')}
          >
            <Check className="h-3.5 w-3.5" />
          </Btn>
        )}
        {canReject && (
          <Btn
            size="sm"
            variant="danger"
            title="Recusar candidato"
            disabled={isPending}
            onClick={() => setPendingAction('REJECTED')}
          >
            <X className="h-3.5 w-3.5" />
          </Btn>
        )}
        {canComplete && (
          <Btn
            size="sm"
            variant="outline"
            title="Concluir projeto"
            disabled={isPending}
            onClick={() => setPendingAction('COMPLETED')}
          >
            <Flag className="h-3.5 w-3.5" />
          </Btn>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Revise o perfil e decida sobre esta candidatura.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {canAccept && (
          <Btn
            className="sm:flex-1"
            disabled={isPending}
            onClick={() => setPendingAction('ACCEPTED')}
          >
            <Check className="h-4 w-4" /> Aceitar candidato
          </Btn>
        )}
        {canReject && (
          <Btn
            className="sm:flex-1"
            variant="danger"
            disabled={isPending}
            onClick={() => setPendingAction('REJECTED')}
          >
            <X className="h-4 w-4" /> Recusar candidato
          </Btn>
        )}
      </div>
      {(canReview || canComplete) && (
        <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row">
          {canReview && (
            <Btn
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={() => setPendingAction('REVIEWED')}
            >
              <Eye className="h-3.5 w-3.5" /> Marcar em análise
            </Btn>
          )}
          {canComplete && (
            <Btn
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setPendingAction('COMPLETED')}
            >
              <Flag className="h-3.5 w-3.5" /> Concluir projeto
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}
