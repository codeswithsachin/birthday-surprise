import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Floaters, Twinkles } from '../components/Floaters';
import { SplitText } from '../components/Text';
import { content, fill } from '../content';
import { usePrefs } from '../prefs';

const KIND: Record<string, string> = { poem: 'A poem', quote: 'A line for you', wish: 'A wish' };

export default function PoemsChapter(_: ChapterProps) {
  const p = content.poems;
  const { reduced } = usePrefs();
  const total = p.items.length;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const it = p.items[Math.min(i, total - 1)];
  const lines = it ? fill(it.text).split('\n') : [];

  const move = (d: number) => {
    setDir(d);
    setI((n) => Math.max(0, Math.min(total - 1, n + d)));
  };

  return (
    <Chapter
      scene="scene-poems"
      title="A few lines for you"
      decor={
        <>
          <Twinkles count={14} seed={31} />
          <Floaters kind="petals" count={7} seed={9} />
        </>
      }
    >
      <SplitText as="h1" className="h-serif" text={p.heading} />
      {it && (
        <div className="poem-wrap">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.article
              key={i}
              className="poem-card card"
              aria-live="polite"
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, y: reduced ? 0 : 18, x: reduced ? 0 : d * 30 }),
                center: { opacity: 1, y: 0, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -30 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduced ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="poem-kind">{KIND[it.kind] ?? 'A poem'}</span>
              {it.title && <h2 className="poem-title">{fill(it.title)}</h2>}
              <div className="poem-lines">
                {lines.map((l, n) =>
                  l.trim() === '' ? (
                    <span key={n} className="poem-gap" />
                  ) : (
                    <motion.p
                      key={n}
                      className="poem-line"
                      initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduced ? 0 : 0.25 + n * 0.32, duration: reduced ? 0.01 : 0.6 }}
                    >
                      {l}
                    </motion.p>
                  ),
                )}
              </div>
              {it.by && <p className="poem-by">{fill(it.by)}</p>}
            </motion.article>
          </AnimatePresence>
          {total > 1 && (
            <div className="poem-nav">
              <button type="button" className="btn btn--small btn--soft" onClick={() => move(-1)} disabled={i === 0} aria-label="Previous">
                ←
              </button>
              <span className="poem-count">
                {i + 1} / {total}
              </span>
              <button type="button" className="btn btn--small" onClick={() => move(1)} disabled={i === total - 1} aria-label="Next">
                →
              </button>
            </div>
          )}
          <p className="hint">{p.hint}</p>
        </div>
      )}
    </Chapter>
  );
}
