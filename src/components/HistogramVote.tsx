import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { majority } from './VotePanel';
import { T } from './motion';

/**
 * Show of hands over many numeric options (e.g. offers ₹0…₹10,000). Each column is a pixel bar
 * that grows with the count; the most-voted column becomes the class move (tap a column’s label to break a tie).
 */
export function HistogramVote({
  title,
  options,
  format,
  onChange,
  decided,
}: {
  title: string;
  options: number[];
  format: (v: number) => string;
  onChange: (winner: number | null, counts: Record<string, number>) => void;
  decided?: number | null;
}) {
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(options.map((o) => [String(o), 0])));
  const [tieBreak, setTieBreak] = useState<string | null>(null);
  const { winner, leaders } = majority(counts, tieBreak);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Object.values(counts));
  const locked = decided != null;
  const bump = (k: string, d: number) => !locked && setCounts((c) => ({ ...c, [k]: Math.max(0, c[k] + d) }));

  useEffect(() => {
    onChange(winner === null ? null : Number(winner), counts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, counts]);

  return (
    <div className="border-4 border-black bg-panel p-4 shadow-hard halftone-light">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm">{title.toUpperCase()}</h3>
        <span className="font-pixel text-xs text-ink-3">{total} HANDS</span>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[44rem] gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
          {options.map((o) => {
            const k = String(o);
            const isWin = locked ? decided === o : winner === k;
            const tied = !locked && leaders.length > 1 && leaders.includes(k);
            return (
              <div key={k} className="flex flex-col items-center gap-2">
                <span className="font-mono text-3xl leading-none">{counts[k]}</span>
                <div className="relative flex h-32 w-full items-end border-4 border-black bg-deep">
                  <motion.div className={`w-full ${isWin ? 'bg-gold' : 'bg-blue'}`} initial={false} animate={{ height: `${(counts[k] / max) * 100}%` }} transition={T} />
                </div>
                <button
                  className={`w-full border-2 border-black px-1 py-1 font-mono text-xl leading-none ${isWin ? 'bg-gold text-black' : tied ? 'bg-panel2 text-gold' : 'bg-panel2 text-ink'}`}
                  disabled={!tied}
                  onClick={() => setTieBreak(k)}
                  aria-label={`${format(o)}${tied ? ', tap to break tie' : ''}`}
                >
                  {format(o)}
                </button>
                <div className="flex gap-1">
                  <button className="grid h-8 w-8 place-items-center border-2 border-black bg-panel2 font-pixel text-xs hover:bg-gold hover:text-black disabled:opacity-40" disabled={locked} onClick={() => bump(k, -1)} aria-label={`Remove a vote for ${format(o)}`}>
                    −
                  </button>
                  <button className="grid h-8 w-8 place-items-center border-2 border-black bg-panel2 font-pixel text-xs hover:bg-gold hover:text-black disabled:opacity-40" disabled={locked} onClick={() => bump(k, 1)} aria-label={`Add a vote for ${format(o)}`}>
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {leaders.length > 1 && !winner && !locked && <p className="mt-3 text-lg text-gold">Tie! Tap one of the gold-text labels to break it.</p>}
    </div>
  );
}
