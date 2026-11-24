import { BlockMath, InlineMath } from 'react-katex';
import { AnimatePresence, motion } from 'framer-motion';
import { useBuildSteps } from '../state/presenter';

export type MathLine = { tex: string; note?: string };

/** KaTeX equation lines revealed one per keypress (→ / Space), or by tapping "Next line". */
export function MathBlock({ lines, title, accent = '#22d3ee' }: { lines: MathLine[]; title?: string; accent?: string }) {
  const { shown, advance, showAll, done } = useBuildSteps(lines.length, 1);
  return (
    <div className="card">
      {title && <div className="label mb-2">{title}</div>}
      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {lines.slice(0, shown).map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col border-l-4 pl-4"
              style={{ borderColor: i === shown - 1 ? accent : '#2e3958' }}
            >
              <div className="min-w-0 flex-1 text-lg">
                <BlockMath math={l.tex} />
              </div>
              {l.note && <div className="-mt-1 pb-2 text-base text-slate-300">{l.note}</div>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {!done && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-ghost py-1.5" onClick={advance}>
            Next line <span className="kbd">→</span>
          </button>
          <button className="btn-ghost py-1.5" onClick={showAll}>
            Show all
          </button>
          <span className="self-center text-sm text-slate-400">
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
