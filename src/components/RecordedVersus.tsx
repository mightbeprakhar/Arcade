import { Narration } from './comic';
import { NextStageButton } from './GameShell';
import { VersusCard } from './ui';
import { beatNashFor, pointsFor, usePredictions, useResults, type GameId } from '../state/results';

const fmt = (n: number) => (Number.isInteger(n) ? n.toLocaleString('en-IN') : n.toFixed(2));

/** Debrief summary read straight from the recorded result: class vs Nash, points and the beat-Nash badge. */
export function RecordedVersus({ game }: { game: GameId }) {
  const results = useResults();
  const preds = usePredictions();
  const r = results[game];
  if (!r)
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Narration>The class hasn’t played this game yet.</Narration>
        <NextStageButton label="GO TO PLAY" to="play" />
      </div>
    );
  const pts = pointsFor(game, results, preds) ?? 0;
  return (
    <div className="space-y-4">
      <VersusCard classChoice={r.classChoice} classPayoff={fmt(r.classPayoff)} nashPrediction={r.nashPrediction} nashPayoff={fmt(r.nashPayoff)} unit={r.unit} />
      <div className="flex flex-wrap items-center gap-3">
        <span className="chip text-gold">{pts.toLocaleString('en-IN')} PTS</span>
        {beatNashFor(r) && <span className="chip bg-teal text-black">★ BEAT NASH</span>}
        {preds[game] !== undefined && <span className="chip">{preds[game] ? 'PREDICTION ✓' : 'PREDICTION ✗'}</span>}
      </div>
    </div>
  );
}
