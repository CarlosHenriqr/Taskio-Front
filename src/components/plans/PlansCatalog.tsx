import { useQuery } from '@tanstack/react-query';
import { Building2, UserRound } from 'lucide-react';
import { resolvePlanSubscribeAction } from '@/components/plans/planSubscribe';
import {
  FALLBACK_COMPANY_PLANS,
  FALLBACK_FREELANCER_PLANS,
  PlanCard,
} from '@/components/plans/planDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { plansApi } from '@/lib/api/plans.api';
import { queryKeys } from '@/lib/queryKeys';
import type { PlanAudience, PublicPlan } from '@/types/api';

function PlanColumn({
  title,
  icon: Icon,
  audience,
  plans,
  isAuthenticated,
  accountType,
  currentPlanCode,
  upgradePlanCode,
  planLoaded,
}: {
  title: string;
  icon: typeof UserRound;
  audience: PlanAudience;
  plans: PublicPlan[];
  isAuthenticated: boolean;
  accountType?: 'user' | 'company';
  currentPlanCode?: string;
  upgradePlanCode?: string | null;
  planLoaded?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid flex-1 auto-rows-fr gap-4 sm:grid-cols-2">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.code}
            audience={audience}
            plan={plan}
            highlighted={index === plans.length - 1}
            subscribeAction={resolvePlanSubscribeAction(plan, audience, {
              isAuthenticated,
              accountType,
              currentPlanCode,
              upgradePlanCode,
              planLoaded,
            })}
          />
        ))}
      </div>
    </div>
  );
}

export function PlansCatalog() {
  const { user, isAuthenticated } = useAuth();

  const plansQuery = useQuery({
    queryKey: queryKeys.plans.public('all'),
    queryFn: () => plansApi.list(),
  });

  const myPlanQuery = useQuery({
    queryKey: queryKeys.plans.me(user?.id ?? ''),
    queryFn: () => plansApi.me(),
    enabled: isAuthenticated && !!user?.id,
    retry: 1,
  });

  const freelancerPlans =
    plansQuery.data?.find((g) => g.audience === 'USER')?.plans ?? FALLBACK_FREELANCER_PLANS;
  const companyPlans =
    plansQuery.data?.find((g) => g.audience === 'COMPANY')?.plans ?? FALLBACK_COMPANY_PLANS;

  const planLoaded = !isAuthenticated || myPlanQuery.isSuccess || myPlanQuery.isError;

  return (
    <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-12">
      <PlanColumn
        title="Freelancer"
        icon={UserRound}
        audience="USER"
        plans={freelancerPlans}
        isAuthenticated={isAuthenticated}
        accountType={user?.type}
        currentPlanCode={myPlanQuery.data?.plan.code}
        upgradePlanCode={myPlanQuery.data?.upgradePlanCode}
        planLoaded={planLoaded}
      />
      <PlanColumn
        title="Empresa"
        icon={Building2}
        audience="COMPANY"
        plans={companyPlans}
        isAuthenticated={isAuthenticated}
        accountType={user?.type}
        currentPlanCode={myPlanQuery.data?.plan.code}
        upgradePlanCode={myPlanQuery.data?.upgradePlanCode}
        planLoaded={planLoaded}
      />
    </div>
  );
}
