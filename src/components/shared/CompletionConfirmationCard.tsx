import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Clock, Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card } from '@/components/taskio/ui';
import { applicationsApi } from '@/lib/api/applications.api';
import { mapApiErrors } from '@/lib/utils';
import type { Application } from '@/types/api';

type CompletionConfirmationCardProps = {
  application: Pick<
    Application,
    'id' | 'status' | 'companyCompletedAt' | 'userCompletedAt'
  >;
  viewerRole: 'user' | 'company';
  onSuccess?: () => void;
};

export function CompletionConfirmationCard({
  application,
  viewerRole,
  onSuccess,
}: CompletionConfirmationCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirmMutation = useMutation({
    mutationFn: () => applicationsApi.confirmCompletion(application.id),
    onSuccess: (data) => {
      if (data.status === 'COMPLETED') {
        toast.success('Projeto finalizado por ambas as partes!');
      } else {
        toast.success('Sua confirmação foi registrada. Aguardando a outra parte.');
      }
      setConfirmOpen(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  if (application.status !== 'ACCEPTED') return null;

  const companyConfirmed = !!application.companyCompletedAt;
  const userConfirmed = !!application.userCompletedAt;
  const viewerConfirmed = viewerRole === 'company' ? companyConfirmed : userConfirmed;
  const otherLabel = viewerRole === 'company' ? 'freelancer' : 'empresa';
  const otherConfirmed = viewerRole === 'company' ? userConfirmed : companyConfirmed;

  return (
    <Card className="p-6">
      <h3 className="font-display font-semibold flex items-center gap-2">
        <Flag className="h-4 w-4 text-primary" />
        Conclusão do projeto
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        O projeto só será marcado como concluído quando empresa e freelancer confirmarem a
        finalização.
      </p>

      <div className="mt-4 space-y-2 text-sm">
        <p className="inline-flex items-center gap-2">
          {companyConfirmed ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
          Empresa {companyConfirmed ? 'confirmou' : 'ainda não confirmou'}
        </p>
        <p className="inline-flex items-center gap-2">
          {userConfirmed ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
          Freelancer {userConfirmed ? 'confirmou' : 'ainda não confirmou'}
        </p>
      </div>

      {viewerConfirmed && !otherConfirmed && (
        <p className="mt-4 rounded-md border border-info/30 bg-info/5 px-3 py-2 text-sm text-muted-foreground">
          Você já confirmou. Aguardando confirmação do {otherLabel}.
        </p>
      )}

      {!viewerConfirmed && (
        <div className="mt-4">
          {!confirmOpen ? (
            <Btn className="w-full" onClick={() => setConfirmOpen(true)}>
              Confirmar conclusão do projeto
            </Btn>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Confirmar que o projeto foi concluído?</p>
              <div className="flex gap-2">
                <Btn
                  className="flex-1"
                  disabled={confirmMutation.isPending}
                  onClick={() => confirmMutation.mutate()}
                >
                  {confirmMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Confirmar'
                  )}
                </Btn>
                <Btn
                  className="flex-1"
                  variant="secondary"
                  disabled={confirmMutation.isPending}
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancelar
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
