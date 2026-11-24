import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BuildProvider, useBuildRegistry, usePresenter, toggleFullscreen } from '../state/presenter';
import { StepNav } from './StepNav';
import { PresenterBar } from './PresenterBar';

export type StageId = 'story' | 'play' | 'solve' | 'simulate' | 'debrief';
export type Stage = { id: StageId; label: string; render: () => ReactNode };

export const STAGE_LABELS: Record<StageId, string> = {
  story: 'Story',
  play: 'Play',
  solve: 'Solve',
  simulate: 'Simulate',
  debrief: 'Debrief',
};

type StageCtx = { index: number; goTo: (i: number | StageId) => void; next: () => void; accent: string };
const StageContext = createContext<StageCtx>({ index: 0, goTo: () => {}, next: () => {}, accent: '#22d3ee' });
export const useStage = () => useContext(StageContext);

/* Reset: remounts the whole game (state lives below the key). */
const ResetContext = createContext<() => void>(() => {});
export function Resettable({ children }: { children: (key: number) => ReactNode }) {
  const [k, setK] = useState(0);
  const reset = useCallback(() => setK((x) => x + 1), []);
  return <ResetContext.Provider value={reset}>{children(k)}</ResetContext.Provider>;
}
export const useReset = () => useContext(ResetContext);

function isTypingTarget(t: EventTarget | null) {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
}

export function GameShell({
  title,
  number,
  accent,
  stages,
  initialStage = 0,
}: {
  title: string;
  number: number;
  accent: string;
  stages: Stage[];
  initialStage?: number;
}) {
  const [index, setIndex] = useState(initialStage);
  const { registry, next: buildNext, prev: buildPrev } = useBuildRegistry();
  const { togglePresenter } = usePresenter();
  const reset = useReset();

  const goTo = useCallback(
    (i: number | StageId) => {
      const n = typeof i === 'number' ? i : stages.findIndex((s) => s.id === i);
      if (n >= 0 && n < stages.length) {
        setIndex(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [stages],
  );
  const next = useCallback(() => {
    if (!buildNext()) setIndex((i) => Math.min(stages.length - 1, i + 1));
  }, [buildNext, stages.length]);
  const prev = useCallback(() => {
    if (!buildPrev()) setIndex((i) => Math.max(0, i - 1));
  }, [buildPrev]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      const onButton = e.target instanceof HTMLButtonElement;
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case ' ':
          if (onButton) return; // let Space press the focused button
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
        case 'r':
        case 'R':
          reset();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'p':
        case 'P':
          togglePresenter();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, reset, togglePresenter]);

  useEffect(() => {
    document.title = `${title} · Game Theory Arcade`;
  }, [title]);

  const stage = stages[index];
  return (
    <StageContext.Provider value={{ index, goTo, next, accent }}>
      <BuildProvider value={registry}>
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-28 pt-4 sm:px-6">
          <header className="flex flex-wrap items-center gap-3 sm:gap-5">
            <Link to="/" className="btn-ghost px-3" aria-label="Back to the arcade">
              ← Arcade
            </Link>
            <div className="flex min-w-0 items-baseline gap-3">
              <span className="font-mono text-base font-semibold" style={{ color: accent }}>
                0{number}
              </span>
              <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
            </div>
            <div className="w-full lg:ml-auto lg:w-auto">
              <StepNav stages={stages} index={index} onSelect={goTo} accent={accent} />
            </div>
          </header>
          <main className="mt-6 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {stage.render()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <PresenterBar onNext={next} onPrev={prev} onReset={reset} canPrev={index > 0} canNext={index < stages.length - 1} />
      </BuildProvider>
    </StageContext.Provider>
  );
}

/** A big "continue" button at the bottom of a stage. */
export function NextStageButton({ label, to }: { label?: string; to?: StageId }) {
  const { goTo, index, accent } = useStage();
  return (
    <button
      className="btn text-lg text-ink-950 hover:brightness-110"
      style={{ background: accent }}
      onClick={() => goTo(to ?? index + 1)}
    >
      {label ?? 'Continue'} →
    </button>
  );
}
