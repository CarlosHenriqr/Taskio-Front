import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PasswordResetFlow } from '@/components/auth/PasswordResetFlow';
import type { PasswordResetAccountType } from '@/lib/api/auth.api';
import { Logo } from '@/components/taskio/Logo';
import { Card } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';

type ForgotPasswordPageProps = {
  accountType?: PasswordResetAccountType;
};

const COPY = {
  user: {
    loginPath: '/login',
    emailHint: 'Informe o e-mail cadastrado na sua conta de freelancer.',
  },
  company: {
    loginPath: '/login/empresa',
    emailHint: 'Informe o e-mail cadastrado na sua conta de empresa.',
  },
} as const;

export function ForgotPasswordPage({ accountType = 'user' }: ForgotPasswordPageProps) {
  const navigate = useNavigate();
  const copy = COPY[accountType];

  const title = useMemo(
    () =>
      accountType === 'company'
        ? 'Recuperar senha da empresa'
        : 'Recuperar senha',
    [accountType],
  );

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <Logo />
        <Card className="mt-8 w-full max-w-md p-7">
          <Link
            to={copy.loginPath}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{copy.emailHint}</p>

          <div className="mt-6">
            <PasswordResetFlow
              accountType={accountType}
              onComplete={() => navigate(copy.loginPath)}
            />
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
