import { Link, useLocation, useNavigate } from 'react-router-dom';
import { type LucideIcon, Settings, LogOut, Plus, Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Logo } from './Logo';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/lib/api/notifications.api';
import { profileApi } from '@/lib/api/profile.api';
import { NOTIFICATION_POLL_MS, STALE_TIME } from '@/lib/queryConfig';
import { queryKeys } from '@/lib/queryKeys';
import { getInitials } from '@/lib/utils';

export type NavItem = { label: string; to: string; icon: LucideIcon; badge?: string };

export function AppShell({
  nav,
  subtitle,
  primaryAction,
  title,
  description,
  actions,
  children,
}: {
  nav: NavItem[];
  subtitle: string;
  primaryAction?: { label: string; to: string };
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const shellEnabled = !!user && (user.type === 'user' || user.type === 'company');

  const { data: unread } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(user!.id),
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: NOTIFICATION_POLL_MS,
    staleTime: STALE_TIME.notifications,
    enabled: shellEnabled,
  });

  const { data: profile } = useQuery({
    queryKey: queryKeys.profile.me(user!.id),
    queryFn: () => profileApi.me(),
    staleTime: STALE_TIME.profile,
    enabled: shellEnabled,
  });

  const accountPath =
    user?.type === 'user'
      ? '/freelancer/perfil/editar?secao=conta'
      : user?.type === 'company'
        ? '/empresa/conta'
        : null;

  const notificationsPath =
    user?.type === 'company'
      ? '/empresa/notificacoes'
      : user?.type === 'user'
        ? '/freelancer/notificacoes'
        : null;

  const showNotifications = !!notificationsPath;
  const unreadCount = unread?.count ?? 0;
  const isActive = (to: string) => pathname === to || (to !== '/' && pathname.startsWith(to + '/'));

  const navWithBadges = nav.map((item) =>
    item.to.includes('notificacoes') && unreadCount > 0
      ? { ...item, badge: String(unreadCount) }
      : item,
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // logout já limpa a sessão local
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-surface/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo subtitle={subtitle} />
        <div className="flex items-center gap-2">
          {showNotifications && notificationsPath && (
            <NotificationDropdown allPath={notificationsPath} unreadCount={unreadCount} />
          )}
          <button
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-md border bg-surface text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Abrir menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="lg:flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-sidebar transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-5">
            <Logo subtitle={subtitle} />
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent lg:hidden"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
            <p className="px-3 pb-2 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Workspace
            </p>
            {navWithBadges.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded bg-primary/8 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  )}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-sidebar-border p-3">
            {primaryAction && (
              <Link
                to={primaryAction.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:brightness-110"
              >
                <Plus className="h-4 w-4" /> {primaryAction.label}
              </Link>
            )}
            <div className="flex items-center gap-3 rounded-md px-2 py-2">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-md border object-cover"
                />
              ) : (
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                  {user ? getInitials(user.name) : '?'}
                </div>
              )}
              <div className="flex-1 overflow-hidden text-sm">
                <p className="truncate font-medium">{user?.name ?? 'Usuário'}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              {accountPath ? (
                <Link
                  to={accountPath}
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent"
                  aria-label="Configurações"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              ) : (
                <span
                  className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground/30"
                  aria-hidden
                >
                  <Settings className="h-4 w-4" />
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </aside>

        {open && (
          <button
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
            aria-label="Fechar menu"
          />
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {showNotifications && notificationsPath && (
            <div className="sticky top-0 z-20 hidden border-b bg-surface/90 backdrop-blur-xl lg:flex lg:justify-end lg:px-8 lg:py-3">
              <NotificationDropdown allPath={notificationsPath} unreadCount={unreadCount} />
            </div>
          )}

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
