import type { Animal, ThemePack } from './content';

export type Motion = 'fall' | 'rise' | 'float' | 'swim';

export interface PackInfo {
  key: ThemePack;
  label: string;
  emoji: string;
  /** shown in the admin picker */
  blurb: string;
  /** three colours for the little preview dots */
  swatch: [string, string, string];
  /** floating decorations (none for the classic look) */
  glyphs: string[];
  motion: Motion;
  /** shown when she/he taps the screen */
  burst: string[];
  /** the mascot that matches this pack, if there is one */
  animal?: Animal;
}

export const PACKS: PackInfo[] = [
  { key: 'classic', label: 'Classic rose', emoji: '🌹', blurb: 'The original soft pink look', swatch: ['#d995aa', '#f6dce5', '#d9bb85'], glyphs: [], motion: 'float', burst: ['💗', '✨', '🎉'] },
  { key: 'cat', label: 'Cat lover', emoji: '🐱', blurb: 'Paw prints, yarn and little fish', swatch: ['#e08fa8', '#fde6ea', '#e9dcf7'], glyphs: ['🐾', '🐱', '🧶', '💗', '🐟'], motion: 'float', burst: ['🐾', '💗', '🐱'], animal: 'cat' },
  { key: 'dog', label: 'Dog lover', emoji: '🐶', blurb: 'Paws, bones and golden warmth', swatch: ['#d9893f', '#fdebc8', '#f6d3a8'], glyphs: ['🐾', '🐶', '🦴', '🎾', '💛'], motion: 'float', burst: ['🐾', '🦴', '💛'], animal: 'dog' },
  { key: 'fish', label: 'Ocean and fish', emoji: '🐠', blurb: 'Fish swim across, bubbles rise', swatch: ['#2f9fc4', '#c9ecf7', '#9fd3ea'], glyphs: ['🐠', '🐟', '🫧', '🐚', '🐡', '🫧'], motion: 'swim', burst: ['🫧', '🐠', '💙'] },
  { key: 'mountain', label: 'Mountains', emoji: '🏔️', blurb: 'Cool blue-green, pine and clouds', swatch: ['#4f8a8b', '#dbe8ee', '#b9d0c4'], glyphs: ['⛰️', '🌲', '☁️', '🦅', '🏔️'], motion: 'float', burst: ['⛰️', '🌲', '✨'] },
  { key: 'ice', label: 'Ice and snow', emoji: '❄️', blurb: 'Snowflakes fall slowly', swatch: ['#5aa9e6', '#dff1fb', '#c6e0f5'], glyphs: ['❄️', '❅', '❆', '💎', '❄️'], motion: 'fall', burst: ['❄️', '💎', '✨'] },
  { key: 'jungle', label: 'Jungle', emoji: '🌿', blurb: 'Leaves, butterflies and flowers', swatch: ['#3f9b5a', '#d6efc7', '#a9d6a2'], glyphs: ['🌿', '🍃', '🦋', '🌺', '🦜'], motion: 'float', burst: ['🍃', '🦋', '🌺'] },
  { key: 'maple', label: 'Maple leaves', emoji: '🍁', blurb: 'Autumn leaves drift down', swatch: ['#d4572a', '#fcdcbc', '#f1a971'], glyphs: ['🍁', '🍂', '🍁', '🍂', '✨'], motion: 'fall', burst: ['🍁', '🍂', '✨'] },
  { key: 'anime', label: 'Anime and sakura', emoji: '🌸', blurb: 'Sakura petals, stars and sparkles', swatch: ['#ff6fae', '#fbd6ee', '#d7c6fb'], glyphs: ['🌸', '✨', '🎐', '⭐', '💫', '🌸'], motion: 'fall', burst: ['🌸', '✨', '💖'] },
  { key: 'galaxy', label: 'Galaxy dreams', emoji: '🪐', blurb: 'Stars, moon and planets', swatch: ['#7c5cd6', '#d9ccf5', '#b7a6ea'], glyphs: ['⭐', '✨', '🌙', '🪐', '💫'], motion: 'rise', burst: ['⭐', '✨', '🌙'] },
  { key: 'garden', label: 'Flower garden', emoji: '💐', blurb: 'A mix of every pretty flower', swatch: ['#e8739a', '#fde3ec', '#cfe9c0'], glyphs: ['🌸', '🌷', '🌻', '🌼', '🌹', '💐', '🪷', '🌺'], motion: 'fall', burst: ['🌸', '🌷', '🌻', '🌹'] },
  { key: 'rose', label: 'Roses', emoji: '🌹', blurb: 'Red roses and soft petals', swatch: ['#c2185b', '#fbd5df', '#f3a6bd'], glyphs: ['🌹', '🥀', '❤️', '🌹', '💕'], motion: 'fall', burst: ['🌹', '❤️', '💕'] },
  { key: 'sunflower', label: 'Sunflowers', emoji: '🌻', blurb: 'Bright, sunny and happy', swatch: ['#e0a100', '#fff1b8', '#ffd84d'], glyphs: ['🌻', '🌼', '🐝', '☀️', '🌻'], motion: 'float', burst: ['🌻', '🌼', '☀️'] },
  { key: 'tulip', label: 'Tulips', emoji: '🌷', blurb: 'Fresh spring tulips and butterflies', swatch: ['#e0568a', '#fde2ee', '#e7d6f7'], glyphs: ['🌷', '🦋', '🌸', '🌷', '🌱'], motion: 'float', burst: ['🌷', '🦋', '🌸'] },
  { key: 'lotus', label: 'Lotus pond', emoji: '🪷', blurb: 'Calm lotus flowers and water drops', swatch: ['#d9609a', '#fde0ee', '#cde9e4'], glyphs: ['🪷', '🫧', '🪷', '🦋', '💧'], motion: 'rise', burst: ['🪷', '💧', '✨'] },
];

export const packInfo = (key: string): PackInfo => PACKS.find((p) => p.key === key) ?? (PACKS[0] as PackInfo);
