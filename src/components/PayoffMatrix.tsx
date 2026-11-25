import { motion } from 'framer-motion';
import { colBestResponses, pureNash, rowBestResponses, type Bimatrix, type Cell } from '../engine/bimatrix';

export const ROW_COLOR = '#5aa7ff'; // player A
export const COL_COLOR = '#ef5a4b'; // player B

export function fmt(n: number, digits = 2) {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(digits).replace(/\.?0+$/, '');
}

/** Gold pixel frame + NASH tag around an equilibrium cell; pops in when its layer is revealed. */
export function PenCircle() {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute -inset-2 border-4 border-gold"
      style={{ boxShadow: '4px 4px 0 #0f0d22', outline: '4px solid #0f0d22', outlineOffset: 0 }}
      initial={{ opacity: 0, scale: 1.15 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
    />
  );
}

/**
 * 2x2 bimatrix. Layers:
 *  - bestResponses: underline each player's best-response payoff
 *  - nash: circle pure Nash equilibria in red pen
 *  - mixed: each player's mixing probabilities on the headers
 *  - selected: the class's realised cell (dashed blue)
 */
export function PayoffMatrix({
  game,
  bestResponses = false,
  nash = false,
  mixed,
  selected,
  format = (n: number) => fmt(n),
  highlight,
  compact = false,
  legend = true,
}: {
  game: Bimatrix;
  bestResponses?: boolean;
  nash?: boolean;
  mixed?: { rowP1: number; colP1: number } | null;
  selected?: Cell | null;
  format?: (n: number) => string;
  highlight?: Cell[];
  compact?: boolean;
  legend?: boolean;
}) {
  const ne = nash ? pureNash(game) : [];
  const circled = (r: number, c: number) => ne.some((x) => x.r === r && x.c === c) || !!highlight?.some((x) => x.r === r && x.c === c);
  const rowBR = (r: 0 | 1, c: 0 | 1) => bestResponses && rowBestResponses(game, c).includes(r);
  const colBR = (r: 0 | 1, c: 0 | 1) => bestResponses && colBestResponses(game, r).includes(c);
  const prob = (p: number) => `${fmt(p * 100, 1)}%`;
  const ul = { textDecoration: 'underline', textUnderlineOffset: 6, textDecorationThickness: 2 } as const;

  return (
    <div className="w-full overflow-x-auto">
      <table className="mx-auto border-separate" style={{ borderSpacing: compact ? 8 : 12 }}>
        <thead>
          <tr>
            <th />
            <th colSpan={2} className="pb-2 text-center font-pixel text-sm font-normal" style={{ color: COL_COLOR }}>
              {game.colPlayer}
            </th>
          </tr>
          <tr>
            <th className="pr-2 text-right font-pixel text-sm font-normal" style={{ color: ROW_COLOR }}>
              {game.rowPlayer}
            </th>
            {game.colLabels.map((l, c) => (
              <th key={l} className={`${compact ? 'min-w-[6rem]' : 'min-w-[7rem]'} px-2 pb-1 text-center text-xl font-bold text-ink`}>
                {l}
                {mixed && <div className="font-mono text-2xl leading-none" style={{ color: COL_COLOR }}>{prob(c ? mixed.colP1 : 1 - mixed.colP1)}</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {game.rowLabels.map((rl, r) => (
            <tr key={rl}>
              <th className="pr-3 text-right text-xl font-bold text-ink">
                {rl}
                {mixed && (
                  <div className="font-mono text-2xl leading-none" style={{ color: ROW_COLOR }}>
                    {prob(r ? mixed.rowP1 : 1 - mixed.rowP1)}
                  </div>
                )}
              </th>
              {game.colLabels.map((cl, c) => {
                const [a, b] = game.payoffs[r][c];
                const isNE = circled(r, c);
                const sel = selected && selected.r === r && selected.c === c;
                return (
                  <td
                    key={cl}
                    className={`relative whitespace-nowrap border-4 bg-deep text-center ${compact ? 'p-3' : 'p-6'} ${sel ? 'border-blue' : 'border-black'}`}
                  >
                    {isNE && <PenCircle />}
                    <div className={`font-mono leading-none ${compact ? 'text-4xl' : 'text-6xl'}`}>
                      <span style={{ color: ROW_COLOR, ...(rowBR(r as 0 | 1, c as 0 | 1) ? ul : {}) }}>{format(a)}</span>
                      <span className="text-ink-3">,</span>
                      <span style={{ color: COL_COLOR, ...(colBR(r as 0 | 1, c as 0 | 1) ? ul : {}) }}>{format(b)}</span>
                    </div>
                    {isNE && <div className="mt-2 font-pixel text-xs text-gold">NASH</div>}
                    {sel && <div className="mt-2 font-pixel text-xs text-blue">CLASS</div>}
                    {mixed && <div className="mt-2 font-mono text-xl text-ink-3">P = {prob((r ? mixed.rowP1 : 1 - mixed.rowP1) * (c ? mixed.colP1 : 1 - mixed.colP1))}</div>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {legend && (bestResponses || nash || mixed) && (
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-lg text-ink-2">
          {bestResponses && <span><span className="underline decoration-2 underline-offset-4">Underlined</span>: best response</span>}
          {nash && <span><span className="text-gold">Gold frame</span>: pure Nash equilibrium</span>}
          {mixed && <span>Percentages: the mixed-strategy equilibrium</span>}
        </div>
      )}
    </div>
  );
}
