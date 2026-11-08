import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Clouds, Floaters, Twinkles } from '../components/Floaters';
import { HeldBouquet, Mascot } from '../components/mascot';
import { SplitText } from '../components/Text';
import { content, fill } from '../content';
import { usePrefs } from '../prefs';

export default function WishesChapter(_: ChapterProps) {
  const w = content.wishes;
  const { reduced } = usePrefs();
  const total = w.items.length;
  const [count, setCount] = useState(reduced ? total : 0);

  useEffect(() => {
    if (reduced) {
      setCount(total);
      return;
    }
    if (count >= total) return;
    const t = window.setTimeout(() => setCount((c) => Math.min(total, c + 1)), count === 0 ? 1400 : 2100);
    return () => window.clearTimeout(t);
  }, [count, total, reduced]);

  return (
    <Chapter
      scene="scene-wishes"
      title="Little things I wish for you"
      decor={
        <>
          <Twinkles count={16} seed={21} />
          <Clouds count={3} />
          <Floaters kind="petals" count={8} seed={6} />
          <div className="deco-layer" aria-hidden="true">
            <div className="sun-glow" />
          </div>
        </>
      }
    >
      <SplitText as="h1" className="h-serif" text={w.heading} />
      <div className="wish-wrap">
        <div className="wish-page card" aria-live="polite">
          <ol className="wish-list">
            {w.items.slice(0, count).map((t, i) => (
              <motion.li
                key={t}
                className={i === total - 1 ? 'wish wish-last' : 'wish'}
                initial={{ opacity: 0, y: -18, rotate: i % 2 ? 1.4 : -1.4, scale: 1.03 }}
                animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                transition={{ duration: reduced ? 0.01 : 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                {fill(t)}
              </motion.li>
            ))}
          </ol>
          {count < total && (
            <div className="wish-actions">
              <button type="button" className="btn btn--small" onClick={() => setCount((c) => Math.min(total, c + 1))}>
                {w.button}
              </button>
              <button type="button" className="btn btn--small btn--soft" onClick={() => setCount(total)}>
                Show all
              </button>
            </div>
          )}
        </div>
        <Mascot animal={content.animal} pose="hold" className="wish-mascot bob" label="A little character holding a bouquet">
          <HeldBouquet />
        </Mascot>
      </div>
    </Chapter>
  );
}
