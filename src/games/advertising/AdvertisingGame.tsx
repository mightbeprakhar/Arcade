import { useEffect, useState } from 'react';
import { recordAdvertising } from '../../state/record';
import { GameShell, type Stage } from '../../components/GameShell';
import { PredictGate } from '../../components/PredictGate';
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
  /** Mystery rival: its strategy stays hidden until the class guesses it after week 20. */
  mystery: boolean;
  setMystery: (v: boolean) => void;
  guess: string | null;
  setGuess: (id: string | null) => void;
};

export default function AdvertisingGame() {
  const meta = metaById('advertising');
  const [opponent, setOpponent] = useState('tft');
  const [classMoves, setClassMoves] = useState<Move[]>([]);
  const [aiMoves, setAiMoves] = useState<Move[]>([]);
  const [mystery, setMystery] = useState(false);
  const [guess, setGuess] = useState<string | null>(null);
  // Record for Humans vs Nash after every week, and again when the mystery guess is made.
  useEffect(() => {
    recordAdvertising(classMoves, aiMoves, opponent, mystery && guess ? guess === opponent : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classMoves.length, guess]);
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
      setGuess(null);
    },
    mystery,
    setMystery,
    guess,
    setGuess,
  };
  const stages: Stage[] = [
    { id: 'story', label: 'Story', render: () => <AdStory accent={meta.accent} /> },
    { id: 'play', label: 'Play', render: () => <AdPlay st={st} accent={meta.accent} /> },
    {
      id: 'solve',
      label: 'Solve',
      render: () => (
        <PredictGate game="advertising">
          <AdSolve accent={meta.accent} />
        </PredictGate>
      ),
    },
    { id: 'simulate', label: 'Simulate', render: () => <AdSimulate accent={meta.accent} /> },
    { id: 'debrief', label: 'Debrief', render: () => <AdDebrief st={st} accent={meta.accent} /> },
  ];
  return <GameShell title={meta.title} number={meta.number} accent={meta.accent} stages={stages} />;
}
