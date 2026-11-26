import { useEffect, useMemo, useState } from 'react';
import { recordStartup, type Market, type StartupRole } from '../../state/record';
import { PredictGate } from '../../components/PredictGate';
import { GameShell, type Stage } from '../../components/GameShell';
import { metaById } from '../meta';
import { STARTUP, solveTree } from '../../engine/startup';
import { StartupStory } from './Story';
import { StartupPlay } from './Play';
import { StartupSolve } from './Solve';
import { StartupSimulate } from './Simulate';
import { StartupDebrief } from './Debrief';

export type { Market, StartupRole };

export type StartupState = {
  p: number;
  setP: (v: number) => void;
  credible: boolean;
  setCredible: (v: boolean) => void;
  r: number;
  setR: (v: number) => void;
  /** Which side the class plays in the 5-market series. */
  role: StartupRole;
  setRole: (r: StartupRole) => void;
  markets: Market[];
  addMarket: (m: Market) => void;
  resetMarkets: () => void;
  sol: ReturnType<typeof solveTree>;
};

export default function StartupGame() {
  const meta = metaById('startup');
  const [p, setP] = useState(STARTUP.pHigh);
  const [credible, setCredible] = useState(false);
  const [r, setR] = useState(0);
  const [role, setRole] = useState<StartupRole>('founder');
  const [markets, setMarkets] = useState<Market[]>([]);
  const sol = useMemo(() => solveTree({ p, credible, r }), [p, credible, r]);
  // Record after every market so Humans vs Nash shows the running score.
  useEffect(() => {
    recordStartup(role, markets, p, credible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets]);
  const st: StartupState = { p, setP, credible, setCredible, r, setR, role, setRole, markets, addMarket: (m) => setMarkets((x) => [...x, m]), resetMarkets: () => setMarkets([]), sol };
  const stages: Stage[] = [
    { id: 'story', label: 'Story', render: () => <StartupStory /> },
    { id: 'play', label: 'Play', render: () => <StartupPlay st={st} /> },
    {
      id: 'solve',
      label: 'Solve',
      render: () => (
        <PredictGate game="startup">
          <StartupSolve st={st} />
        </PredictGate>
      ),
    },
    { id: 'simulate', label: 'Simulate', render: () => <StartupSimulate st={st} /> },
    { id: 'debrief', label: 'Debrief', render: () => <StartupDebrief st={st} /> },
  ];
  return <GameShell title={meta.title} number={meta.number} accent={meta.accent} stages={stages} />;
}
