import type { ReactNode } from 'react';
import type { Animal } from '../content';
import { P } from '../palette';

const OUT = P.outline;
const INK = '#3a1f2e';

const FUR: Record<Animal, { fur: string; inner: string; muzzle: string }> = {
  teddy: { fur: '#C99A7E', inner: '#E9BFA9', muzzle: '#F6E2D2' },
  bear: { fur: '#B98266', inner: '#E3B6A0', muzzle: '#F2D9C6' },
  bunny: { fur: '#FFF6F1', inner: '#F6C6D2', muzzle: '#FFFFFF' },
  cat: { fur: '#F3D5B5', inner: '#F6B9C6', muzzle: '#FFF4E8' },
  dog: { fur: '#EBCBA3', inner: '#C99A6C', muzzle: '#FFF3E2' },
};

export const animalName: Record<Animal, string> = {
  teddy: 'teddy bear',
  bear: 'little bear',
  bunny: 'bunny',
  cat: 'kitten',
  dog: 'puppy',
};

/** The head only. Drawn around the point (100, 85). */
export function Face({
  animal,
  sleepy = false,
  blink = true,
}: {
  animal: Animal;
  sleepy?: boolean;
  blink?: boolean;
}) {
  const c = FUR[animal];
  return (
    <g>
      {animal === 'bunny' && (
        <>
          <g transform="rotate(-12 78 52)">
            <ellipse cx="78" cy="26" rx="13" ry="34" fill={c.fur} stroke={OUT} strokeWidth="2" />
            <ellipse cx="78" cy="28" rx="6.5" ry="24" fill={c.inner} />
          </g>
          <g transform="rotate(12 122 52)">
            <ellipse cx="122" cy="26" rx="13" ry="34" fill={c.fur} stroke={OUT} strokeWidth="2" />
            <ellipse cx="122" cy="28" rx="6.5" ry="24" fill={c.inner} />
          </g>
        </>
      )}
      {animal === 'dog' && (
        <>
          <ellipse cx="54" cy="78" rx="15" ry="31" fill={c.inner} stroke={OUT} strokeWidth="2" transform="rotate(14 54 78)" />
          <ellipse cx="146" cy="78" rx="15" ry="31" fill={c.inner} stroke={OUT} strokeWidth="2" transform="rotate(-14 146 78)" />
        </>
      )}
      {animal === 'cat' && (
        <>
          <path d="M58 64 L54 22 L90 46 Z" fill={c.fur} stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
          <path d="M64 57 L62 35 L80 47 Z" fill={c.inner} />
          <path d="M142 64 L146 22 L110 46 Z" fill={c.fur} stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
          <path d="M136 57 L138 35 L120 47 Z" fill={c.inner} />
        </>
      )}
      {(animal === 'teddy' || animal === 'bear') && (
        <>
          <circle cx="62" cy="50" r="17" fill={c.fur} stroke={OUT} strokeWidth="2" />
          <circle cx="62" cy="51" r="9" fill={c.inner} />
          <circle cx="138" cy="50" r="17" fill={c.fur} stroke={OUT} strokeWidth="2" />
          <circle cx="138" cy="51" r="9" fill={c.inner} />
        </>
      )}

      <circle cx="100" cy="85" r="48" fill={c.fur} stroke={OUT} strokeWidth="2" />
      <ellipse cx="100" cy="102" rx="21" ry="16" fill={c.muzzle} />

      {/* eyes */}
      {sleepy ? (
        <g fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round">
          <path d="M71 82 q9 8 18 0" />
          <path d="M111 82 q9 8 18 0" />
        </g>
      ) : (
        <g className={blink ? 'blink' : undefined}>
          <circle cx="80" cy="80" r="5.2" fill={INK} />
          <circle cx="120" cy="80" r="5.2" fill={INK} />
          <circle cx="81.9" cy="78" r="1.9" fill="#fff" />
          <circle cx="121.9" cy="78" r="1.9" fill="#fff" />
        </g>
      )}

      {/* cheeks */}
      <ellipse cx="66" cy="99" rx="9" ry="5.5" fill={P.cheek} opacity="0.6" />
      <ellipse cx="134" cy="99" rx="9" ry="5.5" fill={P.cheek} opacity="0.6" />

      {/* nose */}
      {animal === 'teddy' || animal === 'bear' ? (
        <ellipse cx="100" cy="94" rx="6.4" ry="4.4" fill={P.wine} />
      ) : animal === 'dog' ? (
        <ellipse cx="100" cy="93" rx="7.5" ry="5.2" fill={INK} />
      ) : animal === 'cat' ? (
        <path d="M94.5 92.5 h11 l-5.5 6.5 z" fill="#E58AA2" stroke="#E58AA2" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <ellipse cx="100" cy="93.5" rx="5" ry="3.6" fill="#E58AA2" />
      )}

      {/* mouth */}
      <path
        d="M100 98.5 v4 M100 102.5 q-6 6 -12 1 M100 102.5 q6 6 12 1"
        fill="none"
        stroke={P.wine}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {animal === 'dog' && <path d="M95 107 q5 11 10 0 z" fill="#F08FA3" stroke={OUT} strokeWidth="1.2" strokeLinejoin="round" />}

      {animal === 'cat' && (
        <g stroke={P.brown} strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
          <path d="M60 98 l-24 -5" />
          <path d="M60 104 l-24 4" />
          <path d="M140 98 l24 -5" />
          <path d="M140 104 l24 4" />
        </g>
      )}
    </g>
  );
}

export type Pose = 'hold' | 'wave' | 'cheer' | 'stand';

export function Mascot({
  animal,
  pose = 'stand',
  children,
  className,
  label,
}: {
  animal: Animal;
  pose?: Pose;
  /** A held item, drawn around (0, 0) which sits on the belly */
  children?: ReactNode;
  className?: string;
  label?: string;
}) {
  const c = FUR[animal];
  const arm = (cx: number, cy: number, rot: number) => (
    <ellipse
      cx={cx}
      cy={cy}
      rx="12"
      ry="25"
      fill={c.fur}
      stroke={OUT}
      strokeWidth="2"
      transform={`rotate(${rot} ${cx} ${cy})`}
    />
  );
  return (
    <svg
      viewBox="0 0 200 232"
      className={className}
      role="img"
      aria-label={label ?? `A cute ${animalName[animal]}`}
    >
      {/* feet */}
      <ellipse cx="76" cy="214" rx="19" ry="12" fill={c.fur} stroke={OUT} strokeWidth="2" />
      <ellipse cx="124" cy="214" rx="19" ry="12" fill={c.fur} stroke={OUT} strokeWidth="2" />
      <ellipse cx="76" cy="216" rx="9" ry="5.5" fill={c.inner} />
      <ellipse cx="124" cy="216" rx="9" ry="5.5" fill={c.inner} />

      {animal === 'dog' && (
        <path d="M138 198 q26 -2 24 -26" fill="none" stroke={c.fur} strokeWidth="12" strokeLinecap="round" />
      )}
      {animal === 'cat' && (
        <path d="M138 196 q36 2 30 -34" fill="none" stroke={c.fur} strokeWidth="13" strokeLinecap="round" />
      )}
      {animal === 'bunny' && <circle cx="140" cy="204" r="10" fill="#fff" stroke={OUT} strokeWidth="2" />}

      {/* body */}
      <ellipse cx="100" cy="170" rx="41" ry="46" fill={c.fur} stroke={OUT} strokeWidth="2" />
      <ellipse cx="100" cy="178" rx="25" ry="30" fill={c.muzzle} />

      {/* arms */}
      {pose === 'stand' && (
        <>
          {arm(60, 170, 14)}
          {arm(140, 170, -14)}
        </>
      )}
      {pose === 'hold' && (
        <>
          {arm(68, 168, -38)}
          {arm(132, 168, 38)}
        </>
      )}
      {pose === 'wave' && (
        <>
          {arm(60, 172, 14)}
          <g className="arm-wave">{arm(158, 134, 32)}</g>
        </>
      )}
      {pose === 'cheer' && (
        <>
          {arm(52, 132, -32)}
          {arm(148, 132, 32)}
        </>
      )}

      {/* held item, belly centered */}
      {children && <g transform="translate(100 176)">{children}</g>}

      {/* head and bow */}
      <Face animal={animal} />
      <g>
        <path d="M100 136 L80 124 Q75 136 80 148 Z" fill={P.rose} stroke={OUT} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M100 136 L120 124 Q125 136 120 148 Z" fill={P.rose} stroke={OUT} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="100" cy="136" r="5.5" fill={P.gold} stroke={OUT} strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/* ---------- things the mascot can hold ---------- */

export function HeldEnvelope() {
  return (
    <g>
      <rect x="-24" y="-16" width="48" height="32" rx="4" fill="#FFF9F3" stroke={OUT} strokeWidth="1.6" />
      <path d="M-24 -16 L0 4 L24 -16" fill="#F6DCE5" stroke={OUT} strokeWidth="1.6" strokeLinejoin="round" />
      <path
        d="M0 14c-8-6-9-10-6-13 2-1.8 5-.6 6 1.4 1-2 4-3.2 6-1.4 3 3 2 7-6 13z"
        fill={P.rose}
        transform="translate(0 -6) scale(.95)"
      />
    </g>
  );
}

export function HeldBouquet() {
  return (
    <g transform="translate(0 -6)">
      <path d="M-4 22 L-14 -4 M0 22 L0 -10 M4 22 L14 -4" stroke={P.leafDark} strokeWidth="3" strokeLinecap="round" />
      <path d="M-18 24 L18 24 L8 8 L-8 8 Z" fill="#FBEFF3" stroke={OUT} strokeWidth="1.4" strokeLinejoin="round" />
      {[
        { x: -16, y: -8, color: '#F4A9BC' },
        { x: 0, y: -16, color: '#F6C94C' },
        { x: 16, y: -8, color: '#E58AA2' },
        { x: -6, y: -2, color: '#fff' },
        { x: 8, y: -2, color: '#D9BB85' },
      ].map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-5" rx="3.6" ry="5" fill={f.color} stroke={OUT} strokeWidth="0.8" transform={`rotate(${a})`} />
          ))}
          <circle r="2.6" fill={P.gold} />
        </g>
      ))}
    </g>
  );
}
