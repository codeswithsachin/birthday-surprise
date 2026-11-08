import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Cloud, Butterfly, Flower, CardArt } from '../components/art';
import { Rise, SplitText } from '../components/Text';
import { content, fill } from '../content';
import { usePrefs } from '../prefs';

export default function CuteComparisons(_: ChapterProps) {
  const c = content.comparisons;
  const { reduced } = usePrefs();
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <Chapter
      scene="scene-garden"
      title="If you were a little world"
      decor={
        <>
          <div className="deco-layer deco-motion" aria-hidden="true">
            <Cloud className="garden-cloud gc1" />
            <Cloud className="garden-cloud gc2" />
            <Butterfly className="garden-fly gf1" color="#D995AA" />
            <Butterfly className="garden-fly gf2" color="#C9B6E8" />
            <Butterfly className="garden-fly gf3" color="#F6C94C" />
          </div>
          <div className="deco-layer" aria-hidden="true">
            <div className="garden-grass">
              {Array.from({ length: 9 }).map((_, i) => (
                <Flower
                  key={i}
                  className="grass-flower sway"
                  style={{ left: `${4 + i * 11.5}%`, animationDelay: `${-i * 0.6}s`, width: 28 + (i % 3) * 8 }}
                  color={['#F4A9BC', '#fff', '#F6C94C'][i % 3]}
                />
              ))}
            </div>
          </div>
        </>
      }
    >
      <SplitText as="h1" className="h-serif" text={c.heading} />
      <Rise delay={0.5}>
        <p className="hint">{c.hint}</p>
      </Rise>
      <ul className="cmp-grid">
        {c.cards.map((card, i) => {
          const isOpen = open.has(i);
          return (
            <motion.li
              key={card.art}
              className="cmp-item"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.5 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className={`cmp-card card ${isOpen ? 'is-open' : ''}`}
                aria-expanded={isOpen}
                onClick={() => toggle(i)}
              >
                <span className="cmp-art">
                  <CardArt name={card.art} />
                </span>
                <span className="cmp-text">{fill(card.text)}</span>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.span
                      className="cmp-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0.01 : 0.35 }}
                    >
                      <span className="hand">{fill(card.hidden)}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isOpen && (
                  <span className="cmp-tap" aria-hidden="true">
                    tap
                  </span>
                )}
              </button>
            </motion.li>
          );
        })}
      </ul>
    </Chapter>
  );
}
