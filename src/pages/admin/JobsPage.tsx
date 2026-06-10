import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card, EmptyState } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { TableSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { adminApi } from '@/lib/api/admin.api';
import { formatRelativeDate } from '@/lib/utils';
import { invalidateAdminJobs, invalidatePublicJobs, invalidateCompany } from '@/lib/queryInvalidation';

export function AdminJobsPage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'jobs'],
    queryFn: () => adminApi.listJobs(1, 50),
  });

  const moderateMutation = useMutation({
    mutationFn: (id: string) => adminApi.moderateRemoveJob(id),
    onSuccess: async () => {
      await Promise.all([
        invalidateAdminJobs(queryClient),
        invalidatePublicJobs(queryClient),
        invalidateCompany(queryClient),
      ]);
      toast.success('Vaga removida pela moderação.');
    },
    onError: () => toast.error('Erro ao moderar vaga.'),
  });

  const jobs = query.data ?? [];

  usePageShell({
    title: 'Vagas',
    description: 'Modere vagas publicadas na plataforma.',
  });

  return (
    <PageTransition>
        {query.isLoading && <TableSkeleton />}
        {query.isError && <ErrorState onRetry={() => query.refetch()} />}
        {!query.isLoading && jobs.length === 0 && (
          <EmptyState icon={Briefcase} title="Nenhuma vaga" />
        )}
        {!query.isLoading && jobs.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Título</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Empresa</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Publicada</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-b transition-colors hover:bg-muted/20">
                      <td className="px-5 py-3 font-medium">{j.title}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {j.company?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatRelativeDate(j.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <JobStatusBadge status={j.status} />
                      </td>
                      <td className="px-5 py-3">
                        <Btn
                          size="sm"
                          variant="danger"
                          onClick={() => moderateMutation.mutate(j.id)}
                          disabled={moderateMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remover
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
    </PageTransition>
  );
}
