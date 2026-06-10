import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card, EmptyState } from '@/components/taskio/ui';
import { FilterBar } from '@/components/shared/ContentCards';
import { UserTypeFilter, type UserTypeFilterValue } from '@/components/shared/filters/userTypeFilter';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { TableSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { adminApi } from '@/lib/api/admin.api';
import { formatRelativeDate } from '@/lib/utils';
import { invalidateAdminUsers } from '@/lib/queryInvalidation';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<UserTypeFilterValue>('user');

  const query = useQuery({
    queryKey: ['admin', 'users', type],
    queryFn: () => adminApi.listUsers({ type, limit: 50 }),
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      blocked ? adminApi.unblockUser(id, type) : adminApi.blockUser(id, type),
    onSuccess: async (_, { blocked }) => {
      await invalidateAdminUsers(queryClient);
      toast.success(blocked ? 'Usuário desbloqueado.' : 'Usuário bloqueado.');
    },
    onError: () => toast.error('Erro na operação.'),
  });

  const users = query.data ?? [];

  usePageShell({
    title: 'Usuários',
    description: 'Gerencie freelancers e empresas da plataforma.',
  });

  return (
    <PageTransition>
        <FilterBar trailing={`${users.length} usuário${users.length === 1 ? '' : 's'}`}>
          <UserTypeFilter value={type} onChange={setType} />
        </FilterBar>

        {query.isLoading && <TableSkeleton />}
        {query.isError && <ErrorState onRetry={() => query.refetch()} />}
        {!query.isLoading && users.length === 0 && (
          <EmptyState icon={Users} title="Nenhum usuário" />
        )}
        {!query.isLoading && users.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Nome</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">E-mail</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Cadastro</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b transition-colors hover:bg-muted/20">
                      <td className="px-5 py-3 font-medium">{u.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatRelativeDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            u.isBlocked
                              ? 'text-destructive font-medium'
                              : 'text-success font-medium'
                          }
                        >
                          {u.isBlocked ? 'Bloqueado' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Btn
                          size="sm"
                          variant={u.isBlocked ? 'secondary' : 'danger'}
                          onClick={() =>
                            blockMutation.mutate({ id: u.id, blocked: u.isBlocked })
                          }
                          disabled={blockMutation.isPending}
                        >
                          {u.isBlocked ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" /> Desbloquear
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5" /> Bloquear
                            </>
                          )}
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
