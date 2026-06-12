import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, User } from 'lucide-react';
import { AuthSplit } from '@/components/taskio/AuthSplit';
import { RegisterFreelancerForm } from '@/components/auth/RegisterFreelancerForm';
import { RegisterCompanyForm } from '@/components/auth/RegisterCompanyForm';
import { Btn, Field } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';

export type RegisterAccountType = 'user' | 'company';

const AUTH_COPY = {
  user: {
    title: 'Junte-se à TASKIO',
    subtitle: 'Monte um perfil técnico forte e receba projetos compatíveis com suas habilidades.',
    path: '/cadastro',
  },
  company: {
    title: 'Escale sua equipe técnica',
    subtitle: 'Publique vagas, receba candidatos compatíveis e gerencie entregas em um só lugar.',
    path: '/cadastro/empresa',
  },
} as const;

function resolveTypeFromPath(pathname: string): RegisterAccountType {
  if (pathname.endsWith('/empresa')) return 'company';
  return 'user';
}

type RegisterPageProps = {
  initialType?: RegisterAccountType;
};

export function RegisterPage({ initialType }: RegisterPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<RegisterAccountType>(
    () => initialType ?? resolveTypeFromPath(location.pathname),
  );

  useEffect(() => {
    setAccountType(initialType ?? resolveTypeFromPath(location.pathname));
  }, [location.pathname, initialType]);

  const copy = AUTH_COPY[accountType];

  const setType = (type: RegisterAccountType) => {
    setAccountType(type);
    navigate(AUTH_COPY[type].path, { replace: true });
  };

  const sliderTransform = useMemo(
    () => (accountType === 'user' ? 'translateX(0)' : 'translateX(-50%)'),
    [accountType],
  );

  return (
    <PageTransition>
      <AuthSplit title={copy.title} subtitle={copy.subtitle}>
        <Field label="Tipo de conta">
          <div
            className="grid grid-cols-2 gap-2"
            role="tablist"
            aria-label="Tipo de conta"
          >
            <Btn
              type="button"
              role="tab"
              aria-selected={accountType === 'user'}
              aria-pressed={accountType === 'user'}
              aria-controls="register-panel-freelancer"
              variant={accountType === 'user' ? 'primary' : 'secondary'}
              className="w-full"
              onClick={() => setType('user')}
            >
              <User className="h-4 w-4" /> Freelancer
            </Btn>
            <Btn
              type="button"
              role="tab"
              aria-selected={accountType === 'company'}
              aria-pressed={accountType === 'company'}
              aria-controls="register-panel-company"
              variant={accountType === 'company' ? 'primary' : 'secondary'}
              className="w-full"
              onClick={() => setType('company')}
            >
              <Building2 className="h-4 w-4" /> Empresa
            </Btn>
          </div>
        </Field>

        <div className="mt-4 overflow-hidden">
          <div
            className="flex w-[200%] transition-transform duration-[350ms] ease-out"
            style={{ transform: sliderTransform }}
          >
            <div
              className="w-1/2 shrink-0"
              role="tabpanel"
              id="register-panel-freelancer"
              aria-hidden={accountType !== 'user'}
            >
              <RegisterFreelancerForm aria-hidden={accountType !== 'user'} />
            </div>
            <div
              className="w-1/2 shrink-0"
              role="tabpanel"
              id="register-panel-company"
              aria-hidden={accountType !== 'company'}
            >
              <RegisterCompanyForm aria-hidden={accountType !== 'company'} />
            </div>
          </div>
        </div>
      </AuthSplit>
    </PageTransition>
  );
}
