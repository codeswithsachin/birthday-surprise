import { motion } from 'framer-motion';
import { useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Twinkles } from '../components/Floaters';
import { Star } from '../components/art';
import { Moon } from '../components/art';
import { Rise, SplitText } from '../components/Text';
import { content, fill } from '../content';

/* Hand placed so the stars form soft constellations and never overlap the text.
   x and y are percentages of the sky area. */
const SPOTS = [
  { x: 12, y: 22 },
  { x: 28, y: 12 },
  { x: 44, y: 28 },
  { x: 62, y: 14 },
  { x: 82, y: 26 },
  { x: 18, y: 58 },
  { x: 36, y: 74 },
  { x: 56, y: 62 },
  { x: 74, y: 80 },
  { x: 90, y: 56 },
];
const LINES = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
];

export default function StarryWishes({ onNext }: ChapterProps) {
  const s = content.sky;
  const [found, setFound] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState<number | null>(null);
  const total = s.wishes.length;
  const complete = found.size >= total;

  const tap = (i: number) => {
    setCurrent(i);
    setFound((f) => new Set(f).add(i));
  };

  return (
    <Chapter scene="scene-sky" title="A universe of wishes" decor={<Twinkles count={44} seed={61} dark />}>
      <div className="moon-glow" aria-hidden="true">
        <Moon className="moon-art" />
      </div>
      <SplitText as="h1" className="h-serif sky-title" text={s.heading} />
      <Rise delay={0.5}>
        <p className="hint sky-hint">
          {s.hint} <span className="sky-count">{found.size} of {total}</span>
        </p>
      </Rise>

      <div className="sky-field">
        <svg className="sky-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {LINES.map((line, k) => (
            <polyline
              key={k}
              points={line.map((i) => `${SPOTS[i].x},${SPOTS[i].y}`).join(' ')}
              fill="none"
              stroke="rgba(255,244,234,0.28)"
              strokeWidth="0.35"
              strokeDasharray="1.2 1.4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {SPOTS.map((p, i) => {
          const isFound = found.has(i);
          return (
            <button
              key={i}
              type="button"
              className={`sky-star ${isFound ? 'is-found' : ''} ${current === i ? 'is-current' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${-i * 0.7}s` }}
              onClick={() => tap(i)}
              aria-label={isFound ? `Star ${i + 1}: ${s.wishes[i]}` : `Star ${i + 1}, tap to read its wish`}
            >
              <Star width="100%" height="100%" color={isFound ? '#D9BB85' : '#fff4ea'} />
            </button>
          );
        })}
      </div>

      <div className="sky-wish" aria-live="polite">
        {current !== null && (
          <motion.p key={current} className="hand wish-now" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {fill(s.wishes[current])}
          </motion.p>
        )}
        {complete && (
          <motion.div className="sky-finale" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1 }}>
            <p className="lede sky-lede">{fill(s.finale)}</p>
            <button type="button" className="btn btn--gold" onClick={onNext}>
              {s.finaleButton}
            </button>
          </motion.div>
        )}
      </div>
    </Chapter>
  );
}
