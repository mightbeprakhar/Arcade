import type { CSSProperties } from 'react';

/* Background artwork for the arcade floor, all drawn in code. */

type Shape = { kind: 'star' | 'ring' | 'L' | 'Z'; x: string; y: string; size: number; color: string; delay: number; rot: number };
const SHAPES: Shape[] = [
  { kind: 'star', x: '6%', y: '10%', size: 5, color: '#fff4dc', delay: 0, rot: 0 },
  { kind: 'ring', x: '12%', y: '34%', size: 5, color: '#fff4dc', delay: 2, rot: 0 },
  { kind: 'L', x: '4%', y: '58%', size: 6, color: '#ffcc4d', delay: 1, rot: -10 },
  { kind: 'star', x: '90%', y: '12%', size: 4, color: '#fff4dc', delay: 3, rot: 0 },
  { kind: 'Z', x: '86%', y: '44%', size: 6, color: '#ffcc4d', delay: 4, rot: 12 },
  { kind: 'ring', x: '94%', y: '70%', size: 5, color: '#fff4dc', delay: 1.5, rot: 0 },
  { kind: 'star', x: '48%', y: '4%', size: 3, color: '#47c9a8', delay: 5, rot: 0 },
  { kind: 'star', x: '72%', y: '28%', size: 3, color: '#f59ac1', delay: 2.5, rot: 0 },
];
const MAPS: Record<Shape['kind'], string[]> = {
  star: ['..X..', '..X..', 'XXXXX', '.XXX.', 'X...X'],
  ring: ['.XXX.', 'X...X', 'X...X', 'X...X', '.XXX.'],
  L: ['X..', 'X..', 'XXX'],
  Z: ['XX.', '.XX'],
};

function PixelShape({ s }: { s: Shape }) {
  const map = MAPS[s.kind];
  const w = map[0].length;
  return (
    <svg
      className="pixel float-slow absolute hidden opacity-70 sm:block"
      style={{ left: s.x, top: s.y, animationDelay: `${s.delay}s`, ['--r' as string]: `${s.rot}deg` } as CSSProperties}
      width={w * s.size * (s.kind === 'L' || s.kind === 'Z' ? 4 : 2)}
      height={map.length * s.size * (s.kind === 'L' || s.kind === 'Z' ? 4 : 2)}
      viewBox={`0 0 ${w} ${map.length}`}
      aria-hidden
    >
      {map.flatMap((row, y) => [...row].map((c, x) => (c === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={s.color} /> : null)))}
    </svg>
  );
}

/** Floating pixel stars, rings and block pieces, plus the purple glow along the bottom. */
export function BackgroundFx() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 60 }, (_, i) => (
        <span key={i} className="absolute bg-cream" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, width: i % 5 ? 2 : 4, height: i % 5 ? 2 : 4, opacity: 0.2 + (i % 4) * 0.12 }} />
      ))}
      {SHAPES.map((s, i) => (
        <PixelShape key={i} s={s} />
      ))}
      <div className="floor-glow absolute inset-x-0 bottom-0 h-72" />
    </div>
  );
}

/*
 * Fairy lights: strands that hang in loops from hooks along the top of the wall,
 * warm bulbs with a soft glow, a few twinkling (not under reduced motion; see .bulb-twinkle).
 * Drawn in a 1200 × 130 box and cropped at the sides on narrow screens, so bulbs stay round.
 */
type Swag = { x1: number; x2: number; y1: number; y2: number; sag: number };
const SWAGS: Swag[] = [
  { x1: -20, x2: 210, y1: 6, y2: 22, sag: 70 },
  { x1: 210, x2: 430, y1: 22, y2: 8, sag: 62 },
  { x1: 770, x2: 990, y1: 8, y2: 22, sag: 62 },
  { x1: 990, x2: 1220, y1: 22, y2: 6, sag: 70 },
];
/** Point on the quadratic curve of a hanging strand, t in 0…1. */
function swagPoint(s: Swag, t: number) {
  const cx = (s.x1 + s.x2) / 2;
  const cy = Math.max(s.y1, s.y2) + s.sag * 2 - (s.y1 + s.y2) / 2;
  const u = 1 - t;
  return { x: u * u * s.x1 + 2 * u * t * cx + t * t * s.x2, y: u * u * s.y1 + 2 * u * t * cy + t * t * s.y2 };
}

export function StringLights() {
  const bulbs = SWAGS.flatMap((s, si) =>
    Array.from({ length: 11 }, (_, i) => {
      const t = (i + 0.5) / 11;
      return { ...swagPoint(s, t), key: `${si}-${i}`, twinkle: (si * 11 + i) % 5 === 0, delay: ((si * 7 + i * 3) % 10) / 4 };
    }),
  );
  return (
    <svg className="pointer-events-none absolute inset-x-0 top-0 h-[130px] w-full" viewBox="0 0 1200 130" preserveAspectRatio="xMidYMin slice" aria-hidden>
      <defs>
        <radialGradient id="bulb-glow">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#ffcc4d" stopOpacity="0.25" />
          <stop offset="1" stopColor="#ffcc4d" stopOpacity="0" />
        </radialGradient>
      </defs>
      {SWAGS.map((s, i) => {
        const cx = (s.x1 + s.x2) / 2;
        const cy = Math.max(s.y1, s.y2) + s.sag * 2 - (s.y1 + s.y2) / 2;
        return <path key={i} d={`M${s.x1} ${s.y1} Q${cx} ${cy} ${s.x2} ${s.y2}`} fill="none" stroke="#0f0d22" strokeWidth="2" />;
      })}
      {/* hooks */}
      {[210, 430, 770, 990].map((x) => (
        <rect key={x} x={x - 3} y={x === 430 || x === 770 ? 4 : 18} width="6" height="6" fill="#0f0d22" />
      ))}
      {bulbs.map((b) => (
        <g key={b.key} className={b.twinkle ? 'bulb-twinkle' : undefined} style={b.twinkle ? { animationDelay: `${b.delay}s` } : undefined}>
          <circle cx={b.x} cy={b.y + 9} r="16" fill="url(#bulb-glow)" />
          <rect x={b.x - 2.5} y={b.y} width="5" height="5" rx="1" fill="#0f0d22" />
          <ellipse cx={b.x} cy={b.y + 9.5} rx="4.5" ry="5.5" fill="#fff4dc" stroke="#0f0d22" strokeWidth="1.2" />
          <ellipse cx={b.x - 1.4} cy={b.y + 8} rx="1.3" ry="1.8" fill="#ffffff" />
        </g>
      ))}
    </svg>
  );
}

/** Neon "OPEN" sign in a pixel frame. */
export function NeonOpen() {
  return (
    <div className="border-4 border-[#ff4fd8] bg-[#1a0b3a] px-4 py-1" style={{ boxShadow: '0 0 12px #ff4fd8, inset 0 0 8px #c04dff' }}>
      <span className="neon font-pixel text-lg text-[#ffd6f6]">OPEN</span>
    </div>
  );
}

/** Tilted framed poster with two pixel dice, like the wall art in an arcade. */
export function DicePoster({ flip = false }: { flip?: boolean }) {
  const pips = flip ? [[2, 2], [6, 6], [2, 6], [6, 2]] : [[4, 4], [2, 2], [6, 6]];
  return (
    <svg className="pixel" width="72" height="72" viewBox="0 0 18 18" aria-hidden>
      <rect x="0" y="0" width="18" height="18" fill="#0f0d22" />
      <rect x="1" y="1" width="16" height="16" fill="#3a3378" />
      <rect x="4" y="4" width="10" height="10" fill="#0f0d22" />
      <rect x="5" y="5" width="8" height="8" fill="#fff4dc" />
      {pips.map(([x, y], i) => (
        <rect key={i} x={5 + x - 1} y={5 + y - 1} width="1.5" height="1.5" fill="#0f0d22" />
      ))}
    </svg>
  );
}
