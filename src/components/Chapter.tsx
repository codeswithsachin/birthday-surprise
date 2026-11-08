import { useEffect, useRef, type ReactNode } from 'react';

export interface ChapterProps {
  onNext: () => void;
  onReplay: () => void;
  onMenu: () => void;
}

/* Common wrapper: scene background, decorative layers, scroll area and focus handling. */
export function Chapter({
  scene,
  title,
  decor,
  children,
}: {
  scene: string;
  title: string;
  decor?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <section ref={ref} tabIndex={-1} className={`chapter ${scene}`} aria-label={title}>
      {decor}
      <div className="chapter-scroll">
        <div className="chapter-inner">{children}</div>
      </div>
    </section>
  );
}
