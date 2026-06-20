import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, TrendingUp, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Btn, Card } from '@/components/taskio/ui';
import { ConfirmDialog } from '@/components/taskio/ConfirmDialog';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { getSubscribeCTALabel } from '@/components/plans/planFeatures';
import { UPGRADE_ACCOUNT_PATH, inferUpgradePlanCode } from '@/components/plans/planSubscribe';
import {
  FALLBACK_COMPANY_PLANS,
  FALLBACK_FREELANCER_PLANS,
} from '@/components/plans/planDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { plansApi } from '@/lib/api/plans.api';
import { invalidatePlans } from '@/lib/queryInvalidation';
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
  onCancelled?: () => void;
};

export function PlanUsageCard({ data: dataProp, compact, onCancelled }: PlanUsageCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const planQuery = useQuery({
    queryKey: queryKeys.plans.me(user!.id),
    queryFn: () => plansApi.me(),
    enabled: !!user?.id && !dataProp,
  });

  const cancelMutation = useMutation({
    mutationFn: () => plansApi.cancel(),
    onSuccess: async (updated) => {
      if (user?.id) {
        queryClient.setQueryData(queryKeys.plans.me(user.id), updated);
        await invalidatePlans(queryClient, user.id);
      }
      setConfirmOpen(false);
      toast.success('Assinatura cancelada. Você voltou ao plano grátis.');
      onCancelled?.();
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const data = dataProp ?? planQuery.data;
  const effectiveUpgradeCode = data
    ? data.upgradePlanCode ?? inferUpgradePlanCode(data.plan.code)
    : null;
  const canUpgrade = !!effectiveUpgradeCode;
  const audience = data?.audience;

  const publicPlansQuery = useQuery({
    queryKey: queryKeys.plans.public(audience ?? 'all'),
    queryFn: async () => {
      if (!audience) return [];
      const groups = await plansApi.list(audience);
      return groups[0]?.plans ?? [];
    },
    enabled: !!audience && canUpgrade,
  });

  if (!dataProp && planQuery.isLoading) {
    return compact ? null : <PageLoader />;
  }

  if (!dataProp && planQuery.isError) {
    return compact ? null : <ErrorState onRetry={() => planQuery.refetch()} />;
  }

  if (!data) return null;

  const isOnPaidPlan = !canUpgrade;
  const checkoutPath =
    data.audience === 'USER' ? UPGRADE_ACCOUNT_PATH.user : UPGRADE_ACCOUNT_PATH.company;

  const fallbackPlans =
    data.audience === 'USER' ? FALLBACK_FREELANCER_PLANS : FALLBACK_COMPANY_PLANS;
  const targetPlan = effectiveUpgradeCode
    ? publicPlansQuery.data?.find((p) => p.code === effectiveUpgradeCode) ??
      fallbackPlans.find((p) => p.code === effectiveUpgradeCode)
    : undefined;
  const subscribeLabel = targetPlan
    ? getSubscribeCTALabel(targetPlan.name)
    : data.audience === 'USER'
      ? 'Assinar Pro'
      : 'Assinar Growth';

  return (
    <>
    <Card className="overflow-hidden">
      <div className="border-b border-border/70 bg-surface-muted/30 px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              {isOnPaidPlan ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display font-semibold">Seu plano</h3>
                <Badge tone={isOnPaidPlan ? 'primary' : 'outline'}>{data.plan.name}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Gerencie sua assinatura e limites de uso.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="font-display text-lg font-semibold tracking-tight">{data.plan.priceLabel}</p>
            {data.audience === 'USER' && data.plan.limits.profileBoostWeight > 0 && (
              <p className="text-xs text-muted-foreground">
                +{data.plan.limits.profileBoostWeight}% no matching
              </p>
            )}
            {canUpgrade && (
              <Link to={checkoutPath}>
                <Btn size="sm">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {subscribeLabel}
                </Btn>
              </Link>
            )}
            {isOnPaidPlan && (
              <Btn
                variant="secondary"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={cancelMutation.isPending}
              >
                <Ban className="h-3.5 w-3.5" />
                Cancelar assinatura
              </Btn>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {data.usage.map((metric) => (
          <UsageRow key={metric.key} metric={metric} />
        ))}
      </div>
    </Card>

      <ConfirmDialog
        open={confirmOpen}
        tone="danger"
        title="Cancelar assinatura?"
        description={
          <>
            Você voltará ao plano grátis e perderá os limites ampliados do{' '}
            <span className="font-medium text-foreground">{data.plan.name}</span>. Não há cobrança e
            você pode assinar novamente quando quiser.
          </>
        }
        confirmLabel="Cancelar assinatura"
        cancelLabel="Manter plano"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
