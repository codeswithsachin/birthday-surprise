import { motion } from 'framer-motion';
import { useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Floaters } from '../components/Floaters';
import { Heart, Sparkle, Star } from '../components/art';
import { Rise, SplitText } from '../components/Text';
import { content, fill } from '../content';
import { usePrefs } from '../prefs';

const TILTS = [-2.4, 1.6, -1.2, 2.2, -1.8, 1.2, -2.2, 1.8, -0.8];
const TAPES = ['#F6DCE5', '#D9BB85', '#CFE3F2', '#D8E8CF'];
const ICONS = [Heart, Sparkle, Star];

export default function QualitiesScrapbook(_: ChapterProps) {
  const q = content.qualities;
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
    <Chapter scene="scene-qualities" title="Things that make you, you" decor={<Floaters kind="hearts" count={7} seed={11} />}>
      <SplitText as="h1" className="h-serif" text={q.heading} />
      <Rise delay={0.4}>
        <p className="hint">{q.hint}</p>
      </Rise>
      <ul className="q-grid">
        {q.cards.map((card, i) => {
          const isOpen = open.has(i);
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.li
              key={card.title}
              className="q-item"
              initial={{ opacity: 0, y: 26, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: TILTS[i % TILTS.length] }}
              transition={{ delay: reduced ? 0 : 0.4 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className={`q-card ${isOpen ? 'is-flipped' : ''}`}
                aria-pressed={isOpen}
                onClick={() => toggle(i)}
              >
                <span className="tape" style={{ background: TAPES[i % TAPES.length] }} aria-hidden="true" />
                <span className="q-face q-front" aria-hidden={isOpen}>
                  <Icon width="26" height="26" color={i % 2 ? '#D995AA' : '#D9BB85'} />
                  <span className="q-title">{fill(card.title)}</span>
                  <span className="q-more" aria-hidden="true">
                    tap to open
                  </span>
                </span>
                <span className="q-face q-back" aria-hidden={!isOpen}>
                  <span className="q-line">{fill(card.line)}</span>
                  <Heart width="16" height="15" color="#D995AA" />
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </Chapter>
  );
}
