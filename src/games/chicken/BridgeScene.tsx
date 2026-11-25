import { motion } from 'framer-motion';
import type { Move } from '../../engine/chicken';
import { SpriteG } from '../../components/pixel/Sprite';
import { C, car, truck } from '../../components/pixel/sprites';

export type ScenePhase = 'idle' | 'approach' | 'resolve';

/* Scene is drawn in "pixel units": 360 × 150, scaled up crisply. */
const W = 360;
const H = 150;
const LANE_Y = 96; // car top in the lane
const STARS = Array.from({ length: 46 }, (_, i) => ({ x: (i * 53) % W, y: (i * 29) % 60, b: i % 3 === 0 }));
const HILLS = Array.from({ length: 30 }, (_, i) => 8 + ((i * 7) % 14));

/**
 * Pixel-art single-lane bridge at midnight. Row driver (A / Truck, blue) from the left, column
 * driver (B, red) from the right. Swerve = veer onto the railing and stop. Both straight = crash.
 * Nothing moves until the class locks in its votes.
 */
export function BridgeScene({ phase, a, b, truck: isTruck }: { phase: ScenePhase; a: Move | null; b: Move | null; truck: boolean }) {
  const A = isTruck ? truck(C.blue, C.blueD) : car(C.blue, C.blueD);
  const B = car(C.red, C.redD);
  const aw = isTruck ? 29 : 22;
  const crash = phase === 'resolve' && a === 1 && b === 1;

  const posA = () => {
    if (phase === 'idle') return { x: 8, y: LANE_Y };
    if (phase === 'approach') return { x: 112 - aw, y: LANE_Y };
    if (a === 0) return { x: 140 - aw, y: LANE_Y - 18 };
    if (b === 1) return { x: 180 - aw, y: LANE_Y };
    return { x: W + 10, y: LANE_Y };
  };
  const posB = () => {
    if (phase === 'idle') return { x: W - 30, y: LANE_Y };
    if (phase === 'approach') return { x: 248, y: LANE_Y };
    if (b === 0) return { x: 220, y: LANE_Y + 18 };
    if (a === 1) return { x: 180, y: LANE_Y };
    return { x: -40, y: LANE_Y };
  };
  const t = { duration: phase === 'approach' ? 1.5 : 0.9, ease: phase === 'approach' ? 'easeIn' : 'easeOut' } as const;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pixel block h-auto w-full" role="img" aria-label="Two vehicles race toward each other on a one-lane bridge at night">
      <rect width={W} height={H} fill="#241f52" />
      {STARS.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.b ? 2 : 1} height={s.b ? 2 : 1} fill="#fff4dc" opacity={s.b ? 0.9 : 0.5} />
      ))}
      <path d="M304 12h8v2h2v2h2v8h-2v2h-2v2h-8v-2h-2v-2h-2v-8h2v-2h2z" fill="#fff4dc" />
      <path d="M306 16h3v3h-3zM310 21h2v2h-2z" fill="#e6dcc0" />
      {HILLS.map((h, i) => (
        <rect key={i} x={i * 12} y={78 - h} width={12} height={h} fill="#1a1640" />
      ))}
      <rect y={78} width={W} height={H - 78} fill="#173a63" />
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={(i * 37) % W} y={126 + ((i * 11) % 20)} width={6 + (i % 3) * 4} height={1} fill="#2d6aa0" />
      ))}
      {/* bridge */}
      <rect y={84} width={W} height={4} fill="#8a84b8" />
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={i * 12 + 4} y={78} width={2} height={6} fill="#8a84b8" />
      ))}
      <rect y={88} width={W} height={26} fill="#3a3a52" />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={i * 16 + 4} y={100} width={8} height={2} fill="#ffcc4d" />
      ))}
      <rect y={114} width={W} height={4} fill="#8a84b8" />
      {[20, 90, 160, 230, 300].map((x) => (
        <rect key={x} x={x} y={118} width={8} height={32} fill="#2b2659" />
      ))}

      <motion.g initial={false} animate={posA()} transition={t}>
        <SpriteG map={A.map} pal={A.pal} px={1} />
      </motion.g>
      <motion.g initial={false} animate={posB()} transition={t}>
        <SpriteG map={B.map} pal={B.pal} px={1} flip />
      </motion.g>

      {phase === 'resolve' && a === 0 && <Dust x={140} y={LANE_Y - 8} />}
      {phase === 'resolve' && b === 0 && <Dust x={226} y={LANE_Y + 26} />}
      {crash && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.15 }}>
          {[
            [-14, -10, '#ef5a4b'],
            [10, -14, '#ffcc4d'],
            [-6, 10, '#ffcc4d'],
            [14, 6, '#ef5a4b'],
            [0, -20, '#fff4dc'],
            [-20, 2, '#fff4dc'],
            [20, -4, '#fff4dc'],
          ].map(([dx, dy, c], i) => (
            <motion.rect
              key={i}
              width={4}
              height={4}
              fill={c as string}
              initial={{ x: 178, y: 100 }}
              animate={{ x: 178 + (dx as number) * 1.6, y: 100 + (dy as number) * 1.6 }}
              transition={{ delay: 0.75, duration: 0.5, ease: 'easeOut' }}
            />
          ))}
        </motion.g>
      )}
    </svg>
  );
}

function Dust({ x, y }: { x: number; y: number }) {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ delay: 0.5, duration: 1.2 }}>
      {[0, 6, 12].map((d, i) => (
        <rect key={i} x={x - d} y={y + (i % 2) * 3} width={4 + i} height={4 + i} fill="#d4cdee" />
      ))}
    </motion.g>
  );
}
