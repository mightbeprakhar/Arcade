import { useState } from 'react';
import { motion } from 'framer-motion';

export type VoteOption = { id: string; label: string; sub?: string; color: string };

/**
 * Show-of-hands counter. Presenter taps +/− per option; majority becomes the class move.
 * Ties must be broken by the presenter (tap the option's name).
 */
export function VotePanel({
  title = 'Show of hands',
  options,
  onDecide,
  decided,
  lockLabel = 'Lock in class move',
}: {
  title?: string;
  options: VoteOption[];
  onDecide: (id: string, counts: Record<string, number>) => void;
  decided?: string | null;
  lockLabel?: string;
}) {
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(options.map((o) => [o.id, 0])));
  const [tieBreak, setTieBreak] = useState<string | null>(null);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const max = Math.max(...Object.values(counts));
  const leaders = options.filter((o) => counts[o.id] === max && max > 0);
  const winner = leaders.length === 1 ? leaders[0].id : tieBreak && leaders.some((l) => l.id === tieBreak) ? tieBreak : null;
  const bump = (id: string, d: number) => setCounts((c) => ({ ...c, [id]: Math.max(0, c[id] + d) }));
  const locked = decided != null;

  return (
    <div className="card">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="label">{title}</div>
        <div className="text-base text-slate-300">
          {total} hand{total === 1 ? '' : 's'} counted
        </div>
      </div>
      <div className={`grid gap-3 ${options.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {options.map((o) => {
          const share = total ? counts[o.id] / total : 0;
          const isWinner = (locked ? decided === o.id : winner === o.id) && (locked || total > 0);
          return (
            <div
              key={o.id}
              className="relative overflow-hidden rounded-xl border-2 bg-ink-800 p-3"
              style={{ borderColor: isWinner ? o.color : '#2e3958' }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 opacity-20"
                style={{ background: o.color }}
                animate={{ width: `${share * 100}%` }}
              />
              <div className="relative">
                <button
                  className="text-left disabled:cursor-default"
                  disabled={locked || leaders.length < 2 || !leaders.some((l) => l.id === o.id)}
                  onClick={() => setTieBreak(o.id)}
                  title="Tap to break a tie"
                >
                  <div className="text-xl font-bold" style={{ color: o.color }}>
                    {o.label}
                  </div>
                  {o.sub && <div className="text-sm text-slate-300">{o.sub}</div>}
                </button>
                <div className="mt-2 flex items-center gap-2">
                  <button className="btn-ghost h-12 w-12 text-2xl" onClick={() => bump(o.id, -1)} disabled={locked} aria-label={`Remove a vote for ${o.label}`}>
                    −
                  </button>
                  <div className="min-w-[3ch] text-center font-mono text-4xl font-semibold tabular-nums">{counts[o.id]}</div>
                  <button className="btn-ghost h-12 w-12 text-2xl" onClick={() => bump(o.id, 1)} disabled={locked} aria-label={`Add a vote for ${o.label}`}>
                    +
                  </button>
                  <button className="btn-ghost h-12 px-3 text-base" onClick={() => bump(o.id, 5)} disabled={locked} aria-label={`Add five votes for ${o.label}`}>
                    +5
                  </button>
                  <span className="ml-auto font-mono text-lg text-slate-300">{total ? Math.round(share * 100) : 0}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {!locked && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="btn-primary text-lg" disabled={!winner} onClick={() => winner && onDecide(winner, counts)}>
            {lockLabel}
          </button>
          {leaders.length > 1 && !winner && (
            <span className="text-base text-neon-amber">It’s a tie — tap an option’s name to break it.</span>
          )}
          {total === 0 && <span className="text-base text-slate-400">Count hands with + / −.</span>}
        </div>
      )}
    </div>
  );
}
