import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BridgeScene, type ScenePhase } from './BridgeScene';
import { VotePanel } from '../../components/VotePanel';
import { PayoffMatrix } from '../../components/PayoffMatrix';
import { Toggle } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face, type Mood } from '../../components/pixel/sprites';
import { payoff, type ChickenSolution, type Move } from '../../engine/chicken';
import type { ChickenState } from './ChickenGame';

const LINES: Record<string, [string, string]> = {
  '0-0': ['Phew. Nobody’s a hero tonight.', 'Same. Call it a draw.'],
  '0-1': ['…I blinked.', 'Never doubted it.'],
  '1-0': ['Never doubted it.', '…I blinked.'],
  '1-1': ['WHY DIDN’T YOU SWERVE?!', 'WHY DIDN’T YOU?!'],
};
const MOODS: Record<string, [Mood, Mood]> = { '0-0': ['happy', 'happy'], '0-1': ['sad', 'smug'], '1-0': ['smug', 'sad'], '1-1': ['shocked', 'shocked'] };

export function ChickenPlay({ st, sol }: { st: ChickenState; sol: ChickenSolution; accent?: string }) {
  const g = sol.game;
  const [voteA, setVoteA] = useState<Move | null>(null);
  const [voteB, setVoteB] = useState<Move | null>(null);
  const [locked, setLocked] = useState<{ a: Move; b: Move } | null>(st.outcome);
  const [phase, setPhase] = useState<ScenePhase>(st.outcome ? 'resolve' : 'idle');
  const [done, setDone] = useState(!!st.outcome);

  useEffect(() => {
    if (!locked || st.outcome) return;
    setPhase('approach');
    const t1 = setTimeout(() => setPhase('resolve'), 1550);
    const t2 = setTimeout(() => {
      setDone(true);
      st.setOutcome(locked);
    }, 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  const replay = () => {
    st.setOutcome(null);
    setLocked(null);
    setVoteA(null);
    setVoteB(null);
    setPhase('idle');
    setDone(false);
  };

  const opts = [
    { id: '0', label: 'Swerve', sub: 'Pull onto the railing' },
    { id: '1', label: 'Straight', sub: 'Hold the line' },
  ];
  const a = locked?.a ?? null;
  const b = locked?.b ?? null;
  const key = locked ? `${locked.a}-${locked.b}` : '';
  const res = locked ? payoff(g, locked.a, locked.b) : null;
  const crash = phase === 'resolve' && a === 1 && b === 1;
  const word = phase === 'resolve' ? (crash ? 'CRASH!' : a === 0 && b === 0 ? 'SWERVE!' : 'WINNER!') : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="chip text-gold">PLAY · SIMULTANEOUS MOVE</span>
        <div className="w-full max-w-md">
          <Toggle
            checked={st.asymmetric}
            onChange={(v) => {
              if (!locked) st.setAsymmetric(v);
            }}
            label="Truck vs car"
            sub={locked ? 'Play again to change this' : 'Blue drives a truck: a crash barely scratches it'}
          />
        </div>
      </div>

      <motion.div
        className="relative border-4 border-black shadow-hard"
        animate={crash ? { x: [0, -10, 10, -8, 8, -4, 0] } : { x: 0 }}
        transition={{ delay: crash ? 0.75 : 0, duration: 0.45 }}
      >
        <BridgeScene phase={phase} a={a} b={b} truck={st.asymmetric} />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="chip bg-blue text-black">◀ {g.rowPlayer.toUpperCase()}</span>
          <span className="chip bg-red text-black">{g.colPlayer.toUpperCase()} ▶</span>
        </div>
        {word && (
          <motion.div className="absolute inset-0 grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <ActionWord text={word} size={48} color={crash ? '#ffcc4d' : '#fff4dc'} />
          </motion.div>
        )}
      </motion.div>

      {!done ? (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <VotePanel
              title={`◀ Left side: ${g.rowPlayer}`}
              accent="#5aa7ff"
              options={opts}
              showLock={false}
              decided={locked ? String(locked.a) : null}
              onChange={(w) => setVoteA(w === null ? null : (Number(w) as Move))}
            />
            <VotePanel
              title={`Right side: ${g.colPlayer} ▶`}
              accent="#ef5a4b"
              options={opts}
              showLock={false}
              decided={locked ? String(locked.b) : null}
              onChange={(w) => setVoteB(w === null ? null : (Number(w) as Move))}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button className="btn-primary text-base" disabled={voteA === null || voteB === null || !!locked} onClick={() => setLocked({ a: voteA!, b: voteB! })}>
              LOCK BOTH SIDES &amp; DRIVE ▶
            </button>
            <span className="text-xl text-ink-3">
              {locked ? 'Engines roaring…' : voteA === null || voteB === null ? 'Each side needs a majority. Tap a name to break a tie.' : 'Both sides ready. No peeking.'}
            </span>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Panel tone="night" className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map((i) => {
                const f = face(MOODS[key][i], i ? C.K : C.brown);
                return (
                  <div key={i} className={`flex flex-col gap-4 ${i ? 'items-end' : 'items-start'}`}>
                    <Bubble side={i ? 'bottom-right' : 'bottom-left'}>{LINES[key][i]}</Bubble>
                    <Sprite {...f} px={9} flip={!!i} />
                    <div className="font-mono text-6xl leading-none" style={{ color: i ? '#ef5a4b' : '#5aa7ff' }}>
                      {res![i] > 0 ? `+${res![i]}` : res![i]}
                    </div>
                  </div>
                );
              })}
            </div>
            <Narration className="mt-6">
              {g.rowPlayer}: {g.rowLabels[a!]} · {g.colPlayer}: {g.colLabels[b!]}. Payoffs ({res![0]}, {res![1]}).
            </Narration>
            <div className="mt-6 flex flex-wrap gap-4">
              <button className="btn-ghost" onClick={replay}>
                ↺ PLAY AGAIN
              </button>
              <NextStageButton label="SOLVE IT" />
            </div>
          </Panel>
          <Panel tone="night" className="p-4">
            <div className="label mb-2">FREEZE FRAME: WHERE YOU LANDED</div>
            <PayoffMatrix game={g} selected={{ r: a!, c: b! }} compact legend={false} />
          </Panel>
        </div>
      )}
    </div>
  );
}
