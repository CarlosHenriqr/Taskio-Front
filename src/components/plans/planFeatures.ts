import type { PlanAudience, PlanLimits } from '@/types/api';

export function planFeatures(audience: PlanAudience, limits: PlanLimits): string[] {
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

export function getSubscribeCTALabel(planName: string): string {
  return `Assinar ${planName}`;
}
