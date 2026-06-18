import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, User } from 'lucide-react';
import { Logo } from '@/components/taskio/Logo';
import { LoginTestimonialsPanel } from '@/components/taskio/LoginTestimonialsPanel';
import { LoginFreelancerForm } from '@/components/auth/LoginFreelancerForm';
import { LoginCompanyForm } from '@/components/auth/LoginCompanyForm';
import { Btn, Field } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';

export type LoginAccountType = 'user' | 'company';

const LOGIN_PATHS = {
  user: '/login',
  company: '/login/empresa',
} as const;

function resolveTypeFromPath(pathname: string): LoginAccountType {
  if (pathname.endsWith('/empresa')) return 'company';
  return 'user';
}

type LoginPageProps = {
  initialType?: LoginAccountType;
};

export function LoginPage({ initialType }: LoginPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<LoginAccountType>(
    () => initialType ?? resolveTypeFromPath(location.pathname),
  );

  useEffect(() => {
    setAccountType(initialType ?? resolveTypeFromPath(location.pathname));
  }, [location.pathname, initialType]);

  const setType = (type: LoginAccountType) => {
    setAccountType(type);
    navigate(LOGIN_PATHS[type], { replace: true });
  };

  const sliderTransform = useMemo(
    () => (accountType === 'user' ? 'translateX(0)' : 'translateX(-50%)'),
    [accountType],
  );

  return (
    <PageTransition>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
        <div className="order-1 flex flex-col px-6 py-10 sm:px-12">
          <Logo />
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
              Bem-vindo de volta
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
              Entre na sua conta
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use suas credenciais TASKIO para acessar o workspace.
            </p>

            <div className="mt-8">
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
                    aria-controls="login-panel-freelancer"
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
                    aria-controls="login-panel-company"
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
                    className="w-1/2 shrink-0 pr-0"
                    role="tabpanel"
                    id="login-panel-freelancer"
                    aria-hidden={accountType !== 'user'}
                  >
                    <LoginFreelancerForm aria-hidden={accountType !== 'user'} />
                  </div>
                  <div
                    className="w-1/2 shrink-0 pl-0"
                    role="tabpanel"
                    id="login-panel-company"
                    aria-hidden={accountType !== 'company'}
                  >
                    <LoginCompanyForm aria-hidden={accountType !== 'company'} />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Não possui uma conta?{' '}
              <Link
                to="/cadastro"
                className="font-semibold text-primary link-underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
            &copy; 2026 TASKIO &middot; Plataforma segura e criptografada
          </p>
        </div>

        <div className="order-2 h-full lg:min-h-screen">
          <LoginTestimonialsPanel />
        </div>
      </div>
    </PageTransition>
  );
}
