import { useState } from 'react';
import { GameShell, type Stage } from '../../components/GameShell';
import { metaById } from '../meta';
import type { Move } from '../../engine/advertising';
import { AdStory } from './Story';
import { AdPlay } from './Play';
import { AdSolve } from './Solve';
import { AdSimulate } from './Simulate';
import { AdDebrief } from './Debrief';

export type AdState = {
  opponent: string;
  setOpponent: (id: string) => void;
  classMoves: Move[];
  aiMoves: Move[];
  push: (c: Move, a: Move) => void;
  clear: () => void;
};

export default function AdvertisingGame() {
  const meta = metaById('advertising');
  const [opponent, setOpponent] = useState('tft');
  const [classMoves, setClassMoves] = useState<Move[]>([]);
  const [aiMoves, setAiMoves] = useState<Move[]>([]);
  const st: AdState = {
    opponent,
    setOpponent,
    classMoves,
    aiMoves,
    push: (c, a) => {
      setClassMoves((m) => [...m, c]);
      setAiMoves((m) => [...m, a]);
    },
    clear: () => {
      setClassMoves([]);
      setAiMoves([]);
    },
  };
  const stages: Stage[] = [
    { id: 'story', label: 'Story', render: () => <AdStory accent={meta.accent} /> },
    { id: 'play', label: 'Play', render: () => <AdPlay st={st} accent={meta.accent} /> },
    { id: 'solve', label: 'Solve', render: () => <AdSolve accent={meta.accent} /> },
    { id: 'simulate', label: 'Simulate', render: () => <AdSimulate accent={meta.accent} /> },
    { id: 'debrief', label: 'Debrief', render: () => <AdDebrief st={st} accent={meta.accent} /> },
  ];
  return <GameShell title={meta.title} number={meta.number} accent={meta.accent} stages={stages} />;
}
