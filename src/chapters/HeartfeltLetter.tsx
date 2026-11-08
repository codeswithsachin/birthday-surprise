import { motion } from 'framer-motion';
import { useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Envelope } from '../components/Envelope';
import { SplitText } from '../components/Text';
import { content, fill } from '../content';
import { letterParagraphs } from '../letter';
import { usePrefs } from '../prefs';

function PressedFlower() {
  return (
    <svg viewBox="0 0 70 90" className="pressed" aria-hidden="true">
      <path d="M35 88 C33 66 37 52 35 36" fill="none" stroke="#9DBB8F" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M35 66 C24 64 16 56 14 48 26 48 34 56 35 66z" fill="#B7D1AB" opacity=".85" />
      <path d="M36 58 C46 56 54 48 56 40 44 40 37 48 36 58z" fill="#B7D1AB" opacity=".85" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="35" cy="20" rx="7.5" ry="12" fill="#F1B7C6" opacity=".9" transform={`rotate(${a} 35 30)`} />
      ))}
      <circle cx="35" cy="30" r="5" fill="#D9BB85" />
    </svg>
  );
}

export default function HeartfeltLetter(_: ChapterProps) {
  const l = content.letter;
  const { reduced } = usePrefs();
  const [stage, setStage] = useState<'closed' | 'open'>('closed');
  const [all, setAll] = useState(false);
  const paras = letterParagraphs();
  const instant = reduced || all;

  return (
    <Chapter scene="scene-letter" title="The most important letter">
      <SplitText as="h1" className="h-serif letter-title" text={l.heading} />
      {stage === 'closed' ? (
        <motion.div className="letter-closed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>
          <button type="button" className="env-button" onClick={() => setStage('open')} aria-label="Open the letter">
            <Envelope open={false} className="env-letter" />
          </button>
          <p className="hint">{l.envelopeHint}</p>
        </motion.div>
      ) : (
        <motion.article
          className="paper"
          initial={{ opacity: 0, y: 40, scaleY: 0.82, rotateX: -24 }}
          animate={{ opacity: 1, y: 0, scaleY: 1, rotateX: 0 }}
          transition={{ duration: reduced ? 0.01 : 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'top center' }}
        >
          <PressedFlower />
          <p className="paper-greeting hand">{fill(l.greeting)}</p>
          {paras.map((p, i) => (
            <motion.p
              key={`${i}-${all}`}
              className="paper-p"
              initial={instant ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: instant ? 0 : 0.9 + i * 1.1, duration: 0.9 }}
            >
              {p}
            </motion.p>
          ))}
          {l.closing.map((p, i) => (
            <motion.p
              key={`${p}-${all}`}
              className={i === 0 ? 'paper-p paper-strong' : 'paper-p'}
              initial={instant ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: instant ? 0 : 0.9 + (paras.length + i) * 1.1, duration: 0.9 }}
            >
              {fill(p)}
            </motion.p>
          ))}
          <motion.div
            key={`sign-${all}`}
            className="paper-sign"
            initial={instant ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: instant ? 0 : 0.9 + (paras.length + l.closing.length) * 1.1, duration: 1.2 }}
          >
            <p className="hand sign-off">{fill(l.signOff)}</p>
            <p className="hand signature">{fill(l.signature)}</p>
          </motion.div>
          {!instant && (
            <button type="button" className="btn btn--small btn--soft show-all" onClick={() => setAll(true)}>
              Show the whole letter
            </button>
          )}
        </motion.article>
      )}
    </Chapter>
  );
}
