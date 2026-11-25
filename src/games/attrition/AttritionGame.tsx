import { useState } from 'react';
import { GameShell, type Stage } from '../../components/GameShell';
import { metaById } from '../meta';
import { AttStory } from './Story';
import { AttPlay } from './Play';
import { AttSolve } from './Solve';
import { AttSimulate } from './Simulate';
import { AttDebrief } from './Debrief';

/** minute = whole minutes both waited before the standoff ended. */
export type AttRound = { minute: number; classConceded: boolean; escalating: boolean; g: number };

export type AttState = {
  escalating: boolean;
  setEscalating: (v: boolean) => void;
  g: number;
  setG: (v: number) => void;
  round: AttRound | null;
  setRound: (r: AttRound | null) => void;
};

export default function AttritionGame() {
  const meta = metaById('attrition');
  const [escalating, setEscalating] = useState(false);
  const [g, setG] = useState(4);
  const [round, setRound] = useState<AttRound | null>(null);
  const st: AttState = { escalating, setEscalating, g, setG, round, setRound };
  const stages: Stage[] = [
    { id: 'story', label: 'Story', render: () => <AttStory /> },
    { id: 'play', label: 'Play', render: () => <AttPlay st={st} /> },
    { id: 'solve', label: 'Solve', render: () => <AttSolve st={st} /> },
    { id: 'simulate', label: 'Simulate', render: () => <AttSimulate /> },
    { id: 'debrief', label: 'Debrief', render: () => <AttDebrief st={st} /> },
  ];
  return <GameShell title={meta.title} number={meta.number} accent={meta.accent} stages={stages} />;
}
