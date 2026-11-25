import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { T } from './motion';

export type VoteOption = { id: string; label: string; sub?: string; color?: string };

/** Majority of the counts, or the presenter's tie-break, or null. */
export function majority(counts: Record<string, number>, tieBreak: string | null) {
  const max = Math.max(...Object.values(counts));
  if (max <= 0) return { winner: null as string | null, leaders: [] as string[] };
  const leaders = Object.keys(counts).filter((k) => counts[k] === max);
  if (leaders.length === 1) return { winner: leaders[0], leaders };
  return { winner: tieBreak && leaders.includes(tieBreak) ? tieBreak : null, leaders };
}

/**
 * Show-of-hands counter. Presenter taps + / − per option; the majority becomes the class move.
 * Ties are broken by tapping the option's name. Set showLock={false} and use onChange when a
 * parent locks several panels with one button.
 */
const PM =
  'grid h-9 w-9 place-items-center border-2 border-black bg-panel2 font-pixel text-xs text-ink hover:bg-gold hover:text-black disabled:opacity-40 disabled:hover:bg-panel2 disabled:hover:text-ink';

export function VotePanel({
  title = 'Show of hands',
  accent,
  options,
  onDecide,
  onChange,
  decided,
  lockLabel = 'Lock in class move',
  showLock = true,
}: {
  title?: string;
  options: VoteOption[];
  onDecide?: (id: string, counts: Record<string, number>) => void;
  onChange?: (winner: string | null, counts: Record<string, number>) => void;
  decided?: string | null;
  lockLabel?: string;
  showLock?: boolean;
  accent?: string;
}) {
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(options.map((o) => [o.id, 0])));
  const [tieBreak, setTieBreak] = useState<string | null>(null);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const { winner, leaders } = majority(counts, tieBreak);
  const bump = (id: string, d: number) => setCounts((c) => ({ ...c, [id]: Math.max(0, c[id] + d) }));
  const locked = decided != null;

  useEffect(() => {
    onChange?.(winner, counts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, counts]);

  return (
    <div className="border-4 border-black bg-panel p-4 shadow-hard halftone-light">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm" style={{ color: accent ?? '#f6f0dc' }}>
          {title.toUpperCase()}
        </h3>
        <span className="font-pixel text-xs text-ink-3">
          {total} HAND{total === 1 ? '' : 'S'}
        </span>
      </div>
      <div className={`grid grid-cols-1 gap-3 ${options.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {options.map((o) => {
          const share = total ? counts[o.id] / total : 0;
          const isWinner = locked ? decided === o.id : winner === o.id;
          const tied = !locked && leaders.length > 1 && leaders.includes(o.id);
          return (
            <div key={o.id} className={`relative border-4 bg-deep p-3 ${isWinner ? 'border-gold' : 'border-black'}`}>
              <button className="block w-full text-left disabled:cursor-default" disabled={!tied} onClick={() => setTieBreak(o.id)}>
                <div className={`text-2xl font-bold ${isWinner ? 'text-gold' : 'text-ink'}`}>{o.label}</div>
                {o.sub && <div className="text-sm text-ink-3">{o.sub}</div>}
                {tied && <div className="text-sm text-gold">Tap to break the tie</div>}
              </button>
              <div className="mt-3 flex items-center gap-2">
                <span className="min-w-[3ch] font-mono text-6xl leading-none">{counts[o.id]}</span>
                <span className="ml-auto flex gap-2">
                  <button className={PM} onClick={() => bump(o.id, -1)} disabled={locked} aria-label={`Remove a vote for ${o.label}`}>
                    −
                  </button>
                  <button className={PM} onClick={() => bump(o.id, 1)} disabled={locked} aria-label={`Add a vote for ${o.label}`}>
                    +
                  </button>
                  <button className={`${PM} w-auto px-2`} onClick={() => bump(o.id, 5)} disabled={locked} aria-label={`Add five votes for ${o.label}`}>
                    +5
                  </button>
                </span>
              </div>
              <div className="mt-3 h-3 border-2 border-black bg-panel2">
                <motion.div className="h-full bg-gold" initial={false} animate={{ width: `${share * 100}%` }} transition={T} />
              </div>
            </div>
          );
        })}
      </div>
      {!locked && showLock && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button className="btn-primary" disabled={!winner} onClick={() => winner && onDecide?.(winner, counts)}>
            {lockLabel.toUpperCase()}
          </button>
          {leaders.length > 1 && !winner && <span className="text-lg text-gold">Tie! Tap an option’s name to break it.</span>}
          {total === 0 && <span className="text-lg text-ink-3">Count hands with + and −.</span>}
        </div>
      )}
    </div>
  );
}
