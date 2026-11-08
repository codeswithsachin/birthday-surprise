import { useEffect, useMemo, useState } from 'react';
import { P } from '../palette';

const COLORS = [P.rose, P.gold, '#F4A9BC', '#fff', P.blush, '#F6C94C', '#C9B6E8'];

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* Fires whenever `trigger` changes to a number greater than zero.
   Pure CSS animation, no canvas, removed from the DOM after a few seconds. */
export function Confetti({
  trigger,
  mode = 'fall',
  count = 46,
  origin = { x: 50, y: 40 },
}: {
  trigger: number;
  mode?: 'fall' | 'burst';
  count?: number;
  origin?: { x: number; y: number };
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (trigger <= 0) return;
    setActive(trigger);
    const t = window.setTimeout(() => setActive(0), 5200);
    return () => window.clearTimeout(t);
  }, [trigger]);

  const pieces = useMemo(() => {
    const r = rng(active * 131 + 17);
    return Array.from({ length: count }).map(() => {
      const angle = r() * Math.PI * 2;
      const dist = 90 + r() * 190;
      return {
        left: r() * 100,
        color: COLORS[Math.floor(r() * COLORS.length)],
        w: 6 + Math.round(r() * 6),
        h: 8 + Math.round(r() * 8),
        round: r() > 0.7,
        dx: Math.round((r() - 0.5) * 160),
        rot: Math.round(r() * 720 - 360),
        delay: r() * (mode === 'fall' ? 0.9 : 0.12),
        dur: mode === 'fall' ? 3 + r() * 1.8 : 1.5 + r() * 0.9,
        tx: Math.round(Math.cos(angle) * dist),
        ty: Math.round(Math.sin(angle) * dist - 60),
      };
    });
  }, [active, count, mode]);

  if (!active) return null;

  return (
    <div className="confetti" aria-hidden="true" key={active}>
      {pieces.map((p, i) => (
        <i
          key={i}
          className={mode === 'fall' ? 'cf cf-fall' : 'cf cf-burst'}
          style={{
            left: mode === 'fall' ? `${p.left}%` : `${origin.x}%`,
            top: mode === 'fall' ? '-14px' : `${origin.y}%`,
            width: p.w,
            height: p.h,
            background: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            ['--dx' as string]: `${p.dx}px`,
            ['--rot' as string]: `${p.rot}deg`,
            ['--tx' as string]: `${p.tx}px`,
            ['--ty' as string]: `${p.ty}px`,
          }}
        />
      ))}
    </div>
  );
}
