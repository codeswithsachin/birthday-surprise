import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Chapter, type ChapterProps } from '../components/Chapter';
import { Cloud, Flower, GiftBoxSmall, Heart, Sparkle, Star } from '../components/art';
import { Rise, SplitText } from '../components/Text';
import { content, fill } from '../content';

/* ---------------- A. catch the hearts ---------------- */
interface Spawn {
  id: number;
  x: number;
  y: number;
  size: number;
}

function CatchHearts() {
  const g = content.games.hearts;
  const [hearts, setHearts] = useState<Spawn[]>([]);
  const [score, setScore] = useState(0);
  const idRef = useRef(0);
  const done = score >= g.goal;

  useEffect(() => {
    if (done) {
      setHearts([]);
      return;
    }
    const spawn = window.setInterval(() => {
      setHearts((h) => {
        if (h.length >= 3) return h;
        idRef.current += 1;
        const id = idRef.current;
        window.setTimeout(() => setHearts((cur) => cur.filter((x) => x.id !== id)), 4200);
        return [
          ...h,
          { id, x: 8 + Math.random() * 78, y: 8 + Math.random() * 66, size: 46 + Math.round(Math.random() * 14) },
        ];
      });
    }, 850);
    return () => window.clearInterval(spawn);
  }, [done]);

  const catchOne = (id: number) => {
    setHearts((h) => h.filter((x) => x.id !== id));
    setScore((s) => s + 1);
  };

  return (
    <section className="game card" aria-labelledby="g-hearts">
      <h2 id="g-hearts" className="h-mid">{g.title}</h2>
      <p className="game-help">{g.help}</p>
      <div className="heart-field" aria-live="polite">
        {hearts.map((h) => (
          <button
            key={h.id}
            type="button"
            className="catch-heart"
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: h.size, height: h.size }}
            onClick={() => catchOne(h.id)}
            aria-label="Catch this heart"
          >
            <Heart width="100%" height="100%" color="#D995AA" />
          </button>
        ))}
        {done && (
          <motion.p className="game-win hand" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            {g.done}
          </motion.p>
        )}
      </div>
      <p className="score" aria-label={`${Math.min(score, g.goal)} of ${g.goal} hearts collected`}>
        {Array.from({ length: g.goal }).map((_, i) => (
          <Heart key={i} width="20" height="18" color={i < score ? '#D995AA' : 'rgba(84,45,64,0.15)'} />
        ))}
      </p>
      {done && (
        <button type="button" className="btn btn--small btn--soft" onClick={() => setScore(0)}>
          Play again
        </button>
      )}
    </section>
  );
}

/* ---------------- B. choose a gift ---------------- */
function ChooseGift() {
  const g = content.games.gifts;
  const [open, setOpen] = useState<Set<number>>(new Set());
  const colors = ['#D995AA', '#D9BB85', '#B9A3DE'];
  return (
    <section className="game card" aria-labelledby="g-gifts">
      <h2 id="g-gifts" className="h-mid">{g.title}</h2>
      <p className="game-help">{g.help}</p>
      <ul className="gift-row">
        {g.items.map((it, i) => {
          const isOpen = open.has(i);
          return (
            <li key={it.label}>
              <button
                type="button"
                className={`gift-pick ${isOpen ? 'is-open' : ''}`}
                aria-expanded={isOpen}
                onClick={() => setOpen((s) => new Set(s).add(i))}
              >
                <GiftBoxSmall color={colors[i]} className="gift-pick-art" />
                <span className="gift-label">{it.label}</span>
              </button>
              {isOpen && (
                <motion.p className="gift-text hand" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {fill(it.text)}
                </motion.p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------- C. find the hidden star ---------------- */
function HiddenStar() {
  const g = content.games.star;
  const [found, setFound] = useState(false);
  const flowers = [
    { x: 8, y: 66, c: '#F4A9BC' },
    { x: 26, y: 74, c: '#fff' },
    { x: 46, y: 70, c: '#F6C94C' },
    { x: 66, y: 76, c: '#E58AA2' },
    { x: 86, y: 68, c: '#fff' },
  ];
  return (
    <section className="game card" aria-labelledby="g-star">
      <h2 id="g-star" className="h-mid">{g.title}</h2>
      <p className="game-help">{g.help}</p>
      <div className="star-field">
        <Cloud className="sf-cloud sf-c1" />
        <Cloud className="sf-cloud sf-c2" />
        {flowers.map((f, i) => (
          <Flower key={i} className="sf-flower" style={{ left: `${f.x}%`, top: `${f.y}%` }} color={f.c} />
        ))}
        <Sparkle className="sf-decoy" width="12" height="12" color="#fff" style={{ left: '34%', top: '22%' }} />
        <Sparkle className="sf-decoy" width="10" height="10" color="#fff" style={{ left: '72%', top: '30%' }} />
        <button
          type="button"
          className={`hidden-star ${found ? 'is-found' : ''}`}
          onClick={() => setFound(true)}
          aria-label={found ? 'The hidden star, found' : 'A tiny star, tap to find out what it says'}
        >
          <Star width="100%" height="100%" color="#D9BB85" />
        </button>
      </div>
      {found && (
        <motion.p className="game-win hand" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} aria-live="polite">
          {g.found}
        </motion.p>
      )}
    </section>
  );
}

export default function MiniGames(_: ChapterProps) {
  const g = content.games;
  const noop = useCallback(() => {}, []);
  void noop;
  return (
    <Chapter scene="scene-games" title="A tiny game">
      <SplitText as="h1" className="h-serif" text={g.heading} />
      <Rise delay={0.4}>
        <p className="lede">{g.sub}</p>
      </Rise>
      <div className="games-grid">
        <CatchHearts />
        <ChooseGift />
        <HiddenStar />
      </div>
    </Chapter>
  );
}
