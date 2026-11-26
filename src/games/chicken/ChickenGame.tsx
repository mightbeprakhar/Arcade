import { useEffect, useMemo, useState } from 'react';
import { GameShell, type Stage } from '../../components/GameShell';
import { PredictGate } from '../../components/PredictGate';
import { metaById } from '../meta';
import { solveChicken, type Move } from '../../engine/chicken';
import { recordChickenRoom, recordChickenSeries, type ChickenRound } from '../../state/record';
import { ChickenStory } from './Story';
import { ChickenPlay } from './Play';
import { ChickenSolve } from './Solve';
import { ChickenSimulate } from './Simulate';
import { ChickenDebrief } from './Debrief';

export type ChickenMode = 'ai' | 'room';
export type ChickenState = {
  asymmetric: boolean;
  setAsymmetric: (v: boolean) => void;
  mode: ChickenMode;
  setMode: (m: ChickenMode) => void;
  /** Left-vs-right mode: one simultaneous round between the two halves of the room. */
  outcome: { a: Move; b: Move } | null;
  setOutcome: (o: { a: Move; b: Move } | null) => void;
  /** Class-vs-AI mode: best of 5. */
  rounds: ChickenRound[];
  addRound: (r: ChickenRound) => void;
  resetSeries: () => void;
  voice: boolean;
  setVoice: (v: boolean) => void;
};

export default function ChickenGame() {
  const meta = metaById('chicken');
  const [asymmetric, setAsymmetric] = useState(false);
  const [mode, setMode] = useState<ChickenMode>('ai');
  const [outcome, setOutcome] = useState<{ a: Move; b: Move } | null>(null);
  const [rounds, setRounds] = useState<ChickenRound[]>([]);
  const [voice, setVoice] = useState(false);
  const sol = useMemo(() => solveChicken(asymmetric), [asymmetric]);

  // Record for Humans vs Nash after every finished round.
  useEffect(() => {
    if (rounds.length) recordChickenSeries(sol, rounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rounds.length]);
  useEffect(() => {
    if (outcome) recordChickenRoom(sol, outcome);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  const st: ChickenState = {
    asymmetric,
    setAsymmetric,
    mode,
    setMode,
    outcome,
    setOutcome,
    rounds,
    addRound: (r) => setRounds((x) => [...x, r]),
    resetSeries: () => setRounds([]),
    voice,
    setVoice,
  };

  const stages: Stage[] = [
    { id: 'story', label: 'Story', render: () => <ChickenStory st={st} accent={meta.accent} /> },
    { id: 'play', label: 'Play', render: () => <ChickenPlay st={st} sol={sol} accent={meta.accent} /> },
    {
      id: 'solve',
      label: 'Solve',
      render: () => (
        <PredictGate game="chicken">
          <ChickenSolve st={st} sol={sol} accent={meta.accent} />
        </PredictGate>
      ),
    },
    { id: 'simulate', label: 'Simulate', render: () => <ChickenSimulate sol={sol} accent={meta.accent} /> },
    { id: 'debrief', label: 'Debrief', render: () => <ChickenDebrief st={st} sol={sol} accent={meta.accent} /> },
  ];
  return <GameShell title={meta.title} number={meta.number} accent={meta.accent} stages={stages} />;
}
