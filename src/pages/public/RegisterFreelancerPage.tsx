import { AuthSplit } from '@/components/taskio/AuthSplit';
import { RegisterFreelancerForm } from '@/components/auth/RegisterFreelancerForm';
import { PageTransition } from '@/components/layout/PageTransition';

export function RegisterFreelancerPage() {
  return (
    <PageTransition>
      <AuthSplit
        title="Junte-se à TASKIO"
        subtitle="Monte um perfil técnico forte e receba projetos compatíveis com suas habilidades."
      >
        <RegisterFreelancerForm />
      </AuthSplit>
    </PageTransition>
  );
}
