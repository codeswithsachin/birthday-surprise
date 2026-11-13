import { useEffect, useMemo, useRef, useState } from 'react';
import { content } from '../content';
import { usePrefs } from '../prefs';
import { packInfo } from '../themes';

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const COUNT = { calm: 7, normal: 13, lively: 22 } as const;
const NO_TAP = 'button,a,input,textarea,select,summary,label,video,audio,[role="button"],[role="dialog"],[aria-modal="true"]';

interface Burst {
  id: number;
  x: number;
  y: number;
  bits: { g: string; dx: number; dy: number }[];
}

/* Theme layer: slow floating decorations plus a little burst when the screen is tapped.
   Everything is transform + opacity only, and it is switched off for "reduce motion". */
export default function Ambient() {
  const { reduced } = usePrefs();
  const pack = packInfo(content.theme.pack);
  const energy = content.theme.energy in COUNT ? content.theme.energy : 'normal';
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(1);

  const items = useMemo(() => {
    if (pack.glyphs.length === 0) return [];
    const r = rng(pack.key.length * 131 + 17);
    return Array.from({ length: COUNT[energy] }).map((_, i) => ({
      g: pack.glyphs[i % pack.glyphs.length] as string,
      left: Math.round(r() * 96),
      top: Math.round(6 + r() * 80),
      size: 16 + Math.round(r() * 16),
      dur: (pack.motion === 'swim' ? 22 : 13) + r() * 14,
      delay: -r() * 26,
      drift: Math.round((r() - 0.5) * 120),
    }));
  }, [pack, energy]);

  const tap = content.theme.tapBurst !== false;
  useEffect(() => {
    if (reduced || !tap) return undefined;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t && t.closest && t.closest(NO_TAP)) return;
      const r = rng(Math.floor(e.clientX * 7 + e.clientY * 13 + nextId.current * 31) + 1);
      const bits = Array.from({ length: 7 }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2 + r();
        const d = 46 + r() * 54;
        return { g: pack.burst[i % pack.burst.length] as string, dx: Math.cos(a) * d, dy: Math.sin(a) * d - 24 };
      });
      const id = nextId.current++;
      setBursts((b) => [...b.slice(-4), { id, x: e.clientX, y: e.clientY, bits }]);
      window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1100);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [reduced, tap, pack]);

  if (reduced) return null;
  return (
    <div className={`amb amb-${pack.motion}`} aria-hidden="true">
      {items.map((it, i) => (
        <span
          key={i}
          className="amb-p"
          style={{
            left: `${it.left}%`,
            top: pack.motion === 'swim' || pack.motion === 'float' ? `${it.top}%` : undefined,
            fontSize: it.size,
            animationDuration: `${it.dur}s`,
            animationDelay: `${it.delay}s`,
            ['--drift' as string]: `${it.drift}px`,
          }}
        >
          {it.g}
        </span>
      ))}
      {bursts.map((b) => (
        <span key={b.id} className="amb-burst" style={{ left: b.x, top: b.y }}>
          {b.bits.map((bit, i) => (
            <span key={i} className="amb-b" style={{ ['--dx' as string]: `${bit.dx}px`, ['--dy' as string]: `${bit.dy}px`, animationDelay: `${i * 18}ms` }}>
              {bit.g}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
