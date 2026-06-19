import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, X } from 'lucide-react';
import { Btn } from '@/components/taskio/ui';
import { plansApi } from '@/lib/api/plans.api';
import { queryKeys } from '@/lib/queryKeys';
import type { PlanAudience, PlanLimits, PublicPlan } from '@/types/api';

function planFeatures(audience: PlanAudience, limits: PlanLimits): string[] {
  if (audience === 'USER') {
    const items = ['Perfil completo (bio, stack, currículo, portfólio)'];
    if (limits.maxApplicationsPerMonth != null) {
      items.push(`${limits.maxApplicationsPerMonth} candidaturas por mês`);
    }
    if (limits.matchingJobLimit > 0) {
      items.push(`Até ${limits.matchingJobLimit} projetos recomendados por consulta`);
    }
    if (limits.profileBoostWeight > 0) {
      items.push(`Destaque leve no matching (+${limits.profileBoostWeight} pts)`);
    }
    return items;
  }

  const items = ['Publicar projetos e gerenciar candidatos'];
  if (limits.maxActiveJobs != null) {
    items.push(`${limits.maxActiveJobs} projetos ativos simultâneos`);
  }
  if (limits.matchingCandidateLimit > 0) {
    items.push(`Top ${limits.matchingCandidateLimit} candidatos recomendados por projeto`);
  }
  return items;
}

type UpgradePromptProps = {
  open: boolean;
  onClose: () => void;
  audience: PlanAudience;
  currentPlan: { name: string; code: string; priceLabel: string };
  upgradePlanCode: string;
  onMockUpgrade: () => void;
  isUpgrading?: boolean;
};

export function UpgradePrompt({
  open,
  onClose,
  audience,
  currentPlan,
  upgradePlanCode,
  onMockUpgrade,
  isUpgrading,
}: UpgradePromptProps) {
  const plansQuery = useQuery({
    queryKey: queryKeys.plans.public(audience),
    queryFn: async () => {
      const groups = await plansApi.list(audience);
      return groups[0]?.plans ?? [];
    },
    enabled: open,
  });

  if (!open) return null;

  const targetPlan = plansQuery.data?.find((p) => p.code === upgradePlanCode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-prompt-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="upgrade-prompt-title" className="font-display text-xl font-semibold tracking-tight">
              Ampliar capacidade
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Você está no plano {currentPlan.name}. O core da plataforma continua grátis — o upgrade
              só aumenta limites de escala.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {targetPlan ? (
          <PlanCompare
            audience={audience}
            current={currentPlan}
            target={targetPlan}
          />
        ) : plansQuery.isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Carregando planos...</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <Btn onClick={onMockUpgrade} disabled={isUpgrading}>
            {isUpgrading ? 'Atualizando...' : `Simular upgrade para ${targetPlan?.name ?? upgradePlanCode}`}
          </Btn>
          <Btn variant="secondary" onClick={onClose}>
            Agora não
          </Btn>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Pagamento real será integrado em versão futura. No TCC, use a simulação para testar limites
          ampliados.
        </p>
      </div>
    </div>
  );
}

function PlanCompare({
  audience,
  current,
  target,
}: {
  audience: PlanAudience;
  current: { name: string; priceLabel: string };
  target: PublicPlan;
}) {
  const features = planFeatures(audience, target.limits);

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Atual</p>
        <p className="mt-1 font-semibold">{current.name}</p>
        <p className="text-sm text-muted-foreground">{current.priceLabel}</p>
      </div>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Upgrade</p>
        <p className="mt-1 font-semibold">{target.name}</p>
        <p className="text-sm text-muted-foreground">{target.priceLabel}</p>
      </div>
      <ul className="space-y-2 sm:col-span-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { planFeatures };
