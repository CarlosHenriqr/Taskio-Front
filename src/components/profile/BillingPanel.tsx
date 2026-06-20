import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { PlanUsageCard } from '@/components/plans/PlanUsageCard';
import {
  FALLBACK_COMPANY_PLANS,
  FALLBACK_FREELANCER_PLANS,
  PlanCard,
} from '@/components/plans/planDisplay';
import { inferUpgradePlanCode, resolvePlanSubscribeAction } from '@/components/plans/planSubscribe';
import { useAuth } from '@/contexts/AuthContext';
import { plansApi } from '@/lib/api/plans.api';
import { queryKeys } from '@/lib/queryKeys';
import type { PlanAudience } from '@/types/api';

export function BillingPanel() {
  const { user } = useAuth();
  const [justCancelled, setJustCancelled] = useState(false);

  const planQuery = useQuery({
    queryKey: queryKeys.plans.me(user!.id),
    queryFn: () => plansApi.me(),
    enabled: !!user?.id,
  });

  const data = planQuery.data;
  const audience: PlanAudience | undefined = data?.audience;
  const effectiveUpgradeCode = data
    ? data.upgradePlanCode ?? inferUpgradePlanCode(data.plan.code)
    : null;
  const isOnFreePlan = !!effectiveUpgradeCode;

  const plansQuery = useQuery({
    queryKey: queryKeys.plans.public(audience ?? 'all'),
    queryFn: async () => {
      if (!audience) return [];
      const groups = await plansApi.list(audience);
      return groups[0]?.plans ?? [];
    },
    enabled: !!audience && isOnFreePlan,
  });

  const accountType = audience === 'COMPANY' ? 'company' : 'user';
  const fallbackPlans =
    audience === 'COMPANY' ? FALLBACK_COMPANY_PLANS : FALLBACK_FREELANCER_PLANS;
  const plans = plansQuery.data?.length ? plansQuery.data : fallbackPlans;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PlanUsageCard onCancelled={() => setJustCancelled(true)} />

      {isOnFreePlan && audience && (
        <div className="space-y-4">
          {justCancelled && (
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface-muted/40 p-4 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-muted-foreground">
                Sua assinatura foi cancelada e você está no plano grátis. Escolha um plano abaixo
                para assinar novamente quando quiser.
              </p>
            </div>
          )}

          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight">Escolha um plano</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Planos disponíveis para o seu perfil.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.code}
                audience={audience}
                plan={plan}
                highlighted={index === plans.length - 1}
                subscribeAction={resolvePlanSubscribeAction(plan, audience, {
                  isAuthenticated: true,
                  accountType,
                  currentPlanCode: data?.plan.code,
                  upgradePlanCode: data?.upgradePlanCode,
                  planLoaded: true,
                })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
