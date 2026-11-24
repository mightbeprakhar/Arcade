import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl border border-ink-600 bg-ink-800 px-4 py-3 text-left transition hover:bg-ink-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-neon-cyan/50"
    >
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition ${checked ? 'bg-neon-lime' : 'bg-ink-600'}`}>
        <motion.span className="absolute top-1 h-6 w-6 rounded-full bg-white" animate={{ left: checked ? 28 : 4 }} />
      </span>
      <span>
        <span className="block text-lg font-semibold">{label}</span>
        {sub && <span className="block text-sm text-slate-300">{sub}</span>}
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
    <label className="block rounded-xl border border-ink-600 bg-ink-800 px-4 py-3">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-lg font-semibold">{label}</span>
        <span className="font-mono text-xl font-semibold text-neon-cyan">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Stat({ label, value, sub, color = '#e2e8f0' }: { label: string; value: ReactNode; sub?: ReactNode; color?: string }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-800 px-4 py-3">
      <div className="label">{label}</div>
      <div className="mt-1 font-mono text-3xl font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-base text-slate-300">{sub}</div>}
    </div>
  );
}

/** Narrative caption box used in Story stages. */
export function Caption({ children, speaker, color = '#22d3ee' }: { children: ReactNode; speaker?: string; color?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-l-4 bg-ink-800/90 px-5 py-4 text-xl leading-relaxed" style={{ borderColor: color }}>
      {speaker && (
        <div className="mb-1 text-sm font-bold uppercase tracking-wider" style={{ color }}>
          {speaker}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function SectionTitle({ kicker, title, children, color }: { kicker: string; title: string; children?: ReactNode; color: string }) {
  return (
    <div className="mb-5">
      <div className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color }}>
        {kicker}
      </div>
      <h2 className="mt-1 text-3xl font-bold sm:text-4xl">{title}</h2>
      {children && <p className="mt-2 max-w-3xl text-lg text-slate-300">{children}</p>}
    </div>
  );
}

export function Takeaways({ items, color }: { items: ReactNode[]; color: string }) {
  return (
    <ol className="space-y-3">
      {items.map((t, i) => (
        <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-4 rounded-xl border border-ink-700 bg-ink-800 p-4 text-lg">
          <span className="font-mono text-2xl font-bold" style={{ color }}>
            {i + 1}
          </span>
          <span>{t}</span>
        </motion.li>
      ))}
    </ol>
  );
}

/** Humans-vs-Nash summary card shown in each Debrief. */
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
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border-2 border-neon-amber/60 bg-ink-800 p-4">
        <div className="label text-neon-amber">The class</div>
        <div className="mt-1 text-2xl font-bold">{classChoice}</div>
        <div className="mt-2 font-mono text-3xl text-neon-amber">
          {classPayoff} <span className="text-base text-slate-400">{unit}</span>
        </div>
      </div>
      <div className="rounded-2xl border-2 border-neon-lime/60 bg-ink-800 p-4">
        <div className="label text-neon-lime">Nash says</div>
        <div className="mt-1 text-2xl font-bold">{nashPrediction}</div>
        <div className="mt-2 font-mono text-3xl text-neon-lime">
          {nashPayoff} <span className="text-base text-slate-400">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export const rupee = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
export const signed = (n: number, d = 2) => {
  const s = Number.isInteger(n) ? String(n) : n.toFixed(d).replace(/\.?0+$/, '');
  return n > 0 ? `+${s}` : s;
};
