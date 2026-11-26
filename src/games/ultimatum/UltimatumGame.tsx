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
  /** Rounds of the current part (Round A or Round B); each part keeps its own. */
  rounds: UltRound[];
  addRound: (r: UltRound) => void;
  /** Clears one part only (defaults to the current one), so Round A survives Round B and vice versa. */
  resetRounds: (mode?: UltMode) => void;
};

export default function UltimatumGame() {
  const meta = metaById('ultimatum');
  const [mode, setMode] = useState<UltMode>('proposer');
  const [parts, setParts] = useState<Record<UltMode, UltRound[]>>({ proposer: [], responder: [] });
  // Record after every round so Humans vs Nash always shows both parts' banks so far.
  useEffect(() => {
    recordUltimatum(parts.proposer, parts.responder);
  }, [parts]);
  const st: UltState = {
    mode,
    setMode,
    rounds: parts[mode],
    addRound: (r) => setParts((x) => ({ ...x, [r.mode]: [...x[r.mode], r] })),
    resetRounds: (m = mode) => setParts((x) => ({ ...x, [m]: [] })),
  };
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
