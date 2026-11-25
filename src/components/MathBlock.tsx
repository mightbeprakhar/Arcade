import { BlockMath, InlineMath } from 'react-katex';
import { motion } from 'framer-motion';
import { useBuildSteps } from '../state/presenter';
import { T } from './motion';

export type MathLine = { tex: string; note?: string };

/** The maths, on a cream comic page so it reads clearly on a projector. One line per keypress. */
export function MathBlock({ lines, title }: { lines: MathLine[]; title?: string; accent?: string }) {
  const { shown, advance, showAll, done } = useBuildSteps(lines.length, 1);
  return (
    <div className="page halftone overflow-hidden p-6">
      {title && <h3 className="mb-4 text-sm text-red">{title.toUpperCase()}</h3>}
      <div className="space-y-2">
        {lines.slice(0, shown).map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={T} className="flex gap-3">
            <span className={`mt-3 h-4 w-4 shrink-0 border-2 border-black ${i === shown - 1 ? 'bg-red' : 'bg-transparent'}`} />
            <div className="min-w-0 flex-1">
              <div className="text-lg text-paperink">
                <BlockMath math={l.tex} />
              </div>
              {l.note && <div className="pb-2 text-lg text-paperink-2">{l.note}</div>}
            </div>
          </motion.div>
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

export function M({ tex }: { tex: string }) {
  return <InlineMath math={tex} />;
}
