import { motion } from 'framer-motion';
import type { Move } from '../../engine/chicken';

export type ScenePhase = 'idle' | 'approach' | 'resolve';

function Vehicle({ color, truck, flip }: { color: string; truck?: boolean; flip?: boolean }) {
  const w = truck ? 150 : 110;
  return (
    <g transform={flip ? `scale(-1,1)` : undefined}>
      {truck ? (
        <>
          <rect x={-w / 2} y={-30} width={95} height={50} rx={6} fill={color} />
          <rect x={-w / 2 + 98} y={-18} width={50} height={38} rx={8} fill={color} />
          <rect x={-w / 2 + 112} y={-12} width={26} height={16} rx={3} fill="#0d111c" opacity={0.7} />
        </>
      ) : (
        <>
          <rect x={-w / 2} y={-14} width={w} height={32} rx={14} fill={color} />
          <path d={`M ${-w / 4} -14 Q ${-w / 8} -36 ${w / 6} -36 Q ${w / 3} -36 ${w / 3 + 6} -14 Z`} fill={color} />
          <rect x={w / 12} y={-30} width={w / 5} height={14} rx={3} fill="#0d111c" opacity={0.6} />
        </>
      )}
      <circle cx={-w / 2 + 24} cy={20} r={11} fill="#0d111c" stroke="#94a3b8" strokeWidth={3} />
      <circle cx={w / 2 - 24} cy={20} r={11} fill="#0d111c" stroke="#94a3b8" strokeWidth={3} />
      <rect x={w / 2 - 6} y={-6} width={8} height={8} rx={2} fill="#fde68a" />
    </g>
  );
}

/**
 * Single-lane bridge. Row driver (A/Truck) enters from the left, column driver (B/Car) from the right.
 * Swerve = pull off into the ditch. Both straight = crash.
 */
export function BridgeScene({ phase, a, b, truck }: { phase: ScenePhase; a: Move | null; b: Move | null; truck: boolean }) {
  const ROAD_Y = 150;
  const crash = phase === 'resolve' && a === 1 && b === 1;
  const posA = () => {
    if (phase === 'idle') return { x: 90, y: ROAD_Y, rotate: 0 };
    if (phase === 'approach') return { x: 330, y: ROAD_Y, rotate: 0 };
    if (a === 0) return { x: 420, y: ROAD_Y + 85, rotate: 28 };
    if (b === 1) return { x: 432, y: ROAD_Y, rotate: -6 };
    return { x: 1150, y: ROAD_Y, rotate: 0 };
  };
  const posB = () => {
    if (phase === 'idle') return { x: 910, y: ROAD_Y, rotate: 0 };
    if (phase === 'approach') return { x: 670, y: ROAD_Y, rotate: 0 };
    if (b === 0) return { x: 580, y: ROAD_Y - 85, rotate: 28 };
    if (a === 1) return { x: 568, y: ROAD_Y, rotate: 6 };
    return { x: -150, y: ROAD_Y, rotate: 0 };
  };
  const dur = phase === 'approach' ? 1.6 : 1.1;
  return (
    <svg viewBox="0 0 1000 300" className="h-auto w-full" role="img" aria-label="Two vehicles approach each other on a one-lane bridge">
      <defs>
        <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0c2a4a" />
          <stop offset="1" stopColor="#07090f" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1000} height={300} fill="url(#water)" rx={18} />
      {[40, 90, 250, 275].map((y, i) => (
        <motion.path
          key={y}
          d={`M -40 ${y} q 40 -10 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`}
          stroke="#1e3a5f"
          strokeWidth={3}
          fill="none"
          animate={{ x: [0, -80] }}
          transition={{ repeat: Infinity, duration: 4 + i, ease: 'linear' }}
        />
      ))}
      {/* bridge deck */}
      <rect x={0} y={ROAD_Y - 48} width={1000} height={96} fill="#1f2937" />
      <rect x={0} y={ROAD_Y - 52} width={1000} height={6} fill="#64748b" />
      <rect x={0} y={ROAD_Y + 46} width={1000} height={6} fill="#64748b" />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={20 + i * 72} y={ROAD_Y - 3} width={36} height={6} rx={3} fill="#fbbf24" opacity={0.6} />
      ))}
      <motion.g initial={false} animate={posA()} transition={{ duration: dur, ease: phase === 'approach' ? 'easeIn' : 'easeOut' }}>
        <Vehicle color="#22d3ee" truck={truck} />
      </motion.g>
      <motion.g initial={false} animate={posB()} transition={{ duration: dur, ease: phase === 'approach' ? 'easeIn' : 'easeOut' }}>
        <Vehicle color="#f472b6" flip />
      </motion.g>
      {crash && (
        <g>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={500}
              cy={ROAD_Y}
              fill={['#f97316', '#fbbf24', '#ef4444'][i]}
              initial={{ r: 0, opacity: 0.9 }}
              animate={{ r: [0, 90 - i * 22, 120 - i * 25], opacity: [0.95, 0.8, 0] }}
              transition={{ duration: 1.4, delay: 0.95 + i * 0.08 }}
            />
          ))}
          <motion.text x={500} y={60} textAnchor="middle" fontSize={44} fontWeight={800} fill="#fecaca" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            CRASH
          </motion.text>
        </g>
      )}
    </svg>
  );
}
