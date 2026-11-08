import { useId, type SVGProps } from 'react';
import type { ArtKey } from '../content';
import { P } from '../palette';
import { Face } from './mascot';

type S = SVGProps<SVGSVGElement>;
const OUT = P.outline;

/* ------------------------------------------------------------ tiny shapes */

export function Heart({ color = P.rose, ...p }: S & { color?: string }) {
  return (
    <svg viewBox="0 0 32 30" aria-hidden="true" {...p}>
      <path
        d="M16 28C3 18 1 10 6 5.5c4-3.5 8.5-1 10 2.5 1.5-3.5 6-6 10-2.5 5 4.5 3 12.5-10 22.5z"
        fill={color}
      />
    </svg>
  );
}

export function Star({ color = P.gold, ...p }: S & { color?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...p}>
      <path
        d="M16 3l3.9 8.8 9.6 1-7.2 6.4 2.1 9.4L16 23.6 7.6 28.6l2.1-9.4-7.2-6.4 9.6-1z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sparkle({ color = P.gold, ...p }: S & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path d="M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0z" fill={color} />
    </svg>
  );
}

export function Cloud({ color = '#fff', ...p }: S & { color?: string }) {
  return (
    <svg viewBox="0 0 120 64" aria-hidden="true" {...p}>
      <g fill={color} opacity="0.92">
        <circle cx="36" cy="40" r="18" />
        <circle cx="62" cy="30" r="24" />
        <circle cx="88" cy="40" r="18" />
        <rect x="36" y="40" width="52" height="18" rx="9" />
      </g>
    </svg>
  );
}

export function Petal({ color = P.blush, ...p }: S & { color?: string }) {
  return (
    <svg viewBox="0 0 24 32" aria-hidden="true" {...p}>
      <path d="M12 1C22 9 24 22 12 31 0 22 2 9 12 1z" fill={color} />
      <path d="M12 6 V26" stroke="#fff" strokeOpacity=".5" strokeWidth="1" />
    </svg>
  );
}

export function FlowerHead({ x, y, s = 1, color = P.cheek, center = P.gold }: { x: number; y: number; s?: number; color?: string; center?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-11" rx="6.6" ry="9.4" fill={color} stroke={OUT} strokeWidth="1" transform={`rotate(${a})`} />
      ))}
      <circle r="5.4" fill={center} stroke={OUT} strokeWidth="1" />
    </g>
  );
}

export function Flower({ color = P.cheek, ...p }: S & { color?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...p}>
      <FlowerHead x={20} y={20} color={color} />
    </svg>
  );
}

export function Butterfly({ color = P.rose, ...p }: S & { color?: string }) {
  return (
    <svg viewBox="0 0 60 50" aria-hidden="true" {...p}>
      <g className="wing wing-l">
        <path d="M30 24C20 4 4 6 5 18c1 8 12 10 25 6z" fill={color} stroke={OUT} strokeWidth="1.2" />
        <path d="M30 26C16 28 10 42 20 44c8 1 12-8 10-18z" fill={P.gold} stroke={OUT} strokeWidth="1.2" />
      </g>
      <g className="wing wing-r">
        <path d="M30 24C40 4 56 6 55 18c-1 8-12 10-25 6z" fill={color} stroke={OUT} strokeWidth="1.2" />
        <path d="M30 26C44 28 50 42 40 44c-8 1-12-8-10-18z" fill={P.gold} stroke={OUT} strokeWidth="1.2" />
      </g>
      <rect x="28.5" y="14" width="3" height="24" rx="1.5" fill={P.wine} />
    </svg>
  );
}

export function Strawberry(p: S) {
  return (
    <svg viewBox="0 0 30 32" aria-hidden="true" {...p}>
      <path d="M15 30C5 24 2 15 6 11c3-3 7-1 9 1 2-2 6-4 9-1 4 4 1 13-9 19z" fill="#E8607A" stroke={OUT} strokeWidth="1.2" />
      <path d="M15 12 L9 6 L15 8 L21 6z" fill={P.leafDark} />
      <g fill="#FFE3A8">
        <circle cx="10" cy="17" r="1" />
        <circle cx="15" cy="21" r="1" />
        <circle cx="20" cy="17" r="1" />
        <circle cx="13" cy="25" r="1" />
        <circle cx="17" cy="14.5" r="1" />
      </g>
    </svg>
  );
}

export function GiftBoxSmall({ color = P.rose, ...p }: S & { color?: string }) {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" {...p}>
      <rect x="10" y="32" width="60" height="42" rx="6" fill={color} stroke={OUT} strokeWidth="1.6" />
      <rect x="6" y="22" width="68" height="16" rx="5" fill="#F4B9C8" stroke={OUT} strokeWidth="1.6" />
      <rect x="36" y="22" width="8" height="52" fill={P.gold} />
      <path d="M40 22 C28 4 14 12 22 20 28 24 38 22 40 22 42 22 52 24 58 20 66 12 52 4 40 22z" fill={P.gold} stroke={OUT} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/* -------------------------------------------------------- card illustrations */

function Teddy(p: S) {
  return (
    <svg viewBox="30 14 140 140" role="img" aria-label="A teddy bear face" {...p}>
      <Face animal="teddy" />
    </svg>
  );
}

function Sunflower(p: S) {
  return (
    <svg viewBox="0 0 120 150" role="img" aria-label="A little sunflower" {...p}>
      <path d="M60 70 C58 100 62 125 60 146" fill="none" stroke={P.leafDark} strokeWidth="6" strokeLinecap="round" />
      <path d="M60 112 C42 108 30 96 28 86 44 86 58 98 60 112z" fill={P.leaf} stroke={OUT} strokeWidth="1.2" />
      <path d="M60 124 C78 120 90 108 94 98 76 96 62 108 60 124z" fill={P.leaf} stroke={OUT} strokeWidth="1.2" />
      {Array.from({ length: 14 }).map((_, i) => (
        <ellipse key={i} cx="60" cy="22" rx="8.5" ry="17" fill={P.sun} stroke={OUT} strokeWidth="1" transform={`rotate(${(360 / 14) * i} 60 50)`} />
      ))}
      <circle cx="60" cy="50" r="19" fill="#7A4B3A" stroke={OUT} strokeWidth="1.4" />
      <g fill="#A06A52">
        <circle cx="53" cy="45" r="2" />
        <circle cx="64" cy="43" r="2" />
        <circle cx="68" cy="54" r="2" />
        <circle cx="56" cy="57" r="2" />
        <circle cx="60" cy="50" r="2" />
      </g>
    </svg>
  );
}

function Kitten(p: S) {
  return (
    <svg viewBox="0 0 150 100" role="img" aria-label="A sleepy kitten" {...p}>
      <ellipse cx="92" cy="70" rx="46" ry="26" fill="#F3D5B5" stroke={OUT} strokeWidth="2" />
      <path d="M134 72 q18 -2 12 -26" fill="none" stroke="#F3D5B5" strokeWidth="9" strokeLinecap="round" />
      <g transform="translate(-4 6) scale(0.54)">
        <Face animal="cat" sleepy />
      </g>
      <g fontFamily="Caveat, cursive" fontSize="16" fill={P.brown} fontWeight="600">
        <text x="98" y="30">z</text>
        <text x="110" y="20" fontSize="13">z</text>
        <text x="120" y="12" fontSize="10">z</text>
      </g>
    </svg>
  );
}

function Cocoa(p: S) {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="A warm cup of cocoa" {...p}>
      <ellipse cx="60" cy="108" rx="44" ry="8" fill="#F6DCE5" stroke={OUT} strokeWidth="1.4" />
      <path d="M86 62h8a13 13 0 0 1 0 26h-8" fill="none" stroke="#fff" strokeWidth="8" />
      <path d="M86 62h8a13 13 0 0 1 0 26h-8" fill="none" stroke={OUT} strokeWidth="1.4" />
      <path d="M24 56h64v24a30 30 0 0 1-30 30h-4a30 30 0 0 1-30-30z" fill="#fff" stroke={OUT} strokeWidth="2" />
      <ellipse cx="56" cy="56" rx="32" ry="7" fill="#7B4A3A" stroke={OUT} strokeWidth="1.4" />
      <rect x="38" y="46" width="14" height="12" rx="5" fill="#fff" stroke={OUT} strokeWidth="1.2" />
      <rect x="56" y="44" width="14" height="12" rx="5" fill="#FBE3EA" stroke={OUT} strokeWidth="1.2" />
      <path d="M42 84 q14 10 28 0" fill="none" stroke={P.rose} strokeWidth="3" strokeLinecap="round" />
      <g fill="none" stroke={P.rose} strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <path className="steam s1" d="M44 38 q-6 -8 0 -14 q6 -6 0 -14" />
        <path className="steam s2" d="M62 36 q-6 -8 0 -14 q6 -6 0 -14" />
        <path className="steam s3" d="M78 38 q-6 -8 0 -14 q6 -6 0 -14" />
      </g>
    </svg>
  );
}

function Moon(p: S) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label="A little moon" {...p}>
      <defs>
        <mask id={id}>
          <rect width="100" height="100" fill="#fff" />
          <circle cx="68" cy="38" r="34" fill="#000" />
        </mask>
      </defs>
      <circle cx="50" cy="52" r="38" fill={P.gold} mask={`url(#${id})`} />
      <path d="M31 54 q5 5 10 0" fill="none" stroke={P.wine} strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="34" cy="64" rx="6" ry="3.6" fill={P.cheek} opacity="0.7" />
      <Star width="12" height="12" x="68" y="64" color="#fff" />
      <Star width="8" height="8" x="74" y="20" color="#fff" />
    </svg>
  );
}

function Flowers(p: S) {
  return (
    <svg viewBox="0 0 140 110" role="img" aria-label="A field of flowers" {...p}>
      <path d="M0 104 Q70 90 140 104 V110 H0z" fill={P.leaf} opacity="0.7" />
      {[
        { x: 28, y: 52, h: 104, c: '#F4A9BC' },
        { x: 70, y: 34, h: 100, c: '#F6C94C' },
        { x: 112, y: 56, h: 104, c: '#E58AA2' },
        { x: 50, y: 74, h: 106, c: '#fff' },
        { x: 92, y: 78, h: 106, c: '#D9BB85' },
      ].map((f, i) => (
        <g key={i}>
          <path d={`M${f.x} ${f.h} C${f.x - 3} ${(f.h + f.y) / 2} ${f.x + 3} ${(f.h + f.y) / 2} ${f.x} ${f.y}`} fill="none" stroke={P.leafDark} strokeWidth="2.6" strokeLinecap="round" />
          <FlowerHead x={f.x} y={f.y} s={i < 3 ? 1 : 0.8} color={f.c} />
        </g>
      ))}
    </svg>
  );
}

function PocketStar(p: S) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label="A tiny star in a pocket" {...p}>
      <g className="pocket-star">
        <Star x="28" y="4" width="44" height="44" color={P.gold} />
      </g>
      <Sparkle x="72" y="10" width="14" height="14" color={P.gold} />
      <path d="M16 46h68v32a16 16 0 0 1-16 16H32a16 16 0 0 1-16-16z" fill={P.rose} stroke={OUT} strokeWidth="2" />
      <path d="M16 54h68" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M24 80 q26 10 52 0" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
}

function Song(p: S) {
  return (
    <svg viewBox="0 0 120 100" role="img" aria-label="A favorite song" {...p}>
      <g className="spin-slow" style={{ transformOrigin: '46px 54px' }}>
        <circle cx="46" cy="54" r="38" fill="#3a1f2e" stroke={OUT} strokeWidth="2" />
        <circle cx="46" cy="54" r="30" fill="none" stroke="#fff" strokeOpacity=".14" />
        <circle cx="46" cy="54" r="23" fill="none" stroke="#fff" strokeOpacity=".14" />
        <circle cx="46" cy="54" r="14" fill={P.rose} />
        <circle cx="46" cy="54" r="3" fill={P.ivory} />
        <path d="M20 40 A30 30 0 0 1 38 22" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g fill={P.wine}>
        <path d="M96 14 v40 a9 7 0 1 1 -5 -6.5 V24 l-22 5 v32 a9 7 0 1 1 -5 -6.5 V26 z" transform="translate(6 -4) scale(.72)" />
      </g>
      <Sparkle x="92" y="62" width="14" height="14" color={P.gold} />
    </svg>
  );
}

function Home(p: S) {
  const id = useId();
  return (
    <svg viewBox="0 0 120 110" role="img" aria-label="A little home with warm lights" {...p}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#FFE9B0" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFE9B0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="74" y="20" width="12" height="26" fill="#E8B5C2" stroke={OUT} strokeWidth="1.4" />
      <rect x="24" y="52" width="72" height="52" rx="4" fill={P.peach} stroke={OUT} strokeWidth="2" />
      <path d="M14 56 L60 16 L106 56 z" fill={P.rose} stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="42" cy="74" r="16" fill={`url(#${id})`} />
      <circle cx="78" cy="74" r="16" fill={`url(#${id})`} />
      <rect x="34" y="66" width="16" height="16" rx="3" fill="#FFE29A" stroke={OUT} strokeWidth="1.4" />
      <rect x="70" y="66" width="16" height="16" rx="3" fill="#FFE29A" stroke={OUT} strokeWidth="1.4" />
      <path d="M42 66 v16 M34 74 h16 M78 66 v16 M70 74 h16" stroke={OUT} strokeWidth="1.2" />
      <path d="M52 104 v-18 a8 8 0 0 1 16 0 v18z" fill={P.wine} />
      <circle cx="64" cy="96" r="1.6" fill={P.gold} />
      <Heart x="54" y="30" width="12" height="11" color="#fff" />
    </svg>
  );
}

const CARD_ART: Record<ArtKey, (p: S) => JSX.Element> = {
  teddy: Teddy,
  sunflower: Sunflower,
  kitten: Kitten,
  cocoa: Cocoa,
  moon: Moon,
  flowers: Flowers,
  pocketStar: PocketStar,
  song: Song,
  home: Home,
};

export function CardArt({ name, ...p }: S & { name: ArtKey }) {
  const Art = CARD_ART[name];
  return <Art {...p} />;
}

export { Sunflower, Moon };
