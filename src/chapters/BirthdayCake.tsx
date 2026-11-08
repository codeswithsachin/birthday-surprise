import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Cake } from '../components/Cake';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Confetti } from '../components/Confetti';
import { Floaters, Twinkles } from '../components/Floaters';
import { Sparkle } from '../components/art';
import { Rise, SplitText } from '../components/Text';
import { content, fill } from '../content';

export default function BirthdayCake(_: ChapterProps) {
  const c = content.cake;
  const [lit, setLit] = useState(true);
  const [shot, setShot] = useState(0);
  const [sparkles, setSparkles] = useState(0);

  const blow = () => {
    setLit(false);
    setShot((n) => n + 1);
    setSparkles((n) => n + 1);
  };
  const relight = () => {
    setLit(true);
  };

  return (
    <Chapter
      scene="scene-cake"
      title="The birthday cake"
      decor={
        <>
          <Twinkles count={14} seed={41} />
          <Floaters kind="stars" count={6} seed={43} />
        </>
      }
    >
      <Confetti trigger={shot} mode="burst" count={44} origin={{ x: 50, y: 42 }} />
      <SplitText as="h1" className="h-serif" text={c.heading} />
      <div className="cake-wrap">
        <Cake lit={lit} />
        <AnimatePresence>
          {!lit && sparkles > 0 && (
            <motion.div key={sparkles} className="cake-sparks" aria-hidden="true" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 2.2 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Sparkle
                  key={i}
                  className="cs"
                  color={i % 2 ? '#D9BB85' : '#D995AA'}
                  style={{ ['--a' as string]: `${i * 45}deg`, width: 16, height: 16 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div aria-live="polite" className="cake-msg-wrap">
        {lit ? (
          <Rise delay={0.4}>
            <button type="button" className="btn btn--pulse" onClick={blow}>
              {c.button}
            </button>
          </Rise>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
            <p className="lede">{fill(c.reveal)}</p>
            <button type="button" className="btn btn--small btn--soft" onClick={relight} style={{ marginTop: 18 }}>
              {c.relight}
            </button>
          </motion.div>
        )}
      </div>
    </Chapter>
  );
}
