import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BridgeScene, type ScenePhase } from './BridgeScene';
import { VotePanel } from '../../components/VotePanel';
import { PayoffMatrix } from '../../components/PayoffMatrix';
import { SectionTitle, Toggle } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { payoff, type ChickenSolution, type Move } from '../../engine/chicken';
import type { ChickenState } from './ChickenGame';

export function ChickenPlay({ st, sol, accent }: { st: ChickenState; sol: ChickenSolution; accent: string }) {
  const g = sol.game;
  const [a, setA] = useState<Move | null>(st.outcome?.a ?? null);
  const [b, setB] = useState<Move | null>(st.outcome?.b ?? null);
  const [phase, setPhase] = useState<ScenePhase>(st.outcome ? 'resolve' : 'idle');
  const [showMatrix, setShowMatrix] = useState(!!st.outcome);

  const both = a !== null && b !== null;
  useEffect(() => {
    if (!both || st.outcome) return;
    setPhase('approach');
    const t1 = setTimeout(() => setPhase('resolve'), 1700);
    const t2 = setTimeout(() => {
      setShowMatrix(true);
      st.setOutcome({ a: a!, b: b! });
    }, 3300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [both]);

  const replay = () => {
    st.setOutcome(null);
    setA(null);
    setB(null);
    setPhase('idle');
    setShowMatrix(false);
  };

  const opts = (who: string) => [
    { id: '0', label: 'Swerve', sub: `${who} pulls into the ditch`, color: '#22d3ee' },
    { id: '1', label: 'Straight', sub: `${who} holds the line`, color: '#f97316' },
  ];
  const res = both ? payoff(g, a!, b!) : null;

  return (
    <div>
      <SectionTitle kicker="Play · simultaneous move" title="Swerve or hold the line?" color={accent}>
        Left half of the room drives <b className="text-neon-cyan">{g.rowPlayer}</b>, right half drives{' '}
        <b className="text-neon-pink">{g.colPlayer}</b>. Count both sides before revealing either.
      </SectionTitle>
      <div className="mb-4 max-w-xl">
        <Toggle
          checked={st.asymmetric}
          onChange={(v) => {
            if (!st.outcome) st.setAsymmetric(v);
          }}
          label="Asymmetric: Truck vs Car"
          sub={st.outcome ? 'Reset the round to change this' : 'The truck barely gets scratched in a crash'}
        />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-ink-700">
        <BridgeScene phase={phase} a={a} b={b} truck={st.asymmetric} />
        <AnimatePresence>
          {showMatrix && res && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 hidden items-center justify-center bg-ink-950/80 backdrop-blur-sm md:flex"
            >
              <div className="text-center">
                <div className="label mb-1 text-neon-amber">Freeze frame</div>
                <PayoffMatrix game={g} selected={{ r: a!, c: b! }} compact />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!both || !showMatrix ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {a === null ? (
            <VotePanel title={`Left side · ${g.rowPlayer}`} options={opts(g.rowPlayer)} onDecide={(id) => setA(Number(id) as Move)} lockLabel={`Lock ${g.rowPlayer}`} />
          ) : (
            <LockedCard who={g.rowPlayer} color="#22d3ee" hidden={b === null} move={a} />
          )}
          {b === null ? (
            <VotePanel title={`Right side · ${g.colPlayer}`} options={opts(g.colPlayer)} onDecide={(id) => setB(Number(id) as Move)} lockLabel={`Lock ${g.colPlayer}`} />
          ) : (
            <LockedCard who={g.colPlayer} color="#f472b6" hidden={a === null} move={b} />
          )}
        </div>
      ) : (
        <div className="mt-5 grid items-center gap-4 lg:grid-cols-[1fr_auto]">
          <div className="card">
            <div className="label">Result</div>
            <div className="mt-1 text-2xl font-bold">
              {g.rowPlayer}: {g.rowLabels[a!]} · {g.colPlayer}: {g.colLabels[b!]}
            </div>
            <div className="mt-2 font-mono text-3xl">
              <span className="text-neon-cyan">{res![0]}</span>
              <span className="text-slate-500">, </span>
              <span className="text-neon-pink">{res![1]}</span>
            </div>
            <div className="mt-3 md:hidden">
              <PayoffMatrix game={g} selected={{ r: a!, c: b! }} compact />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-ghost" onClick={replay}>
              ↺ Play again
            </button>
            <NextStageButton label="Solve it" />
          </div>
        </div>
      )}
    </div>
  );
}

function LockedCard({ who, color, hidden, move }: { who: string; color: string; hidden: boolean; move: Move }) {
  return (
    <div className="card grid place-items-center text-center" style={{ borderColor: color }}>
      <div className="label" style={{ color }}>
        {who} locked in
      </div>
      <div className="mt-2 text-3xl font-bold">{hidden ? '🔒 Hidden until both sides lock' : move === 1 ? 'Straight' : 'Swerve'}</div>
    </div>
  );
}
