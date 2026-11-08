import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Cake } from '../components/Cake';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Confetti } from '../components/Confetti';
import { Floaters, Twinkles } from '../components/Floaters';
import { Mascot } from '../components/mascot';
import { Rise, SplitText } from '../components/Text';
import { content, fill } from '../content';
import type { Animal } from '../content';

const PARTNER: Record<Animal, Animal> = { teddy: 'bunny', bear: 'cat', bunny: 'teddy', cat: 'bunny' };

export default function BirthdayReveal({ onNext }: ChapterProps) {
  const r = content.reveal;
  const [shot, setShot] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setShot(1), 700);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <Chapter
      scene="scene-reveal"
      title="Happy birthday"
      decor={
        <>
          <Twinkles count={20} seed={5} />
          <Floaters kind="mixed" count={10} seed={9} />
        </>
      }
    >
      <Confetti trigger={shot} mode="fall" count={54} />
      {content.birthdayDate.trim() && (
        <Rise delay={0.1}>
          <p className="date-label">
            <span aria-hidden="true">✦</span> {content.birthdayDate} <span aria-hidden="true">✦</span>
          </p>
        </Rise>
      )}
      <div className="reveal-row">
        <Mascot animal={content.animal} pose="cheer" className="mascot-side bob" />
        <motion.div
          className="mini-cake"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="bob">
            <Cake lit />
          </div>
        </motion.div>
        <Mascot animal={PARTNER[content.animal]} pose="cheer" className="mascot-side bob delay" />
      </div>
      <SplitText as="h1" className="h-serif" text={fill(r.heading)} delay={0.3} stagger={0.11} />
      <Rise delay={1.1}>
        <p className="lede">{fill(r.message)}</p>
      </Rise>
      <Rise delay={1.6}>
        <button type="button" className="btn" onClick={onNext}>
          {fill(r.button)}
        </button>
      </Rise>
    </Chapter>
  );
}
