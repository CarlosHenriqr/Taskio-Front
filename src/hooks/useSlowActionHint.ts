import { useEffect, useState } from 'react';

const HINTS = [
  { afterMs: 2_000, text: 'Conectando ao servidor...' },
  { afterMs: 8_000, text: 'Aguarde — o servidor pode estar iniciando (até ~30s).' },
  { afterMs: 25_000, text: 'Ainda conectando. Não feche esta página.' },
] as const;

export function useSlowActionHint(active: boolean, idleLabel = 'Entrando...'): string {
  const [hint, setHint] = useState(idleLabel);

  useEffect(() => {
    if (!active) {
      setHint(idleLabel);
      return;
    }

    setHint(idleLabel);
    const timers = HINTS.map(({ afterMs, text }) =>
      window.setTimeout(() => setHint(text), afterMs),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [active, idleLabel]);

  return hint;
}
