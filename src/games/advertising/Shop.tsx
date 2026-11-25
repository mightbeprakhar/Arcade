import { motion } from 'framer-motion';

/** Pixel-art coffee shop (64 × 60 pixel units). `ad` pops a banner on the roof. */
export function PixelShop({ name, color, ad, px = 4 }: { name: string; color: string; ad: boolean; px?: number }) {
  const K = '#0f0d22';
  const W = '#fff4dc';
  const stripes = Array.from({ length: 16 }, (_, i) => i);
  return (
    <svg className="pixel h-auto max-w-full" width={64 * px} height={60 * px} viewBox="0 0 64 60" role="img" aria-label={`${name}${ad ? ', running an ad' : ''}`}>
      {/* sign board */}
      <rect x={4} y={10} width={56} height={9} fill={K} />
      <rect x={5} y={11} width={54} height={7} fill={color} />
      <text x={32} y={16.6} textAnchor="middle" fontSize={4.2} fill={K} fontFamily="'Press Start 2P', monospace">
        {name.toUpperCase()}
      </text>
      {/* wall */}
      <rect x={4} y={19} width={56} height={41} fill={K} />
      <rect x={5} y={20} width={54} height={40} fill={W} />
      {/* awning */}
      {stripes.map((i) => (
        <rect key={i} x={4 + i * 3.5} y={20} width={3.5} height={6} fill={i % 2 ? W : color} />
      ))}
      {stripes.map((i) => (
        <rect key={`s${i}`} x={4 + i * 3.5 + 0.75} y={26} width={2} height={1} fill={i % 2 ? W : color} />
      ))}
      <rect x={4} y={19} width={56} height={1} fill={K} />
      {/* window with a cup */}
      <rect x={8} y={31} width={26} height={18} fill={K} />
      <rect x={9} y={32} width={24} height={16} fill="#bfe6ff" />
      <rect x={16} y={38} width={8} height={7} fill={K} />
      <rect x={17} y={39} width={6} height={5} fill="#a0612f" />
      <rect x={24} y={40} width={2} height={1} fill={K} />
      <rect x={25} y={40} width={1} height={3} fill={K} />
      <rect x={18} y={35} width={1} height={2} fill={W} />
      <rect x={21} y={34} width={1} height={3} fill={W} />
      {/* door */}
      <rect x={40} y={31} width={16} height={29} fill={K} />
      <rect x={41} y={32} width={14} height={28} fill={color} />
      <rect x={43} y={34} width={10} height={10} fill="#bfe6ff" />
      <rect x={51} y={47} width={2} height={2} fill={K} />
      {/* ad banner */}
      <motion.g initial={false} animate={{ opacity: ad ? 1 : 0, y: ad ? 0 : 6 }} transition={{ type: 'spring', stiffness: 400, damping: 16 }}>
        <rect x={14} y={6} width={1} height={4} fill={K} />
        <rect x={49} y={6} width={1} height={4} fill={K} />
        <rect x={8} y={0} width={48} height={7} fill={K} />
        <rect x={9} y={1} width={46} height={5} fill="#ffcc4d" />
        <text x={32} y={5} textAnchor="middle" fontSize={3.4} fill={K} fontFamily="'Press Start 2P', monospace">
          AD: 2-FOR-1!
        </text>
      </motion.g>
    </svg>
  );
}
