import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Envelope } from '../components/Envelope';
import { Clouds, Floaters, Twinkles } from '../components/Floaters';
import { GiftBoxSmall, Heart, Sparkle } from '../components/art';
import { HeldEnvelope, Mascot } from '../components/mascot';
import { SplitText } from '../components/Text';
import { content, fill } from '../content';
import { usePrefs } from '../prefs';

export default function OpeningScene({ onNext }: ChapterProps) {
  const { reduced } = usePrefs();
  const [opened, setOpened] = useState(false);
  const [flap, setFlap] = useState(false);
  const timers = useRef<number[]>([]);
  const o = content.opening;

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const open = () => {
    if (opened) return;
    setOpened(true);
    if (reduced) {
      timers.current.push(window.setTimeout(onNext, 400));
      return;
    }
    timers.current.push(window.setTimeout(() => setFlap(true), 350));
    timers.current.push(window.setTimeout(onNext, 3600));
  };

  return (
    <Chapter
      scene="scene-opening"
      title="The little envelope"
      decor={
        <>
          <Twinkles count={22} seed={2} />
          <Clouds count={3} />
          <Floaters kind="hearts" count={9} seed={4} />
        </>
      }
    >
      {!opened ? (
        <>
          <motion.div
            className="open-stage"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Mascot animal={content.animal} pose="hold" className="mascot-hero bob" label="A little bear holding an envelope">
              <HeldEnvelope />
            </Mascot>
            <GiftBoxSmall className="gift-beside" color="#D995AA" />
            <Sparkle className="sp sp-a" color="#D9BB85" />
            <Sparkle className="sp sp-b" color="#F4A9BC" />
          </motion.div>
          <SplitText as="h1" className="h-serif" text={o.heading} delay={0.3} stagger={0.09} />
          <motion.p
            className="lede"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            {o.sub}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 2, duration: 0.7 }}>
            <button type="button" className="btn btn--pulse" onClick={open}>
              {o.button}
            </button>
          </motion.div>
        </>
      ) : (
        <div className="open-envelope-wrap">
          <button
            type="button"
            className="env-button"
            onClick={onNext}
            aria-label="Continue to the birthday greeting"
          >
            <Envelope open={flap} className="env-big">
              <div className="env-note">
                <span className="hand">{fill(o.noteTo)}</span>
                <Heart width="22" height="20" color="#D995AA" />
              </div>
            </Envelope>
            {!reduced && (
              <span className="burst" aria-hidden="true">
                {Array.from({ length: 10 }).map((_, i) => (
                  <i key={i} style={{ ['--a' as string]: `${i * 36}deg`, animationDelay: `${0.5 + i * 0.04}s` }}>
                    {i % 2 ? <Heart width="14" height="13" color="#D995AA" /> : <Sparkle width="14" height="14" color="#D9BB85" />}
                  </i>
                ))}
              </span>
            )}
          </button>
          <p className="hint">{o.noteInside}</p>
        </div>
      )}
    </Chapter>
  );
}
