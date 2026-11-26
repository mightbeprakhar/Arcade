import { useEffect, useState } from 'react';
import { recordUltimatum } from '../../state/record';
import { GameShell, type Stage } from '../../components/GameShell';
import { metaById } from '../meta';
import { UltStory } from './Story';
import { UltPlay } from './Play';
import { UltSolve } from './Solve';
import { UltSimulate } from './Simulate';
import { UltDebrief } from './Debrief';

export type UltMode = 'proposer' | 'responder';
/** What happened in the class's round. */
export type UltRound =
  | { mode: 'proposer'; offer: number; alphaIdx: number; accepted: boolean }
  | { mode: 'responder'; min: number; offer: number; accepted: boolean };

export type UltState = {
  mode: UltMode;
  setMode: (m: UltMode) => void;
  round: UltRound | null;
  setRound: (r: UltRound | null) => void;
};

export default function UltimatumGame() {
  const meta = metaById('ultimatum');
  const [mode, setMode] = useState<UltMode>('proposer');
  const [round, setRound] = useState<UltRound | null>(null);
  useEffect(() => {
    if (round) recordUltimatum(round);
  }, [round]);
  const st: UltState = { mode, setMode, round, setRound };
  const stages: Stage[] = [
    { id: 'story', label: 'Story', render: () => <UltStory /> },
    { id: 'play', label: 'Play', render: () => <UltPlay st={st} /> },
    { id: 'solve', label: 'Solve', render: () => <UltSolve /> },
    { id: 'simulate', label: 'Simulate', render: () => <UltSimulate /> },
    { id: 'debrief', label: 'Debrief', render: () => <UltDebrief st={st} /> },
  ];
  return <GameShell title={meta.title} number={meta.number} accent={meta.accent} stages={stages} />;
}
