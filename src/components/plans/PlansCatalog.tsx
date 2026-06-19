import { useQuery } from '@tanstack/react-query';
import { Building2, CheckCircle2, UserRound } from 'lucide-react';
import { Card } from '@/components/taskio/ui';
import { planFeatures } from '@/components/plans/UpgradePrompt';
import {
  FALLBACK_COMPANY_PLANS,
  FALLBACK_FREELANCER_PLANS,
  PlanPrice,
} from '@/components/plans/planDisplay';
import { plansApi } from '@/lib/api/plans.api';
import { queryKeys } from '@/lib/queryKeys';
import type { PlanLimits, PublicPlan } from '@/types/api';

function PlanCard({
  audience,
  plan,
  highlighted,
}: {
  audience: 'USER' | 'COMPANY';
  plan: PublicPlan;
  highlighted?: boolean;
}) {
  const features = planFeatures(audience, plan.limits as PlanLimits);

  return (
    <Card
      className={`flex h-full min-h-[22rem] flex-col p-6 ${
        highlighted ? 'border-primary/40 ring-1 ring-primary/15' : ''
      }`}
    >
      <div className="flex min-h-[4.5rem] items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-display text-xl font-semibold">{plan.name}</h4>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{plan.description}</p>
        </div>
        <PlanPrice priceLabel={plan.priceLabel} />
      </div>

      <ul className="mt-6 flex flex-1 flex-col justify-start space-y-2.5 border-t border-border/60 pt-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm leading-snug">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PlanColumn({
  title,
  icon: Icon,
  audience,
  plans,
}: {
  title: string;
  icon: typeof UserRound;
  audience: 'USER' | 'COMPANY';
  plans: PublicPlan[];
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
          />
        ))}
      </div>
    </div>
  );
}

export function PlansCatalog() {
  const plansQuery = useQuery({
    queryKey: queryKeys.plans.public('all'),
    queryFn: () => plansApi.list(),
  });

  const freelancerPlans =
    plansQuery.data?.find((g) => g.audience === 'USER')?.plans ?? FALLBACK_FREELANCER_PLANS;
  const companyPlans =
    plansQuery.data?.find((g) => g.audience === 'COMPANY')?.plans ?? FALLBACK_COMPANY_PLANS;

  return (
    <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-12">
      <PlanColumn title="Freelancer" icon={UserRound} audience="USER" plans={freelancerPlans} />
      <PlanColumn title="Empresa" icon={Building2} audience="COMPANY" plans={companyPlans} />
    </div>
  );
}
