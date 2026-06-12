import { AuthSplit } from '@/components/taskio/AuthSplit';
import { RegisterCompanyForm } from '@/components/auth/RegisterCompanyForm';
import { PageTransition } from '@/components/layout/PageTransition';

export function RegisterCompanyPage() {
  return (
    <PageTransition>
      <AuthSplit
        title="Escale sua equipe técnica"
        subtitle="Publique vagas, receba candidatos compatíveis e gerencie entregas em um só lugar."
      >
        <RegisterCompanyForm />
      </AuthSplit>
    </PageTransition>
  );
}
