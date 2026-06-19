import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Crown, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Btn, Card } from '@/components/taskio/ui';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { UpgradePrompt } from '@/components/plans/UpgradePrompt';
import { useAuth } from '@/contexts/AuthContext';
import { plansApi } from '@/lib/api/plans.api';
import { mapApiErrors } from '@/lib/utils';
import { queryKeys } from '@/lib/queryKeys';
import type { PlanMeResponse, PlanUsageMetric } from '@/types/api';

function usagePercent(metric: PlanUsageMetric): number | null {
  if (metric.limit == null || metric.limit <= 0) return null;
  return Math.min(100, Math.round((metric.used / metric.limit) * 100));
}

function UsageRow({ metric }: { metric: PlanUsageMetric }) {
  const percent = usagePercent(metric);
  const isQuota = metric.key === 'maxActiveJobs' || metric.key === 'maxApplicationsPerMonth';

  if (!isQuota) {
    if (metric.limit == null || metric.limit <= 0) return null;
    return (
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{metric.label}</span>
        <span className="font-medium tabular-nums">até {metric.limit}</span>
      </div>
    );
  }

  const remaining =
    metric.limit != null ? Math.max(0, metric.limit - metric.used) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{metric.label}</span>
        <span className="font-medium tabular-nums">
          {metric.used}
          {metric.limit != null ? ` / ${metric.limit}` : ''}
          {remaining != null && (
            <span className="ml-2 text-xs text-muted-foreground">({remaining} restantes)</span>
          )}
        </span>
      </div>
      {percent != null && (
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              percent >= 100 ? 'bg-destructive' : percent >= 80 ? 'bg-warning' : 'bg-primary'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

type PlanUsageCardProps = {
  data?: PlanMeResponse;
  compact?: boolean;
};

export function PlanUsageCard({ data: dataProp, compact }: PlanUsageCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const planQuery = useQuery({
    queryKey: queryKeys.plans.me(user!.id),
    queryFn: () => plansApi.me(),
    enabled: !!user?.id && !dataProp,
  });

  const upgradeMutation = useMutation({
    mutationFn: () => plansApi.mockUpgrade(),
    onSuccess: async (updated) => {
      await queryClient.setQueryData(queryKeys.plans.me(user!.id), updated);
      toast.success(`Plano atualizado para ${updated.plan.name} (simulação).`);
      setUpgradeOpen(false);
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  if (!dataProp && planQuery.isLoading) {
    return compact ? null : <PageLoader />;
  }

  if (!dataProp && planQuery.isError) {
    return compact ? null : <ErrorState onRetry={() => planQuery.refetch()} />;
  }

  const data = dataProp ?? planQuery.data;
  if (!data) return null;

  const isPro = data.upgradePlanCode == null;

  return (
    <>
      <Card className="overflow-hidden">
        <div className="border-b border-border/70 bg-surface-muted/30 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                {isPro ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-semibold">Seu plano</h3>
                  <Badge tone={isPro ? 'primary' : 'outline'}>{data.plan.name}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{data.plan.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-semibold tracking-tight">{data.plan.priceLabel}</p>
              {data.audience === 'USER' && data.plan.limits.profileBoostWeight > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  +{data.plan.limits.profileBoostWeight}% no matching
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {data.usage.map((metric) => (
            <UsageRow key={metric.key} metric={metric} />
          ))}

          {data.upgradePlanCode && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <Btn size="sm" onClick={() => setUpgradeOpen(true)}>
                <TrendingUp className="h-3.5 w-3.5" />
                Ver upgrade
              </Btn>
              <Btn
                size="sm"
                variant="outline"
                onClick={() => upgradeMutation.mutate()}
                disabled={upgradeMutation.isPending}
              >
                {upgradeMutation.isPending ? 'Atualizando...' : 'Simular upgrade (TCC)'}
              </Btn>
              <span className="text-xs text-muted-foreground">
                Sem cobrança — apenas demonstração.
              </span>
            </div>
          )}
        </div>
      </Card>

      {data.upgradePlanCode && (
        <UpgradePrompt
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          audience={data.audience}
          currentPlan={data.plan}
          upgradePlanCode={data.upgradePlanCode}
          onMockUpgrade={() => upgradeMutation.mutate()}
          isUpgrading={upgradeMutation.isPending}
        />
      )}
    </>
  );
}
