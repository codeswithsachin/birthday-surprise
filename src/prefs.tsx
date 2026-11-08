import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface Prefs {
  /** true when the OS asks for reduced motion OR the visitor tapped "skip animations" */
  reduced: boolean;
  skip: boolean;
  toggleSkip: () => void;
}

const Ctx = createContext<Prefs>({ reduced: false, skip: false, toggleSkip: () => {} });

const QUERY = '(prefers-reduced-motion: reduce)';

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [os, setOs] = useState<boolean>(
    () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(QUERY).matches,
  );
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(QUERY);
    const handler = () => setOs(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const reduced = os || skip;

  useEffect(() => {
    document.documentElement.classList.toggle('reduced', reduced);
  }, [reduced]);

  const value = useMemo(
    () => ({ reduced, skip, toggleSkip: () => setSkip((s) => !s) }),
    [reduced, skip],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePrefs = () => useContext(Ctx);
