import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '@/components/taskio/Logo';
import { Badge, Btn, Card } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PlansCatalog } from '@/components/plans/PlansCatalog';

const NEVER_PAYWALLED = [
  'Cadastro, login e perfil completo',
  'Candidaturas básicas e publicação dos primeiros projetos',
  'Ver candidatos, notificações e avaliações pós-projeto',
  'Matching justo — planos pagos ampliam limites, não escondem talentos',
];

export function PlansPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Logo />
            <div className="flex items-center gap-2">
              <Link to="/">
                <Btn variant="ghost" size="sm">
                  <ArrowLeft className="h-3.5 w-3.5" /> Início
                </Btn>
              </Link>
              <Link to="/login">
                <Btn variant="ghost" size="sm">
                  Entrar
                </Btn>
              </Link>
              <Link to="/cadastro">
                <Btn size="sm">
                  Criar conta
                  <ArrowRight className="h-3.5 w-3.5" />
                </Btn>
              </Link>
            </div>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden border-b">
            <div className="absolute inset-0 bg-mesh opacity-70" />
            <div className="absolute inset-0 bg-noise" />
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <Badge tone="outline" className="px-2.5 py-1">
                <Sparkles className="h-3 w-3" /> Planos
              </Badge>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Core grátis. Upgrade só para{' '}
                <span className="text-gradient">escalar.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Freelancers e empresas começam sem custo no fluxo principal. Planos pagos ampliam
                volume e ferramentas — valores de referência alinhados ao mercado brasileiro (ex.:
                99Freelas Pro ~R$ 39; publicação ampliada para PMEs).
              </p>
            </div>
          </section>

          <section className="border-b">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <PlansCatalog />
            </div>
          </section>

          <section className="border-b bg-muted/20">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Sempre grátis no essencial
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                O marketplace precisa de liquidez nos dois lados — por isso estes itens não entram em
                plano pago.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {NEVER_PAYWALLED.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-border/70 bg-card px-4 py-3 text-sm leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="border-b">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <Card className="relative overflow-hidden p-8 lg:p-12">
                <div className="absolute inset-0 bg-mesh opacity-50" />
                <div className="relative grid items-center gap-6 lg:grid-cols-[1.5fr_1fr]">
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                      Comece grátis hoje
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      Crie sua conta em minutos. Você só precisa de upgrade se bater nos limites de
                      escala do plano free.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 lg:justify-end">
                    <Link to="/cadastro/empresa">
                      <Btn size="lg">Sou empresa</Btn>
                    </Link>
                    <Link to="/cadastro/freelancer">
                      <Btn size="lg" variant="secondary">
                        Sou freelancer
                      </Btn>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </main>

        <footer className="border-t">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <Logo />
            <p className="font-mono text-[10px] uppercase tracking-wider">&copy; 2026 TASKIO</p>
            <div className="flex gap-5">
              <Link to="/termos" className="link-underline transition-colors hover:text-foreground">
                Termos
              </Link>
              <Link to="/privacidade" className="link-underline transition-colors hover:text-foreground">
                Privacidade
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
