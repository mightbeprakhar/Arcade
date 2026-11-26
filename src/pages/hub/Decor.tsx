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

/** A sagging cable of coloured pixel bulbs across the top of the wall. */
export function StringLights() {
  const n = 28;
  const colours = ['#ffcc4d', '#ff4fd8', '#5ef0ff', '#47c9a8', '#fff4dc'];
  const pts = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return { x: t * 1000, y: 14 + Math.sin(t * Math.PI * 3) ** 2 * 26 };
  });
  return (
    <svg className="absolute left-0 top-0 h-16 w-full min-w-[900px]" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#0f0d22" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      {pts.map((p, i) => (
        <rect key={i} x={p.x - 5} y={p.y + 2} width="10" height="12" fill={colours[i % colours.length]} stroke="#0f0d22" strokeWidth="2" vectorEffect="non-scaling-stroke" />
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
