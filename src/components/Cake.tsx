import { P } from '../palette';
import { Strawberry } from './art';

const OUT = P.outline;
const CANDLES = [96, 130, 164];
const BERRIES = [76, 113, 147, 184];

export function Cake({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 260 250" className="cake-svg" role="img" aria-label={lit ? 'A birthday cake with lit candles' : 'A birthday cake with the candles blown out'}>
      {/* plate */}
      <ellipse cx="130" cy="218" rx="120" ry="18" fill="#fff" stroke={OUT} strokeWidth="1.6" />
      <ellipse cx="130" cy="215" rx="100" ry="11" fill="#FBEFF3" />

      {/* bottom tier */}
      <rect x="30" y="132" width="200" height="82" rx="12" fill="#F9D6E1" stroke={OUT} strokeWidth="2" />
      <path d={`M30 132 H230 V146 ${'q-10 18 -20 0 '.repeat(10)} Z`} fill="#fff" stroke={OUT} strokeWidth="1.4" strokeLinejoin="round" />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={52 + i * 22} cy={188} r="4.2" fill={i % 2 ? P.gold : P.rose} />
      ))}
      <path d="M36 204 q94 12 188 0" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="2.4" strokeDasharray="1 7" strokeLinecap="round" />

      {/* top tier */}
      <rect x="62" y="86" width="136" height="60" rx="12" fill="#FCE8EE" stroke={OUT} strokeWidth="2" />
      <path d={`M62 86 H198 V98 ${'q-8.5 16 -17 0 '.repeat(8)} Z`} fill="#fff" stroke={OUT} strokeWidth="1.4" strokeLinejoin="round" />
      <g fill={P.rose}>
        <circle cx="84" cy="126" r="3.4" />
        <circle cx="108" cy="130" r="3.4" />
        <circle cx="132" cy="126" r="3.4" />
        <circle cx="156" cy="130" r="3.4" />
        <circle cx="178" cy="126" r="3.4" />
      </g>
      <g stroke={P.gold} strokeWidth="3" strokeLinecap="round">
        <path d="M94 114 l5 -3" />
        <path d="M120 116 l5 3" />
        <path d="M146 114 l5 -3" />
        <path d="M170 116 l5 3" />
      </g>

      {/* strawberries */}
      {BERRIES.map((x) => (
        <Strawberry key={x} x={x - 11} y={66} width="22" height="23" />
      ))}

      {/* candles */}
      {CANDLES.map((x, i) => (
        <g key={x}>
          <rect x={x - 5} y="50" width="10" height="40" rx="3" fill={i === 1 ? '#F6DCE5' : '#fff'} stroke={OUT} strokeWidth="1.4" />
          <path d={`M${x - 5} 60 l10 5 M${x - 5} 70 l10 5 M${x - 5} 80 l10 5`} stroke={i === 1 ? P.rose : P.gold} strokeWidth="2.4" />
          <path d={`M${x} 50 v-6`} stroke={P.wine} strokeWidth="2" strokeLinecap="round" />
          <g transform={`translate(${x} 42)`}>
            <g className={`flame ${lit ? 'is-lit' : 'is-out'}`}>
              <circle r="15" cy="-8" fill="#FFE29A" opacity="0.3" className="flame-glow" />
              <path d="M0 -22 C7 -13 8 -6 0 0 C-8 -6 -7 -13 0 -22z" fill="#F7A74B" />
              <path d="M0 -15 C3.6 -10 4 -6 0 -2.4 C-4 -6 -3.6 -10 0 -15z" fill="#FFE9A0" />
            </g>
            {!lit && (
              <path className="smoke" d="M0 -4 q-5 -8 0 -14 q5 -6 0 -14" fill="none" stroke="#C9B8C0" strokeWidth="2.4" strokeLinecap="round" />
            )}
          </g>
        </g>
      ))}
    </svg>
  );
}
