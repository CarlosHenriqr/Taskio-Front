import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/taskio/Logo';
import { Btn } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { LEGAL } from '@/lib/legal';

type LegalPageLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function LegalPageLayout({ title, subtitle, children }: LegalPageLayoutProps) {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
            <Logo />
            <Link to="/">
              <Btn variant="secondary" size="sm">
                <ArrowLeft className="h-3.5 w-3.5" /> Início
              </Btn>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
            Documento legal
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Última atualização: {LEGAL.lastUpdated}
          </p>

          <article className="legal-prose mt-10 space-y-8 text-sm leading-relaxed text-foreground">
            {children}
          </article>

          <footer className="mt-14 flex flex-col gap-4 border-t pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 {LEGAL.platformName}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/termos" className="font-medium text-primary hover:underline">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="font-medium text-primary hover:underline">
                Política de Privacidade
              </Link>
              <a href={`mailto:${LEGAL.contactEmail}`} className="hover:text-foreground">
                {LEGAL.contactEmail}
              </a>
            </div>
          </footer>
        </main>
      </div>
    </PageTransition>
  );
}

type SectionProps = {
  id?: string;
  title: string;
  children: ReactNode;
};

export function LegalSection({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
