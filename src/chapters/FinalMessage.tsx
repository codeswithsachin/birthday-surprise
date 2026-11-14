import { motion } from 'framer-motion';
import { Github, ListChecks, RotateCcw } from 'lucide-react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Floaters, Twinkles } from '../components/Floaters';
import { Mascot } from '../components/mascot';
import { SplitText } from '../components/Text';
import { content, fill } from '../content';
import { usePrefs } from '../prefs';

export default function FinalMessage({ onReplay, onMenu }: ChapterProps) {
  const f = content.final;
  const { reduced } = usePrefs();
  const base = reduced ? 0 : 1.2;
  const step = reduced ? 0 : 1.1;

  const fade = (n: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: base + n * step, duration: reduced ? 0.01 : 1 },
  });

  return (
    <Chapter
      scene="scene-final"
      title="The last little note"
      decor={
        <>
          <Floaters kind="petals" count={16} seed={81} />
          <Twinkles count={10} seed={82} />
        </>
      }
    >
      <Mascot animal={content.animal} pose="wave" className="mascot-wave" label="A little character waving goodbye" />
      <SplitText as="h1" className="h-serif" text={f.heading} />
      <div className="final-text">
        {f.paragraphs.map((p, i) => (
          <motion.p key={p} className={i === f.paragraphs.length - 1 ? 'final-p final-strong' : 'final-p'} {...fade(i)}>
            {fill(p)}
          </motion.p>
        ))}
      </div>
      <motion.div className="final-note" {...fade(f.paragraphs.length + 1)}>
        <p className="hand">{fill(f.finalNoteTop)}</p>
        <p className="hand final-note-b">{fill(f.finalNoteBottom)}</p>
      </motion.div>
      <motion.div className="final-sign" {...fade(f.paragraphs.length + 2)}>
        <p className="hand">{fill(f.signature)}</p>
        {content.creatorHandle && (
          <a className="ig-link" href={content.creatorUrl} target="_blank" rel="noopener noreferrer">
            <Github size={16} aria-hidden="true" /> {content.creatorHandle}
          </a>
        )}
      </motion.div>
      <motion.div className="final-actions" {...fade(f.paragraphs.length + 3)}>
        <button type="button" className="btn" onClick={onReplay}>
          <RotateCcw size={18} aria-hidden="true" /> {f.replay}
        </button>
        <button type="button" className="btn btn--soft" onClick={onMenu}>
          <ListChecks size={18} aria-hidden="true" /> {f.chaptersLabel}
        </button>
      </motion.div>
    </Chapter>
  );
}
