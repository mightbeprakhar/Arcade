import { motion } from 'framer-motion';
import { colBestResponses, pureNash, rowBestResponses, type Bimatrix, type Cell } from '../engine/bimatrix';

const ROW_COLOR = '#22d3ee';
const COL_COLOR = '#f472b6';

export function fmt(n: number, digits = 2) {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(digits).replace(/\.?0+$/, '');
}

/**
 * 2x2 bimatrix. Optional layers:
 *  - bestResponses: underline each player's best-response payoff
 *  - nash: glow pure NE cells
 *  - mixed: show each player's mixing probabilities on the headers
 *  - selected: outline the realised cell
 */
export function PayoffMatrix({
  game,
  bestResponses = false,
  nash = false,
  mixed,
  selected,
  format = (n: number) => fmt(n),
  rowColor = ROW_COLOR,
  colColor = COL_COLOR,
  highlight,
  compact = false,
}: {
  game: Bimatrix;
  bestResponses?: boolean;
  nash?: boolean;
  mixed?: { rowP1: number; colP1: number } | null;
  selected?: Cell | null;
  format?: (n: number) => string;
  rowColor?: string;
  colColor?: string;
  highlight?: Cell[];
  compact?: boolean;
}) {
  const ne = nash ? pureNash(game) : [];
  const isNE = (r: number, c: number) => ne.some((x) => x.r === r && x.c === c);
  const isHi = (r: number, c: number) => highlight?.some((x) => x.r === r && x.c === c);
  const rowBR = (r: 0 | 1, c: 0 | 1) => bestResponses && rowBestResponses(game, c).includes(r);
  const colBR = (r: 0 | 1, c: 0 | 1) => bestResponses && colBestResponses(game, r).includes(c);
  const prob = (p: number) => `${fmt(p * 100, 1)}%`;
  const pad = compact ? 'p-3' : 'p-4 sm:p-6';

  return (
    <div className="w-full overflow-x-auto">
      <table className="mx-auto border-separate" style={{ borderSpacing: 6 }}>
        <thead>
          <tr>
            <th />
            <th colSpan={2} className="pb-1 text-center text-lg font-semibold" style={{ color: colColor }}>
              {game.colPlayer}
            </th>
          </tr>
          <tr>
            <th className="pr-2 text-right text-lg font-semibold" style={{ color: rowColor }}>
              {game.rowPlayer}
            </th>
            {game.colLabels.map((l, c) => (
              <th key={l} className="min-w-[7.5rem] px-2 pb-1 text-center text-lg font-semibold text-slate-200">
                {l}
                {mixed && (
                  <div className="font-mono text-base" style={{ color: colColor }}>
                    {prob(c ? mixed.colP1 : 1 - mixed.colP1)}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {game.rowLabels.map((rl, r) => (
            <tr key={rl}>
              <th className="pr-3 text-right text-lg font-semibold text-slate-200">
                {rl}
                {mixed && (
                  <div className="font-mono text-base" style={{ color: rowColor }}>
                    {prob(r ? mixed.rowP1 : 1 - mixed.rowP1)}
                  </div>
                )}
              </th>
              {game.colLabels.map((cl, c) => {
                const [a, b] = game.payoffs[r][c];
                const neCell = isNE(r, c);
                const sel = selected && selected.r === r && selected.c === c;
                const hi = isHi(r, c);
                return (
                  <motion.td
                    key={cl}
                    layout
                    className={`relative whitespace-nowrap rounded-xl border-2 text-center ${pad}`}
                    style={{
                      borderColor: sel ? '#fbbf24' : neCell || hi ? '#a3e635' : '#2e3958',
                      background: neCell || hi ? 'rgba(163,230,53,0.12)' : '#151b2b',
                      boxShadow: neCell || hi ? '0 0 28px rgba(163,230,53,0.25)' : undefined,
                    }}
                  >
                    <div className={`font-mono font-semibold tabular-nums ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
                      <span
                        style={{ color: rowColor, textDecoration: rowBR(r as 0 | 1, c as 0 | 1) ? 'underline' : 'none', textUnderlineOffset: 6, textDecorationThickness: 3 }}
                      >
                        {format(a)}
                      </span>
                      <span className="text-slate-500">, </span>
                      <span
                        style={{ color: colColor, textDecoration: colBR(r as 0 | 1, c as 0 | 1) ? 'underline' : 'none', textUnderlineOffset: 6, textDecorationThickness: 3 }}
                      >
                        {format(b)}
                      </span>
                    </div>
                    {neCell && <div className="mt-1 text-sm font-bold uppercase tracking-wider text-neon-lime">Nash eq.</div>}
                    {sel && <div className="mt-1 text-sm font-bold uppercase tracking-wider text-neon-amber">Class outcome</div>}
                    {mixed && (
                      <div className="mt-1 font-mono text-sm text-slate-300">
                        P = {prob((r ? mixed.rowP1 : 1 - mixed.rowP1) * (c ? mixed.colP1 : 1 - mixed.colP1))}
                      </div>
                    )}
                  </motion.td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {(bestResponses || nash || mixed) && (
        <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-base text-slate-300">
          {bestResponses && <span><span className="underline decoration-2 underline-offset-4">underlined</span> = best response</span>}
          {nash && <span><span className="text-neon-lime">green cell</span> = pure Nash equilibrium</span>}
          {mixed && <span>% on headers = mixed-strategy equilibrium; P = probability of each cell</span>}
        </div>
      )}
    </div>
  );
}
