import { motion } from 'framer-motion';
import { Download, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Confetti } from '../components/Confetti';
import { Floaters, Twinkles } from '../components/Floaters';
import { Heart, Sparkle } from '../components/art';
import { Rise, SplitText } from '../components/Text';
import { content, fill } from '../content';
import { letterPlainText } from '../letter';
import { usePrefs } from '../prefs';

type Stage = 'closed' | 'loosen' | 'open';

function GiftBox({ stage }: { stage: Stage }) {
  return (
    <div className={`gbox is-${stage}`} aria-hidden="true">
      <div className="gbox-glow" />
      <div className="gbox-body">
        <div className="gbox-ribbon-v" />
      </div>
      <div className="gbox-lid">
        <div className="gbox-ribbon-v" />
        <div className="gbox-bow">
          <i className="bow-l" />
          <i className="bow-r" />
          <i className="bow-k" />
        </div>
      </div>
      <div className="gbox-ribbon-h" />
      <div className="gbox-rise">
        {Array.from({ length: 12 }).map((_, i) => (
          <Sparkle
            key={i}
            className="gr"
            color={i % 3 === 0 ? '#fff' : i % 3 === 1 ? '#D9BB85' : '#F4A9BC'}
            style={{ left: `${10 + ((i * 37) % 80)}%`, animationDelay: `${(i % 6) * 0.25}s`, width: 10 + (i % 3) * 6, height: 10 + (i % 3) * 6 }}
          />
        ))}
      </div>
    </div>
  );
}

function Collage({ onFail }: { onFail: (src: string) => void }) {
  const photos = content.scrapbook.photos.slice(0, 4);
  return (
    <ul className="collage">
      {photos.map((p, i) => (
        <li key={p.src} style={{ ['--r' as string]: `${(i % 2 ? 1 : -1) * (2 + i)}deg` }}>
          <img src={p.src} alt={p.alt ?? p.caption} loading="lazy" decoding="async" onError={() => onFail(p.src)} />
        </li>
      ))}
    </ul>
  );
}

export default function GiftReveal(_: ChapterProps) {
  const g = content.gift;
  const { reduced } = usePrefs();
  const [stage, setStage] = useState<Stage>('closed');
  const [shot, setShot] = useState(0);
  const [secret, setSecret] = useState(false);
  const [videoBad, setVideoBad] = useState(false);
  const [badPhotos, setBadPhotos] = useState<Set<string>>(new Set());
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const unwrap = () => {
    if (stage !== 'closed') return;
    if (reduced) {
      setStage('open');
      return;
    }
    setStage('loosen');
    timers.current.push(window.setTimeout(() => setStage('open'), 1100));
    timers.current.push(window.setTimeout(() => setShot((n) => n + 1), 1300));
  };

  const download = () => {
    const blob = new Blob([letterPlainText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'your-birthday-letter.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const hasVideo = g.videoSrc.trim().length > 0 && !videoBad;
  const hasSong = g.songLink.trim().length > 0;
  const goodPhotos = content.scrapbook.photos.filter((p) => !badPhotos.has(p.src));
  const hasCollage = g.showCollage && goodPhotos.length > 0;
  const emptyGift = !hasVideo && !hasSong && !hasCollage;

  return (
    <Chapter
      scene="scene-gift"
      title="Your birthday gift"
      decor={
        <>
          <Twinkles count={14} seed={71} />
          <Floaters kind="hearts" count={6} seed={72} />
        </>
      }
    >
      <Confetti trigger={shot} mode="burst" count={50} origin={{ x: 50, y: 34 }} />
      <SplitText as="h1" className="h-serif" text={g.heading} />
      <GiftBox stage={stage} />
      {stage !== 'open' && (
        <Rise delay={0.4}>
          <button type="button" className="btn btn--pulse" onClick={unwrap} disabled={stage === 'loosen'}>
            {g.button}
          </button>
        </Rise>
      )}

      {stage === 'open' && (
        <motion.div
          className="gift-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {hasVideo && (
            <section className="gift-card card">
              <video
                className="gift-video"
                src={g.videoSrc}
                controls
                playsInline
                preload="metadata"
                onError={() => setVideoBad(true)}
                aria-label={g.videoCaption}
              />
              <p className="hand">{fill(g.videoCaption)}</p>
            </section>
          )}

          {hasCollage && (
            <section className="gift-card card">
              <Collage onFail={(src) => setBadPhotos((s) => new Set(s).add(src))} />
            </section>
          )}

          {hasSong && (
            <section className="gift-card card">
              <p className="hand">{fill(g.songLabel)}</p>
              <a className="btn btn--small" href={g.songLink} target="_blank" rel="noopener noreferrer">
                Listen <ExternalLink size={16} aria-hidden="true" />
              </a>
            </section>
          )}

          {import.meta.env.DEV && emptyGift && (
            <section className="gift-card gift-placeholder">
              <p className="eyebrow">Creator note (only visible while developing)</p>
              <p>
                Add a video (gift.videoSrc), a song link (gift.songLink) or photos (scrapbook.photos) in
                src/content.ts to fill this space. This note never appears on the published site.
              </p>
            </section>
          )}

          <section className="gift-card card">
            <h2 className="h-mid">{g.reasonsHeading}</h2>
            <ul className="reasons">
              {g.reasons.map((r) => (
                <li key={r}>
                  <Heart width="16" height="15" color="#D995AA" />
                  <span>{fill(r)}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="gift-actions">
            <button type="button" className="btn btn--soft" onClick={download}>
              <Download size={18} aria-hidden="true" /> {g.downloadLabel}
            </button>
            <button type="button" className="btn" onClick={() => setSecret(true)} aria-expanded={secret} disabled={secret}>
              {g.secretHeading}
            </button>
          </div>

          {secret && (
            <motion.section className="gift-card card secret" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} aria-live="polite">
              <p className="hand secret-text">{fill(g.secret)}</p>
            </motion.section>
          )}
        </motion.div>
      )}
    </Chapter>
  );
}
