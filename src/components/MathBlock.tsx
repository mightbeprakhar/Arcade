import { BlockMath, InlineMath } from 'react-katex';
import { motion } from 'framer-motion';
import { useBuildSteps } from '../state/presenter';
import { T } from './motion';
import { FitWidth } from './FitWidth';
import { useRevealScroll } from './useReveal';

/** `tex` may be split into several parts, each shown on its own line. */
export type MathLine = { tex: string | string[]; note?: string };

/** The maths, on a cream comic page so it reads clearly on a projector. One line per keypress. */
export function MathBlock({ lines, title }: { lines: MathLine[]; title?: string; accent?: string }) {
  const { shown, advance, showAll, done } = useBuildSteps(lines.length, 1);
  return (
    <div className="page halftone overflow-hidden p-6">
      {title && <h3 className="mb-4 text-sm text-red">{title.toUpperCase()}</h3>}
      <div className="space-y-2">
        {lines.slice(0, shown).map((l, i) => (
          <Line key={i} line={l} current={i === shown - 1} revealed={i > 0} />
        ))}
      </div>
      {!done && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button className="btn-ghost" onClick={advance}>
            NEXT LINE ▶
          </button>
          <button className="font-pixel text-xs text-paperink-2 underline underline-offset-4" onClick={showAll}>
            SHOW ALL
          </button>
          <span className="font-pixel text-xs text-paperink-2">
            {shown}/{lines.length}
          </span>
        </div>
      )}
    </div>
  );
}

/** One maths line; lines after the first were revealed by the presenter, so they scroll into view. */
function Line({ line, current, revealed }: { line: MathLine; current: boolean; revealed: boolean }) {
  const ref = useRevealScroll<HTMLDivElement>(revealed);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={T} className="reveal flex gap-3">
      <span className={`mt-3 h-4 w-4 shrink-0 border-2 border-black ${current ? 'bg-red' : 'bg-transparent'}`} />
      <div className="min-w-0 flex-1">
        <div className="text-lg text-paperink">
          {(Array.isArray(line.tex) ? line.tex : [line.tex]).map((t, j) => (
            <FitWidth key={j} align="left">
              <BlockMath math={t} />
            </FitWidth>
          ))}
        </div>
        {line.note && <div className="pb-2 text-lg text-paperink-2">{line.note}</div>}
      </div>
    </motion.div>
  );
}

export function M({ tex }: { tex: string }) {
  return <InlineMath math={tex} />;
}
