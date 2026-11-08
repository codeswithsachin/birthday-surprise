import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefs } from '../prefs';

type Tag = 'h1' | 'h2' | 'h3' | 'p';

/* Word by word reveal. Falls back to plain text when motion is reduced. */
export function SplitText({
  text,
  as = 'h2',
  className,
  delay = 0,
  stagger = 0.07,
}: {
  text: string;
  as?: Tag;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const { reduced } = usePrefs();
  const Tag = as;
  const shown = text.replace(/'/g, '\u2019');
  if (reduced) return <Tag className={className}>{shown}</Tag>;
  const words = shown.split(' ');
  return (
    <Tag className={className} aria-label={shown}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          aria-hidden="true"
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: delay + i * stagger, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}

/* Gentle rise and fade for any block */
export function Rise({
  children,
  delay = 0,
  className,
  y = 18,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
