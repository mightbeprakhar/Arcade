import { useEffect, useState } from 'react';
import { recordUltimatum, type UltRound } from '../../state/record';
import { PredictGate } from '../../components/PredictGate';
import { GameShell, type Stage } from '../../components/GameShell';
import { metaById } from '../meta';
import { UltStory } from './Story';
import { UltPlay } from './Play';
import { UltSolve } from './Solve';
import { UltSimulate } from './Simulate';
import { UltDebrief } from './Debrief';

export type UltMode = 'proposer' | 'responder';
export type { UltRound };

/** A series is 5 rounds against freshly drawn strangers; the bank is the class's running total. */
export type UltState = {
  mode: UltMode;
  setMode: (m: UltMode) => void;
  rounds: UltRound[];
  addRound: (r: UltRound) => void;
  resetRounds: () => void;
};

export default function UltimatumGame() {
  const meta = metaById('ultimatum');
  const [mode, setMode] = useState<UltMode>('proposer');
  const [rounds, setRounds] = useState<UltRound[]>([]);
  // Record after every round so Humans vs Nash always shows the bank so far.
  useEffect(() => {
    recordUltimatum(rounds);
  }, [rounds]);
  const st: UltState = { mode, setMode, rounds, addRound: (r) => setRounds((x) => [...x, r]), resetRounds: () => setRounds([]) };
  const stages: Stage[] = [
    { id: 'story', label: 'Story', render: () => <UltStory /> },
    { id: 'play', label: 'Play', render: () => <UltPlay st={st} /> },
    {
      id: 'solve',
      label: 'Solve',
      render: () => (
        <PredictGate game="ultimatum">
          <UltSolve />
        </PredictGate>
      ),
    },
    { id: 'simulate', label: 'Simulate', render: () => <UltSimulate /> },
    { id: 'debrief', label: 'Debrief', render: () => <UltDebrief st={st} /> },
  ];
  return <GameShell title={meta.title} number={meta.number} accent={meta.accent} stages={stages} />;
}
