import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { useMusic } from './audio';
import type { ChapterProps } from './components/Chapter';
import { BottomBar, ChapterMenu, TopBar } from './components/Shell';
import { content } from './content';
import { usePrefs } from './prefs';
import BirthdayCake from './chapters/BirthdayCake';
import BirthdayReveal from './chapters/BirthdayReveal';
import CuteComparisons from './chapters/CuteComparisons';
import FinalMessage from './chapters/FinalMessage';
import GiftReveal from './chapters/GiftReveal';
import HeartfeltLetter from './chapters/HeartfeltLetter';
import InteractiveLetters from './chapters/InteractiveLetters';
import MiniGames from './chapters/MiniGames';
import OpeningScene from './chapters/OpeningScene';
import QualitiesScrapbook from './chapters/QualitiesScrapbook';
import ScrapbookGallery from './chapters/ScrapbookGallery';
import StarryWishes from './chapters/StarryWishes';
import WishesChapter from './chapters/WishesChapter';

const CHAPTERS: ComponentType<ChapterProps>[] = [
  OpeningScene,
  BirthdayReveal,
  CuteComparisons,
  QualitiesScrapbook,
  ScrapbookGallery,
  WishesChapter,
  InteractiveLetters,
  MiniGames,
  BirthdayCake,
  HeartfeltLetter,
  StarryWishes,
  GiftReveal,
  FinalMessage,
];
const TOTAL = CHAPTERS.length;
const DARK_CHAPTER = 10;

export default function App() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [menu, setMenu] = useState(false);
  const indexRef = useRef(0);
  const music = useMusic();
  const { reduced } = usePrefs();

  const go = useCallback((target: number) => {
    const n = Math.max(0, Math.min(TOTAL - 1, target));
    setDir(n >= indexRef.current ? 1 : -1);
    indexRef.current = n;
    setIndex(n);
    setVisited((v) => (v.has(n) ? v : new Set(v).add(n)));
    setMenu(false);
  }, []);

  const next = useCallback(() => go(indexRef.current + 1), [go]);
  const prev = useCallback(() => go(indexRef.current - 1), [go]);
  const replay = useCallback(() => go(0), [go]);
  const openMenu = useCallback(() => setMenu(true), []);
  const closeMenu = useCallback(() => setMenu(false), []);

  /* keyboard navigation (paused while a dialog is open) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      if (indexRef.current === 0) return;
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const Current = CHAPTERS[index];
  const accent = content.accentColor.trim();
  const dark = index === DARK_CHAPTER;

  return (
    <div
      className={`app ${dark ? 'is-dark' : ''}`}
      style={accent ? ({ ['--rose' as string]: accent } as React.CSSProperties) : undefined}
    >
      <main className="stage">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={index}
            className="stage"
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, scale: reduced ? 1 : 1.03, x: reduced ? 0 : d * 24 }),
              center: { opacity: 1, scale: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, scale: reduced ? 1 : 0.985, x: reduced ? 0 : d * -24 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduced ? 0.01 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Current onNext={next} onReplay={replay} onMenu={openMenu} />
          </motion.div>
        </AnimatePresence>
      </main>

      <TopBar onMenu={openMenu} music={music} showMusic />
      {index > 0 && (
        <BottomBar
          index={index}
          total={TOTAL}
          explored={visited.size}
          onPrev={prev}
          onNext={next}
          hideNext={index === TOTAL - 1}
        />
      )}
      <ChapterMenu open={menu} onClose={closeMenu} index={index} visited={visited} onPick={go} />
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
