import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import type { BillingInterval, PlanAudience, PlanLimits, PlanPricing, PublicPlan } from '@/types/api';
import { cn } from '@/lib/utils';
import { Btn, Card } from '@/components/taskio/ui';
import { planFeatures } from '@/components/plans/planFeatures';

/** Rótulo curto para plano pago (null = free/starter, sem badge). */
export function getPaidPlanBadgeLabel(
  planCode: string,
  audience: PlanAudience,
): string | null {
  if (audience === 'USER' && planCode === 'PRO') return 'Pro';
  if (audience === 'COMPANY' && planCode === 'PRO') return 'Growth';
  return null;
}

export function PlanTierBadge({
  label,
  className,
}: {
  label: string | null | undefined;
  className?: string;
}) {
  if (!label) return null;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded border border-primary/35 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-primary',
        className,
      )}
      title={`Plano ${label}`}
    >
      {label}
    </span>
  );
}

export function PlanPrice({
  priceLabel,
  pricing,
  billingInterval = 'MONTHLY',
}: {
  priceLabel: string;
  pricing?: PlanPricing;
  billingInterval?: BillingInterval;
}) {
  const isFree = /^grátis$/i.test(priceLabel.trim());

  if (isFree) {
    return (
      <span className="font-display text-2xl font-bold tracking-tight text-primary">Grátis</span>
    );
  }

  if (billingInterval === 'YEARLY' && pricing?.annual) {
    return (
      <div className="text-right">
        <div>
          <span className="font-display text-2xl font-bold tracking-tight text-primary">
            {pricing.annual.monthlyEquivalentLabel}
          </span>
          <span className="ml-0.5 text-sm font-medium text-muted-foreground">/mês</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          cobrado anualmente · {pricing.annual.priceLabel}
        </p>
      </div>
    );
  }

  const match = priceLabel.match(/^R\$\s*([\d.,]+)(?:\s*\/?\s*(mês|mes|ano))?/i);
  if (match) {
    const amount = match[1];
    const period = match[2]?.toLowerCase() === 'ano' ? '/ano' : '/mês';
    return (
      <div className="text-right">
        <span className="font-display text-2xl font-bold tracking-tight text-primary">
          R$ {amount}
        </span>
        <span className="ml-0.5 text-sm font-medium text-muted-foreground">{period}</span>
      </div>
    );
  }

  return <span className="font-semibold text-primary">{priceLabel}</span>;
}

export function planCheckoutTotalLabel(
  pricing: PlanPricing,
  billingInterval: BillingInterval,
): string {
  if (billingInterval === 'YEARLY' && pricing.annual) {
    return pricing.annual.priceLabel;
  }
  return pricing.monthly.priceLabel;
}

export function PlanCard({
  audience,
  plan,
  highlighted,
  subscribeAction,
  billingInterval = 'MONTHLY',
}: {
  audience: PlanAudience;
  plan: PublicPlan;
  highlighted?: boolean;
  subscribeAction?: { href: string; label: string } | null;
  billingInterval?: BillingInterval;
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
        <PlanPrice
          priceLabel={plan.priceLabel}
          pricing={plan.pricing}
          billingInterval={billingInterval}
        />
      </div>

      <ul className="mt-6 flex flex-1 flex-col justify-start space-y-2.5 border-t border-border/60 pt-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm leading-snug">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {subscribeAction && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <Link to={subscribeAction.href}>
            <Btn size="sm" className="w-full">
              {subscribeAction.label}
            </Btn>
          </Link>
        </div>
      )}
    </Card>
  );
}

export const FALLBACK_FREELANCER_PLANS: PublicPlan[] = [
  {
    code: 'FREE',
    name: 'Free',
    description: 'Perfil completo e candidaturas essenciais.',
    priceLabel: 'Grátis',
    pricing: { monthly: { priceLabel: 'Grátis' } },
    limits: {
      maxApplicationsPerMonth: 15,
      matchingJobLimit: 10,
      matchingCandidateLimit: 0,
      profileBoostWeight: 0,
    },
  },
  {
    code: 'PRO',
    name: 'Pro',
    description: 'Mais candidaturas e destaque leve no matching.',
    priceLabel: 'R$ 39/mês',
    pricing: {
      monthly: { priceLabel: 'R$ 39/mês' },
      annual: {
        priceLabel: 'R$ 390/ano',
        monthlyEquivalentLabel: 'R$ 32,50',
        savingsLabel: 'Economize 17%',
      },
    },
    limits: {
      maxApplicationsPerMonth: 50,
      matchingJobLimit: 30,
      matchingCandidateLimit: 0,
      profileBoostWeight: 5,
    },
  },
];

export const FALLBACK_COMPANY_PLANS: PublicPlan[] = [
  {
    code: 'STARTER',
    name: 'Starter',
    description: 'Publique projetos e gerencie candidatos.',
    priceLabel: 'Grátis',
    pricing: { monthly: { priceLabel: 'Grátis' } },
    limits: {
      maxActiveJobs: 2,
      matchingCandidateLimit: 5,
      matchingJobLimit: 0,
      profileBoostWeight: 0,
    },
  },
  {
    code: 'PRO',
    name: 'Growth',
    description: 'Mais projetos ativos e matching ampliado.',
    priceLabel: 'R$ 79/mês',
    pricing: {
      monthly: { priceLabel: 'R$ 79/mês' },
      annual: {
        priceLabel: 'R$ 790/ano',
        monthlyEquivalentLabel: 'R$ 65,83',
        savingsLabel: 'Economize 17%',
      },
    },
    limits: {
      maxActiveJobs: 10,
      matchingCandidateLimit: 20,
      matchingJobLimit: 0,
      profileBoostWeight: 0,
    },
  },
];
