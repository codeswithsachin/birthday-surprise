import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy, useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { useMusic } from './audio';
import type { ChapterProps } from './components/Chapter';
import Ambient from './components/Ambient';
import { BottomBar, ChapterMenu, TopBar } from './components/Shell';
import { content } from './content';
import { usePrefs } from './prefs';

type ChapterModule = { default: ComponentType<ChapterProps> };

/* Chapters are loaded on demand (React.lazy). The next one is fetched in the background. */
const LOADERS: (() => Promise<ChapterModule>)[] = [
  () => import('./chapters/OpeningScene'),
  () => import('./chapters/BirthdayReveal'),
  () => import('./chapters/CuteComparisons'),
  () => import('./chapters/QualitiesScrapbook'),
  () => import('./chapters/ScrapbookGallery'),
  () => import('./chapters/WishesChapter'),
  () => import('./chapters/PoemsChapter'),
  () => import('./chapters/InteractiveLetters'),
  () => import('./chapters/MiniGames'),
  () => import('./chapters/BirthdayCake'),
  () => import('./chapters/HeartfeltLetter'),
  () => import('./chapters/StarryWishes'),
  () => import('./chapters/GiftReveal'),
  () => import('./chapters/FinalMessage'),
];
const CHAPTERS = LOADERS.map((load) => lazy(load));
const TOTAL = CHAPTERS.length;
const DARK_CHAPTER = 11;

interface AppProps {
  /** used by the admin live preview, so a refresh keeps the same chapter */
  startAt?: number;
  onIndexChange?: (index: number) => void;
}

export default function App({ startAt = 0, onIndexChange }: AppProps = {}) {
  const first = Math.max(0, Math.min(TOTAL - 1, startAt));
  const [index, setIndex] = useState(first);
  const [dir, setDir] = useState(1);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([first]));
  const [menu, setMenu] = useState(false);
  const indexRef = useRef(first);
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

  useEffect(() => {
    onIndexChange?.(index);
    const nextLoader = LOADERS[index + 1];
    if (nextLoader) void nextLoader().catch(() => undefined);
  }, [index, onIndexChange]);

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
      data-theme={content.theme.pack}
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
            <Suspense fallback={<div className="chapter-loading" role="status" aria-label="Loading" />}>
              <Current onNext={next} onReplay={replay} onMenu={openMenu} />
            </Suspense>
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
      <Ambient />
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
