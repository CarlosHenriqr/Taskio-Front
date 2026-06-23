import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, CircleCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Btn, Card } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  BillingIntervalToggle,
  billingIntervalFromQuery,
  billingQueryFromInterval,
} from '@/components/plans/BillingIntervalToggle';
import { PlanPrice, planCheckoutTotalLabel } from '@/components/plans/planDisplay';
import { planFeatures } from '@/components/plans/planFeatures';
import { inferUpgradePlanCode } from '@/components/plans/planSubscribe';
import { useAuth } from '@/contexts/AuthContext';
import { usePageShell } from '@/contexts/ShellContext';
import { plansApi } from '@/lib/api/plans.api';
import { getDashboardPath } from '@/lib/nav';
import { mapApiErrors } from '@/lib/utils';
import { queryKeys } from '@/lib/queryKeys';
import type { BillingInterval, PlanAudience, PublicPlan } from '@/types/api';

const BILLING_PATH: Record<'user' | 'company', string> = {
  user: '/freelancer/perfil/editar?secao=plano',
  company: '/empresa/conta',
};

export function CheckoutPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [succeededPlanName, setSucceededPlanName] = useState<string | null>(null);
  const billingInterval = billingIntervalFromQuery(searchParams.get('billing'));

  const setBillingInterval = (interval: BillingInterval) => {
    setSearchParams({ billing: billingQueryFromInterval(interval) }, { replace: true });
  };

  const accountType: 'user' | 'company' = user?.type === 'company' ? 'company' : 'user';
  const audience: PlanAudience = accountType === 'company' ? 'COMPANY' : 'USER';
  const billingPath = BILLING_PATH[accountType];
  const dashboardPath = getDashboardPath(user?.type ?? 'user');

  usePageShell({
    title: 'Assinar plano',
    description: 'Revise os detalhes e ative sua assinatura.',
  });

  const planQuery = useQuery({
    queryKey: queryKeys.plans.me(user!.id),
    queryFn: () => plansApi.me(),
    enabled: !!user?.id,
  });

  const data = planQuery.data;
  const effectiveUpgradeCode = data
    ? data.upgradePlanCode ?? inferUpgradePlanCode(data.plan.code)
    : null;

  const publicPlansQuery = useQuery({
    queryKey: queryKeys.plans.public(audience),
    queryFn: async () => {
      const groups = await plansApi.list(audience);
      return groups[0]?.plans ?? [];
    },
    enabled: !!effectiveUpgradeCode,
  });

  const upgradeMutation = useMutation({
    mutationFn: ({ targetCode, interval }: { targetCode: string; interval: BillingInterval }) =>
      plansApi.mockUpgrade(targetCode, interval),
    onSuccess: async (updated) => {
      await queryClient.setQueryData(queryKeys.plans.me(user!.id), updated);
      setSucceededPlanName(updated.plan.name);
      toast.success(`Assinatura do plano ${updated.plan.name} ativada.`);
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  if (planQuery.isLoading) {
    return <PageLoader />;
  }

  if (planQuery.isError || !data) {
    return <ErrorState onRetry={() => planQuery.refetch()} />;
  }

  if (succeededPlanName) {
    return (
      <CheckoutSuccess
        planName={succeededPlanName}
        billingPath={billingPath}
        dashboardPath={dashboardPath}
      />
    );
  }

  if (!effectiveUpgradeCode) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl">
          <Card className="p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <CircleCheck className="h-8 w-8" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">
              Você já assina o plano {data.plan.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu plano atual já inclui os limites ampliados. Não há nada a fazer aqui.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link to={billingPath}>
                <Btn variant="secondary">Ver meu plano</Btn>
              </Link>
              <Link to={dashboardPath}>
                <Btn>Ir para o dashboard</Btn>
              </Link>
            </div>
          </Card>
        </div>
      </PageTransition>
    );
  }

  const targetPlan = publicPlansQuery.data?.find((p) => p.code === effectiveUpgradeCode);
  const isUpgrading = upgradeMutation.isPending;

  const handleConfirm = () => {
    if (!termsAccepted || !targetPlan) return;
    upgradeMutation.mutate({ targetCode: effectiveUpgradeCode, interval: billingInterval });
  };

  const renewalDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString('pt-BR');
  })();

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link
            to={billingPath}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Finalizar assinatura
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confira o que muda com o novo plano e confirme para ativar.
          </p>
          <div className="mt-4">
            <BillingIntervalToggle value={billingInterval} onChange={setBillingInterval} />
          </div>
        </div>

        {!targetPlan ? (
          publicPlansQuery.isLoading ? (
            <Card className="p-6 text-sm text-muted-foreground">Carregando plano...</Card>
          ) : (
            <ErrorState onRetry={() => publicPlansQuery.refetch()} />
          )
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
            <ProductColumn
              audience={audience}
              currentPlan={data.plan}
              targetPlan={targetPlan}
            />
            <OrderSummary
              targetPlan={targetPlan}
              billingInterval={billingInterval}
              renewalDate={renewalDate}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
              onConfirm={handleConfirm}
              isUpgrading={isUpgrading}
            />
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function ProductColumn({
  audience,
  currentPlan,
  targetPlan,
}: {
  audience: PlanAudience;
  currentPlan: { name: string; code: string; priceLabel: string };
  targetPlan: PublicPlan;
}) {
  const features = planFeatures(audience, targetPlan.limits);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border/70 bg-surface-muted/30 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {targetPlan.name}
              </h2>
              <Badge tone="primary">Novo plano</Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{targetPlan.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            O que está incluído
          </p>
          <ul className="mt-3 space-y-2.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm leading-snug">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Mudança em relação ao seu plano
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{currentPlan.name}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold text-foreground">{targetPlan.name}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function OrderSummary({
  targetPlan,
  billingInterval,
  renewalDate,
  termsAccepted,
  onTermsChange,
  onConfirm,
  isUpgrading,
}: {
  targetPlan: PublicPlan;
  billingInterval: BillingInterval;
  renewalDate: string;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onConfirm: () => void;
  isUpgrading: boolean;
}) {
  const isAnnual = billingInterval === 'YEARLY';
  const totalLabel = planCheckoutTotalLabel(targetPlan.pricing, billingInterval);

  return (
    <Card className="overflow-hidden lg:sticky lg:top-6">
      <div className="border-b border-border/70 px-6 py-4">
        <h2 className="font-display font-semibold">Resumo do pedido</h2>
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{targetPlan.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {isAnnual ? `Cobrança anual · renova em ${renewalDate}` : 'Cobrança mensal recorrente'}
            </p>
          </div>
          <PlanPrice
            priceLabel={targetPlan.priceLabel}
            pricing={targetPlan.pricing}
            billingInterval={billingInterval}
          />
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
          <span className="font-medium">Total hoje</span>
          <span className="font-display text-lg font-semibold tracking-tight">{totalLabel}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          {isAnnual
            ? 'Cobrança anual. Cancele quando quiser.'
            : 'Cobrança mensal recorrente. Cancele quando quiser.'}
        </p>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 p-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
          />
          <span className="text-sm leading-relaxed">
            Li e aceito os{' '}
            <Link to="/termos" className="font-medium text-primary hover:underline" target="_blank">
              Termos de Uso
            </Link>
            .
          </span>
        </label>

        <Btn className="w-full" onClick={onConfirm} disabled={!termsAccepted || isUpgrading}>
          {isUpgrading ? 'Confirmando...' : 'Confirmar assinatura'}
        </Btn>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Ativação imediata, sem dados de pagamento.
        </p>
      </div>
    </Card>
  );
}

function CheckoutSuccess({
  planName,
  billingPath,
  dashboardPath,
}: {
  planName: string;
  billingPath: string;
  dashboardPath: string;
}) {
  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <CircleCheck className="h-9 w-9" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">
            Assinatura ativada
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu plano <span className="font-medium text-foreground">{planName}</span> já está ativo.
            Os novos limites passam a valer imediatamente.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to={billingPath}>
              <Btn variant="secondary">Ver meu plano</Btn>
            </Link>
            <Link to={dashboardPath}>
              <Btn>Ir para o dashboard</Btn>
            </Link>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
