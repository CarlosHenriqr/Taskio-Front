import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { NavItem } from '@/components/taskio/AppShell';

export type PageShellConfig = {
  title: string;
  description?: string;
  primaryAction?: { label: string; to: string };
  actions?: ReactNode;
  /** Bump when header actions UI must refresh (e.g. loading/disabled). Handlers should use refs. */
  actionsRevision?: string | number;
};

type ShellLayoutConfig = {
  nav: NavItem[];
  subtitle: string;
  defaultPrimaryAction?: { label: string; to: string };
};

type ShellContextValue = {
  layout: ShellLayoutConfig;
  page: PageShellConfig;
  registerPage: (config: PageShellConfig) => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

function shellFieldsEqual(a: PageShellConfig, b: PageShellConfig): boolean {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.primaryAction?.label === b.primaryAction?.label &&
    a.primaryAction?.to === b.primaryAction?.to &&
    a.actionsRevision === b.actionsRevision
  );
}

export function ShellProvider({
  layout,
  children,
}: {
  layout: ShellLayoutConfig;
  children: ReactNode;
}) {
  const pageRef = useRef<PageShellConfig>({ title: '' });
  const [page, setPage] = useState<PageShellConfig>({ title: '' });

  const registerPage = useCallback((config: PageShellConfig) => {
    const prev = pageRef.current;
    pageRef.current = config;

    if (!shellFieldsEqual(prev, config)) {
      setPage(config);
    }
  }, []);

  const value = useMemo(
    () => ({ layout, page, registerPage }),
    [layout, page, registerPage],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShellContext() {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error('useShellContext must be used within ShellProvider');
  }
  return ctx;
}

export function usePageShell(config: PageShellConfig) {
  const { registerPage } = useShellContext();
  const configRef = useRef(config);
  configRef.current = config;

  useLayoutEffect(() => {
    registerPage(configRef.current);
  });

  useEffect(() => {
    return () => registerPage({ title: '' });
  }, [registerPage]);
}
