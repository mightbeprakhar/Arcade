import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BridgeScene, type ScenePhase } from './BridgeScene';
import { VotePanel } from '../../components/VotePanel';
import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face } from '../../components/pixel/sprites';
import { BEST_OF, STRAIGHT, aiChickenMove, commitResponse, payoff, roundWinner, seriesTally, type ChickenSolution, type Move } from '../../engine/chicken';
import { LINES, MOODS } from './Play';
import { ranges, scaleExact, scalePoints } from '../../engine/score';
import type { ChickenState } from './ChickenGame';

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Best of 5 against an AI driver that mixes at the MSNE, with a one-time "commit" power-up. */
export function AiSeries({ st, sol }: { st: ChickenState; sol: ChickenSolution }) {
  const g = sol.game;
  const tally = seriesTally(st.rounds, g);
  const [pending, setPending] = useState<{ a: Move; b: Move; committed: boolean } | null>(null);
  const [phase, setPhase] = useState<ScenePhase>('idle');
  const [showResult, setShowResult] = useState(false);
  const commitUsed = st.rounds.some((r) => r.committed) || !!pending?.committed;

  useEffect(() => {
    if (!pending) return;
    setPhase('approach');
    const t1 = setTimeout(() => setPhase('resolve'), 1550);
    const t2 = setTimeout(() => {
      st.addRound(pending);
      setShowResult(true);
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const drive = (a: Move, committed: boolean) => setPending({ a, b: committed ? commitResponse(g) : aiChickenMove(sol), committed });
  const nextRound = () => {
    setPending(null);
    setShowResult(false);
    setPhase('idle');
  };
  const newSeries = () => {
    st.resetSeries();
    nextRound();
  };

  const last = showResult ? st.rounds[st.rounds.length - 1] : pending;
  const a = phase === 'idle' ? null : (last?.a ?? null);
  const b = phase === 'idle' ? null : (last?.b ?? null);
  const crash = phase === 'resolve' && a === 1 && b === 1;
  const res = showResult && last ? payoff(g, last.a, last.b) : null;
  const winner = res ? roundWinner(res) : null;
  const key = last ? `${last.a}-${last.b}` : '';
  const roundNo = Math.min(tally.played + (showResult ? 0 : 1), BEST_OF);
  const word = phase === 'resolve' && last ? (crash ? 'CRASH!' : last.committed && last.b === 0 ? 'BLINKED!' : last.a === 0 && last.b === 0 ? 'SWERVE!' : 'WINNER!') : null;

  return (
    <div className="space-y-6">
      <Panel className="grid grid-cols-3 items-center gap-4 p-4 text-center">
        <div>
          <div className="font-pixel text-xs text-blue">CLASS · {g.rowPlayer.toUpperCase()}</div>
          <div className="font-mono text-6xl leading-none text-blue">{tally.classWins}</div>
        </div>
        <div>
          <div className="font-pixel text-xs text-gold">ROUND {roundNo}/{BEST_OF}</div>
          <div className="mt-2 text-lg text-ink-3">First to 3 wins</div>
          <div className="mt-1 text-lg text-ink-3">Class payoff so far: <span className="font-mono text-2xl text-ink">{tally.classTotal}</span></div>
        </div>
        <div>
          <div className="font-pixel text-xs text-red">AI · {g.colPlayer.toUpperCase()}</div>
          <div className="font-mono text-6xl leading-none text-red">{tally.aiWins}</div>
        </div>
      </Panel>

      <motion.div className="relative border-4 border-black shadow-hard" animate={crash ? { x: [0, -10, 10, -8, 8, -4, 0] } : { x: 0 }} transition={{ delay: crash ? 0.75 : 0, duration: 0.45 }}>
        <BridgeScene phase={phase} a={a} b={b} truck={st.asymmetric} />
        {word && (
          <motion.div className="absolute inset-0 grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <ActionWord text={word} size={48} color={crash ? '#ffcc4d' : '#fff4dc'} />
          </motion.div>
        )}
      </motion.div>

      {!pending && !tally.over && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <VotePanel
            key={tally.played}
            title={`Round ${roundNo}: the class drives ${g.rowPlayer}`}
            accent="#5aa7ff"
            options={[
              { id: '0', label: 'Swerve', sub: 'Pull onto the railing' },
              { id: '1', label: 'Straight', sub: 'Hold the line' },
            ]}
            onDecide={(id) => drive(Number(id) as Move, false)}
            lockLabel="Drive"
          />
          <div className="space-y-4">
            <Narration current={false}>
              The AI driver plays the mixed equilibrium: it goes straight {pct(sol.mixed.colP1)} of the time, at random. It never sees your vote.
            </Narration>
            <Panel tone={commitUsed ? 'night' : 'gold'} className="p-4">
              <div className="font-pixel text-xs">POWER-UP · ONCE PER GAME</div>
              <p className="mt-2 text-lg">Commit: rip out the steering wheel. The class is locked into Straight and the AI sees it before it moves.</p>
              <button className="btn-ghost mt-3" disabled={commitUsed} onClick={() => drive(STRAIGHT, true)}>
                {commitUsed ? 'COMMIT USED' : 'COMMIT TO STRAIGHT ▶'}
              </button>
            </Panel>
          </div>
        </div>
      )}

      {showResult && last && res && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Panel tone={winner === 'class' ? 'teal' : winner === 'ai' ? 'red' : 'night'} className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div key={i} className={`flex flex-col gap-3 ${i ? 'items-end' : 'items-start'}`}>
                  <Bubble side={i ? 'bottom-right' : 'bottom-left'}>{LINES[key][i]}</Bubble>
                  <Sprite {...face(MOODS[key][i], i ? C.K : C.brown, C.skin, i ? C.redD : C.blueD, i ? 'spiky' : 'short')} px={6} flip={!!i} />
                  <div className="font-mono text-5xl leading-none">{res[i] > 0 ? `+${res[i]}` : res[i]}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xl font-bold">
              {last.committed ? 'The class committed. ' : ''}
              {winner === 'class' ? 'Round to the class.' : winner === 'ai' ? 'Round to the AI.' : 'No winner this round.'}
            </p>
          </Panel>
          <div className="space-y-4">
            {tally.over ? (
              <>
                <ActionWord text={tally.classWins > tally.aiWins ? 'CLASS WINS!' : tally.aiWins > tally.classWins ? 'AI WINS' : 'DRAW'} size={32} />
                <Narration>
                  Final: class {tally.classWins}, AI {tally.aiWins}. Class payoff {tally.classTotal}, worth {scalePoints(tally.classTotal, ranges.chicken(st.asymmetric), tally.played)} points.
                </Narration>
                <Narration current={false}>
                  Against a driver who mixes at the equilibrium, every way of playing (always swerve, always straight, any mix) has the same expected score:{' '}
                  {(sol.mixed.rowValue * tally.played).toFixed(1)} payoff, about {Math.round(scaleExact(sol.mixed.rowValue * tally.played, ranges.chicken(st.asymmetric), tally.played))} points over{' '}
                  {tally.played} rounds. That is what indifference means: only luck separates strategies.
                  {st.rounds.some((r) => r.committed) ? ' The commit is the exception: it changes what the AI does, because the AI sees it.' : ''}
                </Narration>
                <div className="flex flex-wrap gap-4">
                  <button className="btn-ghost" onClick={newSeries}>
                    ↺ NEW GAME
                  </button>
                  <NextStageButton label="SOLVE IT" />
                </div>
              </>
            ) : (
              <button className="btn-primary" onClick={nextRound}>
                NEXT ROUND ▶
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
