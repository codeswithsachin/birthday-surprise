import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Face } from '../components/mascot';
import { Portal } from '../components/Portal';
import { Flower, Heart, Sparkle, Star } from '../components/art';
import { Rise, SplitText } from '../components/Text';
import { content, fill, type Photo } from '../content';
import { usePrefs } from '../prefs';

const TILTS = [-3.2, 2.4, -1.4, 3, -2.2, 1.6];
const TAPES = ['#F6DCE5', '#D9BB85', '#CFE3F2', '#D8E8CF'];
const PLACEHOLDER_BG = [
  'linear-gradient(160deg,#fde6ec,#f6dce5)',
  'linear-gradient(160deg,#fdf0d6,#f8e1d3)',
  'linear-gradient(160deg,#e6eefb,#f3e3f1)',
  'linear-gradient(160deg,#e8f0dc,#fdeff2)',
  'linear-gradient(160deg,#f6dce5,#fdf0d6)',
];

function PlaceholderArt({ i }: { i: number }) {
  const animals = ['teddy', 'bunny', 'cat', 'bear', 'teddy'] as const;
  return (
    <div className="ph-art" style={{ background: PLACEHOLDER_BG[i % PLACEHOLDER_BG.length] }} aria-hidden="true">
      <svg viewBox="30 14 140 140" className="ph-face">
        <Face animal={animals[i % animals.length]} sleepy={i % 2 === 1} />
      </svg>
      <Heart className="ph-d ph-d1" width="22" height="20" color="#D995AA" />
      <Star className="ph-d ph-d2" width="20" height="20" color="#D9BB85" />
      <Sparkle className="ph-d ph-d3" width="18" height="18" color="#fff" />
      <Flower className="ph-d ph-d4" width="30" height="30" color="#F4A9BC" />
    </div>
  );
}

function PhotoImg({ photo, onFail }: { photo: Photo; onFail: () => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`ph-img ${loaded ? 'is-loaded' : ''}`}>
      <img
        src={photo.src}
        alt={photo.alt ?? photo.caption}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={onFail}
      />
    </div>
  );
}

export default function ScrapbookGallery(_: ChapterProps) {
  const s = content.scrapbook;
  const { reduced } = usePrefs();
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const [light, setLight] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const real = s.photos.length > 0;
  const items: { photo: Photo | null; caption: string }[] = real
    ? s.photos.map((p) => ({ photo: p, caption: p.caption }))
    : s.placeholderCaptions.map((c) => ({ photo: null, caption: c }));

  const usable = items
    .map((it, i) => ({ ...it, i }))
    .filter((it) => it.photo && !failed.has(it.i));

  const close = useCallback(() => {
    setLight(null);
    openerRef.current?.focus();
  }, []);
  const step = useCallback(
    (d: number) => {
      setLight((cur) => {
        if (cur === null || usable.length === 0) return cur;
        const pos = usable.findIndex((u) => u.i === cur);
        return usable[(pos + d + usable.length) % usable.length].i;
      });
    },
    [usable],
  );

  useEffect(() => {
    if (light === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [light, close, step]);

  const lightItem = light !== null ? items[light] : null;

  return (
    <Chapter scene="scene-scrapbook" title="A little photo scrapbook">
      <SplitText as="h1" className="h-serif" text={s.heading} />
      <Rise delay={0.4}>
        <p className="lede">{s.sub}</p>
      </Rise>

      <ul className="scrap-grid">
        {items.map((it, i) => {
          const showReal = it.photo && !failed.has(i);
          const frame = (
            <>
              <span className="tape" style={{ background: TAPES[i % TAPES.length] }} aria-hidden="true" />
              {showReal ? (
                <PhotoImg photo={it.photo as Photo} onFail={() => setFailed((f) => new Set(f).add(i))} />
              ) : (
                <PlaceholderArt i={i} />
              )}
              <span className="polaroid-cap hand">{fill(it.caption)}</span>
            </>
          );
          return (
            <motion.li
              key={`${it.caption}-${i}`}
              className="scrap-item"
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: TILTS[i % TILTS.length] }}
              transition={{ delay: reduced ? 0 : 0.35 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {showReal ? (
                <button
                  type="button"
                  className="polaroid is-button"
                  onClick={(e) => {
                    openerRef.current = e.currentTarget;
                    setLight(i);
                  }}
                  aria-label={`Open photo: ${it.caption}`}
                >
                  {frame}
                </button>
              ) : (
                <div className="polaroid">{frame}</div>
              )}
            </motion.li>
          );
        })}
      </ul>

      {s.memories.length > 0 && (
        <ul className="memo-row">
          {s.memories.map((m) => (
            <li key={m.title} className="memo">
              <span className="memo-title">{fill(m.title)}</span>
              <span className="hand memo-text">{fill(m.text)}</span>
            </li>
          ))}
        </ul>
      )}

      <Portal>
      <AnimatePresence>
        {lightItem && lightItem.photo && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <figure className="lb-figure" onClick={(e) => e.stopPropagation()}>
              <img src={lightItem.photo.src} alt={lightItem.photo.alt ?? lightItem.caption} />
              <figcaption className="hand">{fill(lightItem.caption)}</figcaption>
            </figure>
            <button type="button" className="btn btn--soft btn--icon lb-close" onClick={close} aria-label="Close photo" autoFocus>
              <X size={20} aria-hidden="true" />
            </button>
            {usable.length > 1 && (
              <>
                <button
                  type="button"
                  className="btn btn--soft btn--icon lb-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={22} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn--soft btn--icon lb-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Next photo"
                >
                  <ChevronRight size={22} aria-hidden="true" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </Chapter>
  );
}
