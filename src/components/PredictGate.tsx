import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { VotePanel } from './VotePanel';
import { ActionWord, Narration, Panel } from './comic';
import { T } from './motion';
import { predictionFor } from '../engine/predictions';
import { PREDICTION_BONUS } from '../engine/score';
import { recordPrediction, usePredictions, type GameId } from '../state/results';
import { useBuildHandler } from '../state/presenter';

/**
 * The "Predict" step that opens every Solve stage: the class votes on what the equilibrium
 * will be, the reveal says whether they were right, and only then does the solution build.
 * → locks the vote, → again reveals, → again opens the solution.
 */
export function PredictGate({ game, children }: { game: GameId; children: ReactNode }) {
  const p = useMemo(() => predictionFor(game), [game]);
  const preds = usePredictions();
  const [phase, setPhase] = useState<'vote' | 'reveal' | 'solve'>(preds[game] === undefined ? 'vote' : 'solve');
  const [choice, setChoice] = useState<string | null>(null);
  const [locked, setLocked] = useState<string | null>(null);

  const lock = (id: string) => {
    setLocked(id);
    recordPrediction(game, id === p.correct);
    setPhase('reveal');
  };

  useBuildHandler(
    {
      next: () => {
        if (phase === 'vote') {
          if (choice) lock(choice);
          return true;
        }
        if (phase === 'reveal') {
          setPhase('solve');
          return true;
        }
        return false;
      },
      prev: () => false,
    },
    -1,
  );

  const right = preds[game];
  if (phase === 'solve')
    return (
      <div>
        {right !== undefined && (
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className={`chip ${right ? 'bg-teal text-black' : 'bg-red text-black'}`}>{right ? `PREDICTION RIGHT · +${PREDICTION_BONUS} PTS` : 'PREDICTION MISSED'}</span>
            <button
              className="btn-text"
              onClick={() => {
                setChoice(null);
                setLocked(null);
                setPhase('vote');
              }}
            >
              PREDICT AGAIN
            </button>
          </div>
        )}
        {children}
      </div>
    );

  const correctLabel = p.options.find((o) => o.id === p.correct)!.label;
  const pickedLabel = p.options.find((o) => o.id === locked)?.label;

  return (
    <div className="space-y-6">
      <span className="chip text-gold">PREDICT · BEFORE WE SOLVE IT</span>
      <h2 className="break-words text-xl sm:text-3xl" style={{ textShadow: '4px 4px 0 #0f0d22' }}>
        Call it first
      </h2>
      <Narration>{p.question}</Narration>
      {phase === 'vote' ? (
        <VotePanel title="Class prediction" options={p.options} onChange={(w) => setChoice(w)} onDecide={(id) => lock(id)} lockLabel="Lock in our prediction" />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T} className="space-y-6">
          <Panel tone={locked === p.correct ? 'teal' : 'red'} className="grid place-items-center gap-4 p-6 text-center">
            <ActionWord text={locked === p.correct ? 'CORRECT!' : 'NOT QUITE'} size={40} color={locked === p.correct ? '#fff4dc' : '#ffcc4d'} />
            <p className="text-2xl font-bold text-black">
              {locked === p.correct ? `+${PREDICTION_BONUS} points. ` : `The class said “${pickedLabel}”. `}
              Answer: {correctLabel}.
            </p>
          </Panel>
          <Narration current={false}>{p.explain}</Narration>
          <button className="btn-primary" onClick={() => setPhase('solve')}>
            NOW SOLVE IT ▶
          </button>
        </motion.div>
      )}
    </div>
  );
}
