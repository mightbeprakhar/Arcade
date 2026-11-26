import { useEffect, useMemo, useState } from 'react';
import { recordChicken } from '../../state/record';
import { GameShell, type Stage } from '../../components/GameShell';
import { metaById } from '../meta';
import { solveChicken, type Move } from '../../engine/chicken';
import { ChickenStory } from './Story';
import { ChickenPlay } from './Play';
import { ChickenSolve } from './Solve';
import { ChickenSimulate } from './Simulate';
import { ChickenDebrief } from './Debrief';

export type ChickenState = {
  asymmetric: boolean;
  setAsymmetric: (v: boolean) => void;
  outcome: { a: Move; b: Move } | null;
  setOutcome: (o: { a: Move; b: Move } | null) => void;
  voice: boolean;
  setVoice: (v: boolean) => void;
};

export default function ChickenGame() {
  const meta = metaById('chicken');
  const [asymmetric, setAsymmetric] = useState(false);
  const [outcome, setOutcome] = useState<{ a: Move; b: Move } | null>(null);
  const [voice, setVoice] = useState(false);
  const st: ChickenState = { asymmetric, setAsymmetric, outcome, setOutcome, voice, setVoice };
  const sol = useMemo(() => solveChicken(asymmetric), [asymmetric]);
  // Record for Humans vs Nash as soon as the round's outcome is known.
  useEffect(() => {
    if (outcome) recordChicken(sol, outcome);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  const stages: Stage[] = [
    { id: 'story', label: 'Story', render: () => <ChickenStory st={st} accent={meta.accent} /> },
    { id: 'play', label: 'Play', render: () => <ChickenPlay st={st} sol={sol} accent={meta.accent} /> },
    { id: 'solve', label: 'Solve', render: () => <ChickenSolve st={st} sol={sol} accent={meta.accent} /> },
    { id: 'simulate', label: 'Simulate', render: () => <ChickenSimulate sol={sol} accent={meta.accent} /> },
    { id: 'debrief', label: 'Debrief', render: () => <ChickenDebrief st={st} sol={sol} accent={meta.accent} /> },
  ];
  return <GameShell title={meta.title} number={meta.number} accent={meta.accent} stages={stages} />;
}
