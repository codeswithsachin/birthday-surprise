import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Envelope } from '../components/Envelope';
import { Floaters } from '../components/Floaters';
import { Portal } from '../components/Portal';
import { Heart } from '../components/art';
import { Rise, SplitText } from '../components/Text';
import { content, fill } from '../content';
import { usePrefs } from '../prefs';

export default function InteractiveLetters(_: ChapterProps) {
  const ow = content.openWhen;
  const { reduced } = usePrefs();
  const [active, setActive] = useState<number | null>(null);
  const [read, setRead] = useState<Set<number>>(new Set());
  const [flap, setFlap] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const openLetter = (i: number, el: HTMLElement) => {
    openerRef.current = el;
    setFlap(false);
    setActive(i);
    setRead((r) => new Set(r).add(i));
  };

  const close = useCallback(() => {
    setActive(null);
    openerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (active === null) return;
    const t = window.setTimeout(() => setFlap(true), reduced ? 0 : 120);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [active, close, reduced]);

  const letter = active !== null ? ow.letters[active] : null;

  return (
    <Chapter scene="scene-openwhen" title="A few little notes" decor={<Floaters kind="hearts" count={8} seed={31} />}>
      <SplitText as="h1" className="h-serif" text={ow.heading} />
      <Rise delay={0.4}>
        <p className="hint">{ow.hint}</p>
      </Rise>
      <ul className="ow-grid">
        {ow.letters.map((l, i) => (
          <motion.li
            key={l.title}
            className="ow-item"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.4 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className={`ow-btn ${read.has(i) ? 'is-read' : ''}`}
              onClick={(e) => openLetter(i, e.currentTarget)}
              aria-haspopup="dialog"
            >
              <span className="ow-env">
                <Envelope open={false} />
                {read.has(i) && (
                  <span className="ow-read" aria-hidden="true">
                    <Heart width="14" height="13" color="#fff" />
                  </span>
                )}
              </span>
              <span className="ow-label">{fill(l.label)}</span>
              {read.has(i) && <span className="sr-only">(already opened)</span>}
            </button>
          </motion.li>
        ))}
      </ul>

      <Portal>
      <AnimatePresence>
        {letter && (
          <motion.div
            className="ow-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={letter.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <div className="ow-stage" onClick={(e) => e.stopPropagation()}>
              <div className="ow-env-big">
                <Envelope open={flap} seal />
              </div>
              <motion.article
                className="ow-letter"
                initial={{ opacity: 0, y: 70, scale: 0.9, rotateX: -18 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                transition={{ delay: reduced ? 0 : 0.55, duration: reduced ? 0.01 : 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="eyebrow">{letter.title}</p>
                <p className="ow-body">{fill(letter.body)}</p>
                <p className="hand ow-sign">{fill('with love, {creator}')}</p>
                <Heart className="ow-heart" width="22" height="20" color="#D995AA" />
              </motion.article>
              <button type="button" className="btn btn--small" onClick={close} autoFocus>
                <X size={16} aria-hidden="true" /> Close and choose another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </Chapter>
  );
}
