import { useEffect, useMemo, useState } from 'react';
import { recordStartup } from '../../state/record';
import { GameShell, type Stage } from '../../components/GameShell';
import { metaById } from '../meta';
import { STARTUP, solveTree, type Demand, type IncAction } from '../../engine/startup';
import { StartupStory } from './Story';
import { StartupPlay } from './Play';
import { StartupSolve } from './Solve';
import { StartupSimulate } from './Simulate';
import { StartupDebrief } from './Debrief';

export type StartupRound = { entered: false } | { entered: true; demand: Demand; action: IncAction };

export type StartupState = {
  p: number;
  setP: (v: number) => void;
  credible: boolean;
  setCredible: (v: boolean) => void;
  r: number;
  setR: (v: number) => void;
  round: StartupRound | null;
  setRound: (v: StartupRound | null) => void;
  sol: ReturnType<typeof solveTree>;
};

export default function StartupGame() {
  const meta = metaById('startup');
  const [p, setP] = useState(STARTUP.pHigh);
  const [credible, setCredible] = useState(false);
  const [r, setR] = useState(0);
  const [round, setRound] = useState<StartupRound | null>(null);
  const sol = useMemo(() => solveTree({ p, credible, r }), [p, credible, r]);
  useEffect(() => {
    if (round) recordStartup(round, sol, p, credible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);
  const st: StartupState = { p, setP, credible, setCredible, r, setR, round, setRound, sol };
  const stages: Stage[] = [
    { id: 'story', label: 'Story', render: () => <StartupStory /> },
    { id: 'play', label: 'Play', render: () => <StartupPlay st={st} /> },
    { id: 'solve', label: 'Solve', render: () => <StartupSolve st={st} /> },
    { id: 'simulate', label: 'Simulate', render: () => <StartupSimulate st={st} /> },
    { id: 'debrief', label: 'Debrief', render: () => <StartupDebrief st={st} /> },
  ];
  return <GameShell title={meta.title} number={meta.number} accent={meta.accent} stages={stages} />;
}
