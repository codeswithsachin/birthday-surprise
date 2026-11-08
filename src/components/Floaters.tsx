import { useMemo } from 'react';
import { P } from '../palette';
import { Heart, Petal, Sparkle, Star } from './art';

type Kind = 'hearts' | 'stars' | 'petals' | 'mixed';

/* A small, seeded set of gently drifting decorations. Kept to a low count
   and animated with transform and opacity only. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Floaters({
  kind = 'mixed',
  count = 12,
  seed = 7,
  dark = false,
}: {
  kind?: Kind;
  count?: number;
  seed?: number;
  dark?: boolean;
}) {
  const items = useMemo(() => {
    const r = rng(seed * 97 + 13);
    const hues = dark ? ['#F6DCE5', '#D9BB85', '#fff'] : [P.rose, P.blush, P.gold, '#F4A9BC'];
    return Array.from({ length: count }).map((_, i) => {
      const k: Exclude<Kind, 'mixed'> =
        kind === 'mixed' ? (['hearts', 'stars', 'petals'] as const)[i % 3] : kind;
      return {
        k,
        left: Math.round(r() * 100),
        size: 12 + Math.round(r() * 18),
        dur: 11 + r() * 12,
        delay: -r() * 20,
        drift: Math.round((r() - 0.5) * 90),
        color: hues[Math.floor(r() * hues.length)],
        sparkle: r() > 0.6,
      };
    });
  }, [kind, count, seed, dark]);

  return (
    <div className="deco-layer floaters" aria-hidden="true">
      {items.map((it, i) => {
        const style = {
          left: `${it.left}%`,
          width: it.size,
          height: it.size,
          animationDuration: `${it.dur}s`,
          animationDelay: `${it.delay}s`,
          ['--drift' as string]: `${it.drift}px`,
        };
        const common = { className: 'floater', style };
        if (it.k === 'hearts') return <Heart key={i} color={it.color} {...common} />;
        if (it.k === 'petals') return <Petal key={i} color={it.color} {...common} />;
        return it.sparkle ? (
          <Sparkle key={i} color={it.color} {...common} />
        ) : (
          <Star key={i} color={it.color} {...common} />
        );
      })}
    </div>
  );
}

/* Twinkling background stars (static positions, CSS twinkle) */
export function Twinkles({ count = 26, seed = 3, dark = false }: { count?: number; seed?: number; dark?: boolean }) {
  const items = useMemo(() => {
    const r = rng(seed * 53 + 5);
    return Array.from({ length: count }).map(() => ({
      left: r() * 100,
      top: r() * 100,
      size: 6 + Math.round(r() * 10),
      delay: -r() * 6,
      dur: 2.4 + r() * 3,
    }));
  }, [count, seed]);
  return (
    <div className="deco-layer deco-motion" aria-hidden="true">
      {items.map((it, i) => (
        <Sparkle
          key={i}
          color={dark ? '#fff4ea' : P.gold}
          className="twinkle"
          style={{
            left: `${it.left}%`,
            top: `${it.top}%`,
            width: it.size,
            height: it.size,
            animationDelay: `${it.delay}s`,
            animationDuration: `${it.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Drifting clouds */
export function Clouds({ count = 3 }: { count?: number }) {
  return (
    <div className="deco-layer deco-motion" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 120 64"
          className="drift-cloud"
          style={{
            top: `${8 + i * 18}%`,
            width: 90 + i * 34,
            animationDuration: `${60 + i * 24}s`,
            animationDelay: `${-i * 22}s`,
            opacity: 0.8 - i * 0.1,
          }}
        >
          <g fill="#fff">
            <circle cx="36" cy="40" r="18" />
            <circle cx="62" cy="30" r="24" />
            <circle cx="88" cy="40" r="18" />
            <rect x="36" y="40" width="52" height="18" rx="9" />
          </g>
        </svg>
      ))}
    </div>
  );
}
