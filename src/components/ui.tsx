import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { T } from './motion';

export const BLUE = '#5aa7ff'; // player A / the class
export const RED = '#ef5a4b'; // player B / the rival
export const GOLD = '#ffcc4d'; // Nash, theory, primary
export const INK = '#f6f0dc';
// Back-compat names used across games.
export const PEN = BLUE;
export const MARK = GOLD;

export function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-4 border-4 border-black bg-panel px-4 py-3 text-left shadow-hard-sm hover:bg-panel2 focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold"
    >
      <span className={`relative h-8 w-14 shrink-0 border-4 border-black ${checked ? 'bg-gold' : 'bg-deep'}`}>
        <motion.span className="absolute top-0 h-6 w-6 bg-cream" style={{ boxShadow: 'inset 0 -4px 0 #a39bc9' }} initial={false} animate={{ left: checked ? 24 : 0 }} transition={T} />
      </span>
      <span>
        <span className="block text-lg font-bold">{label}</span>
        {sub && <span className="block text-sm text-ink-3">{sub}</span>}
      </span>
    </button>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v) => String(v),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="block border-4 border-black bg-panel px-4 py-3 shadow-hard-sm">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-lg font-bold">{label}</span>
        <span className="font-mono text-3xl leading-none text-gold">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Stat({ label, value, sub, color = INK }: { label: string; value: ReactNode; sub?: ReactNode; color?: string }) {
  return (
    <div className="border-4 border-black bg-deep px-4 py-3">
      <div className="label">{label}</div>
      <div className="mt-1 font-mono text-5xl leading-none" style={{ color }}>
        {value}
      </div>
      {sub && <div className="mt-1 text-base text-ink-3">{sub}</div>}
    </div>
  );
}

/** Story narration line (comic narration box). */
export function Caption({ children, current = true }: { children: ReactNode; current?: boolean; color?: string; speaker?: string }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={T}
      className={`border-4 border-black px-4 py-3 text-xl leading-snug shadow-hard-sm ${current ? 'bg-gold text-black' : 'bg-cream text-paperink'}`}
    >
      {children}
    </motion.p>
  );
}

export function SectionTitle({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode; color?: string }) {
  return (
    <div className="mb-8">
      <span className="chip text-gold">{kicker}</span>
      <h2 className="mt-4 break-words text-xl sm:text-3xl" style={{ textShadow: '4px 4px 0 #0f0d22' }}>
        {title}
      </h2>
      {children && <p className="mt-4 max-w-3xl text-xl text-ink-2">{children}</p>}
    </div>
  );
}

export function Takeaways({ items }: { items: ReactNode[]; color?: string }) {
  return (
    <ol className="page halftone space-y-0 divide-y-4 divide-black p-0">
      {items.map((t, i) => (
        <li key={i} className="flex gap-4 px-6 py-4 text-xl">
          <span className="font-pixel text-sm text-red">{i + 1}</span>
          <span>{t}</span>
        </li>
      ))}
    </ol>
  );
}

/** Humans vs Nash: the class in blue, theory in gold. */
export function VersusCard({
  classChoice,
  classPayoff,
  nashPrediction,
  nashPayoff,
  unit,
}: {
  classChoice: string;
  classPayoff: string;
  nashPrediction: string;
  nashPayoff: string;
  unit: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="border-4 border-black bg-blue p-6 text-black shadow-hard halftone">
        <div className="font-pixel text-sm">THE CLASS</div>
        <div className="mt-3 text-2xl font-bold">{classChoice}</div>
        <div className="mt-4 font-mono text-6xl leading-none">{classPayoff}</div>
        <div className="mt-1 text-base">{unit}</div>
      </div>
      <div className="border-4 border-black bg-gold p-6 text-black shadow-hard halftone">
        <div className="font-pixel text-sm">NASH SAYS</div>
        <div className="mt-3 text-2xl font-bold">{nashPrediction}</div>
        <div className="mt-4 font-mono text-6xl leading-none">{nashPayoff}</div>
        <div className="mt-1 text-base">{unit}</div>
      </div>
    </div>
  );
}

export function Notes({ title, items }: { title: string; items: ReactNode[] }) {
  return (
    <div className="page p-6">
      <h3 className="mb-4 text-sm">{title}</h3>
      <ul className="space-y-2 text-xl">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-red">▪</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const rupee = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
/** ₹ thousands with separators, e.g. ₹1,200k. */
export const rupeeK = (n: number | string) => `₹${Math.round(Number(n)).toLocaleString('en-IN')}k`;
export const signed = (n: number, d = 2) => {
  const s = Number.isInteger(n) ? String(n) : n.toFixed(d).replace(/\.?0+$/, '');
  return n > 0 ? `+${s}` : s;
};
