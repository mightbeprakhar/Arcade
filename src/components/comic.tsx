import type { CSSProperties, ReactNode } from "react";
import type { MotionStyle } from "framer-motion";
import { motion } from 'framer-motion';
import { T } from './motion';
import { useRevealScroll } from './useReveal';

/* Comic vocabulary for the pixel world: panels, speech bubbles, narration boxes, action words. */

/** Stepped (pixel) corners via clip-path. */
const STEP = (s: number) =>
  `polygon(${s}px 0, calc(100% - ${s}px) 0, calc(100% - ${s}px) ${s}px, 100% ${s}px, 100% calc(100% - ${s}px), calc(100% - ${s}px) calc(100% - ${s}px), calc(100% - ${s}px) 100%, ${s}px 100%, ${s}px calc(100% - ${s}px), 0 calc(100% - ${s}px), 0 ${s}px, ${s}px ${s}px)`;

export function Panel({
  children,
  className = '',
  tone = 'night',
  style,
  reveal = false,
}: {
  children: ReactNode;
  className?: string;
  tone?: 'night' | 'cream' | 'gold' | 'blue' | 'red' | 'teal';
  style?: CSSProperties;
  /** Scroll into view on mount (use for panels revealed by a keypress). */
  reveal?: boolean;
}) {
  const ref = useRevealScroll<HTMLDivElement>(reveal);
  const bg = { night: 'bg-panel halftone-light', cream: 'bg-cream text-paperink halftone', gold: 'bg-gold text-black halftone', blue: 'bg-blue text-black halftone', red: 'bg-red text-black halftone', teal: 'bg-teal text-black halftone' }[tone];
  return (
    <div ref={ref} className={`reveal relative overflow-hidden border-4 border-black shadow-hard ${bg} ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Speech bubble with a pixel tail. `side` is where the speaker is. */
export function Bubble({
  children,
  side = 'left',
  tone = 'white',
  className = '',
  style,
}: {
  children: ReactNode;
  side?: 'left' | 'right' | 'bottom-left' | 'bottom-right';
  tone?: 'white' | 'gold';
  className?: string;
  style?: CSSProperties;
}) {
  const bg = tone === 'gold' ? '#ffcc4d' : '#fff4dc';
  const tailLeft = side === 'left' || side === 'bottom-left';
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={T} className={`relative inline-block ${className}`} style={style as MotionStyle}>
      <div className="relative bg-black p-1" style={{ clipPath: STEP(8) }}>
        <div className="px-4 py-3 font-sans text-xl font-semibold leading-snug text-paperink" style={{ background: bg, clipPath: STEP(6) }}>
          {children}
        </div>
      </div>
      <svg className="pixel absolute -bottom-4" style={{ [tailLeft ? 'left' : 'right']: 24 }} width="24" height="20" viewBox="0 0 6 5" aria-hidden>
        <path d={tailLeft ? 'M0 0h5v1h-1v1h-1v1h-1v1h-1v1h-1z' : 'M1 0h5v5h-1v-1h-1v-1h-1v-1h-1v-1h-1z'} fill="#0f0d22" />
        <path d={tailLeft ? 'M1 0h3v1h-1v1h-1v1h-1z' : 'M2 0h3v3h-1v-1h-1v-1h-1z'} fill={bg} />
      </svg>
    </motion.div>
  );
}

/** Yellow narration box, the comic's narrator. */
export function Narration({ children, className = '', current = true }: { children: ReactNode; className?: string; current?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={T}
      className={`border-4 border-black px-4 py-3 text-lg leading-snug shadow-hard-sm ${current ? 'bg-gold text-black' : 'bg-cream text-paperink'} ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** Big action word (CRASH!, SWERVE!) on a jagged burst. Appears with a pop when mounted. */
export function ActionWord({ text, color = '#ffcc4d', size = 56, rotate = -8, className = '' }: { text: string; color?: string; size?: number; rotate?: number; className?: string }) {
  const n = 14;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 ? 0.62 : 1;
    return `${50 + Math.cos(a) * 50 * r},${50 + Math.sin(a) * 34 * r}`;
  }).join(' ');
  return (
    <motion.div
      className={`pointer-events-none relative grid place-items-center ${className}`}
      initial={{ scale: 0.4, opacity: 0, rotate: rotate - 10 }}
      animate={{ scale: 1, opacity: 1, rotate }}
      transition={{ type: 'spring', stiffness: 400, damping: 14 }}
      style={{ width: size * text.length * 0.95 + 80, height: size * 2.6 }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <polygon points={pts} fill={color === '#ffcc4d' ? '#ef5a4b' : '#ffcc4d'} stroke="#0f0d22" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <span
        className="relative font-pixel"
        style={{ fontSize: size, color, WebkitTextStroke: `${Math.max(3, size / 10)}px #0f0d22`, paintOrder: 'stroke fill', textShadow: `${size / 12}px ${size / 12}px 0 #0f0d22` }}
      >
        {text}
      </span>
    </motion.div>
  );
}
