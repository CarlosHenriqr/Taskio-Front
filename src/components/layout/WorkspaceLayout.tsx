import { Outlet } from 'react-router-dom';
import { AppShell, type NavItem } from '@/components/taskio/AppShell';
import { ShellProvider, useShellContext } from '@/contexts/ShellContext';
import { empresaNav, freelancerNav } from '@/lib/nav';

function WorkspaceShell({
  nav,
  subtitle,
  defaultPrimaryAction,
}: {
  nav: NavItem[];
  subtitle: string;
  defaultPrimaryAction?: { label: string; to: string };
}) {
  const { page } = useShellContext();

  return (
    <AppShell
      nav={nav}
      subtitle={subtitle}
      title={page.title}
      description={page.description}
      primaryAction={page.primaryAction ?? defaultPrimaryAction}
      actions={page.actions}
    >
      <Outlet />
    </AppShell>
  );
}

export function EmpresaLayout() {
  return (
    <ShellProvider
      layout={{
        nav: empresaNav,
        subtitle: 'Empresa',
        defaultPrimaryAction: { label: 'Novo projeto', to: '/empresa/publicar' },
      }}
    >
      <WorkspaceShell
        nav={empresaNav}
        subtitle="Empresa"
        defaultPrimaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}
      />
    </ShellProvider>
  );
}

export function FreelancerLayout() {
  return (
    <ShellProvider layout={{ nav: freelancerNav, subtitle: 'Freelancer' }}>
      <WorkspaceShell nav={freelancerNav} subtitle="Freelancer" />
    </ShellProvider>
  );
}
