import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Gauge, List, Music, VolumeX, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { content } from '../content';
import { usePrefs } from '../prefs';

export function TopBar({
  onMenu,
  music,
  showMusic,
}: {
  onMenu: () => void;
  music: { playing: boolean; error: boolean; toggle: () => void };
  showMusic: boolean;
}) {
  const { skip, toggleSkip, reduced } = usePrefs();
  const label = music.error
    ? 'Music could not be loaded'
    : music.playing
      ? 'Pause music'
      : 'Play music';
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="chip" onClick={onMenu} aria-haspopup="dialog">
          <List size={18} aria-hidden="true" />
          <span className="chip-text">Chapters</span>
        </button>
      </div>
      <div className="topbar-right">
        <button
          type="button"
          className="chip"
          aria-pressed={skip}
          onClick={toggleSkip}
          title="Skip animations"
          aria-label={reduced && !skip ? 'Animations are already reduced by your device' : 'Skip animations'}
        >
          <Gauge size={18} aria-hidden="true" />
          <span className="chip-text">Calm mode</span>
        </button>
        {showMusic && (
          <button
            type="button"
            className="chip chip--icon"
            onClick={music.toggle}
            aria-pressed={music.playing}
            aria-label={label}
            title={label}
            disabled={music.error}
          >
            {music.playing ? <Music size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
    </header>
  );
}

export function BottomBar({
  index,
  total,
  explored,
  onPrev,
  onNext,
  hideNext,
  nextLabel,
}: {
  index: number;
  total: number;
  explored: number;
  onPrev: () => void;
  onNext: () => void;
  hideNext?: boolean;
  nextLabel?: string;
}) {
  const pct = Math.round((explored / total) * 100);
  return (
    <nav className="bottombar" aria-label="Chapter navigation">
      <button
        type="button"
        className="btn btn--soft btn--icon"
        onClick={onPrev}
        disabled={index === 0}
        aria-label="Previous chapter"
        style={index === 0 ? { visibility: 'hidden' } : undefined}
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Exploration progress">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-label">
          {index + 1} of {total}
        </span>
      </div>
      <button
        type="button"
        className="btn btn--soft btn--icon"
        onClick={onNext}
        disabled={hideNext}
        aria-label={nextLabel ?? 'Next chapter'}
        style={hideNext ? { visibility: 'hidden' } : undefined}
      >
        <ChevronRight size={22} aria-hidden="true" />
      </button>
    </nav>
  );
}

export function ChapterMenu({
  open,
  onClose,
  index,
  visited,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  index: number;
  visited: Set<number>;
  onPick: (i: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Chapters"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          >
            <div className="menu-head">
              <h2 className="h-mid">{content.final.chaptersLabel}</h2>
              <button ref={closeRef} type="button" className="btn btn--soft btn--icon" onClick={onClose} aria-label="Close chapters">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <ol className="menu-list">
              {content.chapterTitles.map((t, i) => (
                <li key={t}>
                  <button
                    type="button"
                    className={`menu-item ${visited.has(i) ? 'is-visited' : ''}`}
                    aria-current={i === index}
                    onClick={() => onPick(i)}
                  >
                    <span className="menu-num">{i + 1}</span>
                    <span className="menu-title">{t}</span>
                  </button>
                </li>
              ))}
            </ol>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
