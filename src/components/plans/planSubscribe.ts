import type { BillingInterval, PlanAudience, PublicPlan } from '@/types/api';
import { getSubscribeCTALabel } from '@/components/plans/planFeatures';
import { appendBillingQuery } from '@/components/plans/BillingIntervalToggle';

export const UPGRADE_ACCOUNT_PATH = {
  user: '/freelancer/assinar',
  company: '/empresa/assinar',
} as const;

export const LOGIN_PATH = {
  user: '/login/freelancer',
  company: '/login/empresa',
} as const;

export function isPaidPlan(plan: Pick<PublicPlan, 'priceLabel' | 'code'>): boolean {
  return plan.code === 'PRO' || !/^grátis$/i.test(plan.priceLabel.trim());
}

export function inferUpgradePlanCode(planCode: string | undefined): string | null {
  if (planCode === 'PRO') return null;
  return 'PRO';
}

export function resolvePlanSubscribeAction(
  plan: PublicPlan,
  columnAudience: PlanAudience,
  options: {
    isAuthenticated: boolean;
    accountType?: 'user' | 'company';
    currentPlanCode?: string;
    upgradePlanCode?: string | null;
    planLoaded?: boolean;
    billingInterval?: BillingInterval;
  },
): { href: string; label: string } | null {
  if (!isPaidPlan(plan)) return null;

  const columnAccountType = columnAudience === 'USER' ? 'user' : 'company';
  const upgradePath = appendBillingQuery(
    UPGRADE_ACCOUNT_PATH[columnAccountType],
    options.billingInterval ?? 'MONTHLY',
  );
  const label = getSubscribeCTALabel(plan.name);

  if (!options.isAuthenticated) {
    return {
      href: `${LOGIN_PATH[columnAccountType]}?redirect=${encodeURIComponent(upgradePath)}`,
      label,
    };
  }

  if (options.accountType !== columnAccountType) return null;

  const effectiveUpgrade =
    options.upgradePlanCode ??
    (options.planLoaded || options.currentPlanCode
      ? inferUpgradePlanCode(options.currentPlanCode)
      : 'PRO');

  if (!effectiveUpgrade || effectiveUpgrade !== plan.code) return null;

  return { href: upgradePath, label };
}
