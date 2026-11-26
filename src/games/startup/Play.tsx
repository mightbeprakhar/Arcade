import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { VotePanel } from '../../components/VotePanel';
import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face } from '../../components/pixel/sprites';
import { Toggle } from '../../components/ui';
import { MARKETS, STARTUP, drawDemand, founderEnters, incumbentChoice, leafPayoff, type Demand, type IncAction } from '../../engine/startup';
import { startupScore } from '../../state/record';
import type { Market, StartupRole, StartupState } from './StartupGame';

const pct = (x: number) => `${Math.round(x * 100)}%`;

type Phase = 'decide' | 'flip' | 'respond' | 'done';

/** Five markets in a row. The class plays the founder (enter or not) or the incumbent (fight or not). */
export function StartupPlay({ st }: { st: StartupState }) {
  const [phase, setPhase] = useState<Phase>(st.markets.length ? 'done' : 'decide');
  const [entered, setEntered] = useState(false);
  const [demand, setDemand] = useState<Demand>('High');
  const over = st.markets.length >= MARKETS;
  const score = startupScore(st.role, st.markets, st.p, st.credible);
  const marketNo = Math.min(st.markets.length + (phase === 'done' ? 0 : 1), MARKETS);
  const last = st.markets[st.markets.length - 1];

  // Founder: decide → flip → done. Incumbent: (AI founder decides) → flip → respond → done.
  useEffect(() => {
    if (phase !== 'flip') return;
    const t = setTimeout(() => {
      if (st.role === 'incumbent' && entered) setPhase('respond');
      else finish(entered ? incumbentChoice(demand, st.credible) : 'Accommodate');
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const finish = (action: IncAction) => {
    st.addMarket({ entered, demand, action });
    setPhase('done');
  };
  const startMarket = (enter: boolean) => {
    setEntered(enter);
    setDemand(drawDemand(st.p));
    setPhase('flip');
  };
  const nextMarket = () => setPhase('decide');
  const newSeries = () => {
    st.resetMarkets();
    setPhase('decide');
  };
  const setRole = (r: StartupRole) => {
    if (st.markets.length || phase !== 'decide') return;
    st.setRole(r);
  };
  const aiEnters = founderEnters(st.p, st.credible);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Class role">
          {(
            [
              ['founder', 'CLASS = THE STARTUP'],
              ['incumbent', 'CLASS = THE INCUMBENT'],
            ] as const
          ).map(([r, l]) => (
            <button key={r} className={`btn-ghost ${st.role === r ? '!border-gold !text-gold' : ''}`} aria-pressed={st.role === r} disabled={st.role !== r && (st.markets.length > 0 || phase !== 'decide')} onClick={() => setRole(r)}>
              {l}
            </button>
          ))}
        </div>
        <div className="w-full max-w-md">
          <Toggle
            checked={st.credible}
            onChange={(v) => !st.markets.length && phase === 'decide' && st.setCredible(v)}
            label="Incumbent has a reputation to protect"
            sub={st.markets.length ? 'Start a new series to change this' : `Fighting in a weak market pays it ${STARTUP.credibleLowFight}`}
          />
        </div>
      </div>

      <Panel className="grid grid-cols-3 items-center gap-4 p-4 text-center">
        <div>
          <div className="font-pixel text-xs text-blue">CLASS SCORE</div>
          <div className="font-mono text-6xl leading-none text-blue">{score.score}</div>
        </div>
        <div>
          <div className="font-pixel text-xs text-gold">MARKET {marketNo}/{MARKETS}</div>
          <div className="mt-2 text-lg text-ink-3">High demand {pct(st.p)}</div>
        </div>
        <div>
          <div className="font-pixel text-xs text-gold">NASH ON SAME MARKETS</div>
          <div className="font-mono text-6xl leading-none text-gold">{score.nash}</div>
        </div>
      </Panel>

      {phase === 'decide' && st.role === 'founder' && (
        <>
          <Narration>
            Market {marketNo}: demand will be High with chance {pct(st.p)}. The incumbent threatens a price war. Enter, or stay out and earn {STARTUP.stayOut[0]}?
          </Narration>
          <VotePanel
            key={`f${st.markets.length}`}
            title={`Market ${marketNo}: what does the startup do?`}
            options={[
              { id: 'enter', label: 'Enter', sub: 'Launch and face the incumbent' },
              { id: 'out', label: 'Stay out', sub: `Safe: you get ${STARTUP.stayOut[0]}` },
            ]}
            onDecide={(id) => startMarket(id === 'enter')}
            lockLabel="Lock in"
          />
        </>
      )}

      {phase === 'decide' && st.role === 'incumbent' && (
        <Panel className="grid grid-cols-1 items-center gap-6 p-6 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Sprite {...face(aiEnters ? 'happy' : 'scared', C.brown, C.skin, C.teal, 'spiky')} px={6} />
          <div className="space-y-4">
            <Narration>
              Market {marketNo}: an AI founder who plays by the theory looks at your market. {aiEnters ? 'It decides to enter.' : `It stays out, so you keep all ${STARTUP.stayOut[1]}.`}
            </Narration>
            <button className="btn-primary" onClick={() => startMarket(aiEnters)}>
              {aiEnters ? 'FLIP FOR DEMAND ▶' : 'NEXT ▶'}
            </button>
          </div>
          <Sprite {...face('grim', '#a39bc9', C.skin2, '#2b2659', 'neat')} px={6} flip />
        </Panel>
      )}

      {(phase === 'flip' || phase === 'respond') && (
        <Panel className="grid min-h-[16rem] grid-cols-1 items-center gap-6 bg-[#241f52] p-6 md:grid-cols-2">
          <div className="flex flex-col items-center gap-4">
            <span className="font-pixel text-xs text-ink-3">NATURE FLIPS THE MARKET</span>
            <Coin result={phase === 'respond' ? demand : null} />
            {phase === 'respond' && <ActionWord text={`${demand.toUpperCase()} DEMAND`} size={22} />}
          </div>
          {phase === 'respond' ? (
            <VotePanel
              title="The class is the incumbent: respond"
              options={[
                { id: 'Accommodate', label: 'Accommodate', sub: `You get ${leafPayoff(demand, 'Accommodate', st.credible)[1]}` },
                { id: 'Fight', label: 'Fight', sub: `Price war: you get ${leafPayoff(demand, 'Fight', st.credible)[1]}` },
              ]}
              onDecide={(id) => finish(id as IncAction)}
              lockLabel="Respond"
            />
          ) : (
            <Narration current={false}>{entered ? 'The startup is in. How big is the market?' : 'The startup stayed out. Here is the market it would have faced.'}</Narration>
          )}
        </Panel>
      )}

      {phase === 'done' && last && <Outcome st={st} m={last} over={over} onNext={nextMarket} onNew={newSeries} />}
    </div>
  );
}

function Coin({ result }: { result: Demand | null }) {
  return (
    <motion.div
      className="grid h-40 w-40 place-items-center border-8 border-black bg-gold font-pixel text-2xl text-black"
      style={{ boxShadow: 'inset -10px -10px 0 #d49a1e, 6px 6px 0 #0f0d22' }}
      animate={result ? { scaleX: 1 } : { scaleX: [1, 0.08, 1, 0.08, 1, 0.08, 1, 0.08, 1] }}
      transition={{ duration: 1.8, ease: 'linear' }}
    >
      {result ? result.toUpperCase() : '?'}
    </motion.div>
  );
}

function Outcome({ st, m, over, onNext, onNew }: { st: StartupState; m: Market; over: boolean; onNext: () => void; onNew: () => void }) {
  const pay = m.entered ? leafPayoff(m.demand, m.action, st.credible) : STARTUP.stayOut;
  const fight = m.entered && m.action === 'Fight';
  const founderMood = !m.entered ? 'sad' : fight ? 'shocked' : 'happy';
  const ceoMood = !m.entered ? 'smug' : fight ? 'grim' : 'sad';
  const word = !m.entered ? 'STAYED OUT' : fight ? 'PRICE WAR!' : 'WELCOME!';
  const best = incumbentChoice(m.demand, st.credible);
  const score = startupScore(st.role, st.markets, st.p, st.credible);
  const line = !m.entered
    ? `No entry. The market would have been ${m.demand}.`
    : st.role === 'incumbent'
      ? m.action === best
        ? `${m.demand} demand: ${m.action.toLowerCase()} was your best reply.`
        : `${m.demand} demand: ${best.toLowerCase()} would have paid you ${leafPayoff(m.demand, best, st.credible)[1]}, not ${pay[1]}.`
      : `${m.demand} demand. The incumbent ${fight ? 'fought: its reputation made the threat pay' : 'accommodated: the threat was empty'}.`;
  return (
    <div className="space-y-6">
      <Panel tone={fight ? 'red' : m.entered ? 'teal' : 'night'} className="p-6">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex flex-col items-center gap-2">
            <Sprite {...face(founderMood, C.brown, C.skin, C.teal, 'spiky')} px={7} />
            <span className="font-pixel text-xs">STARTUP{st.role === 'founder' ? ' (CLASS)' : ''}</span>
            <span className="font-mono text-6xl leading-none">{pay[0]}</span>
          </div>
          <div className="grid place-items-center gap-4 text-center">
            <ActionWord text={word} size={32} color={fight ? '#ffcc4d' : '#fff4dc'} />
            <p className="text-2xl font-bold">{line}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Bubble side="bottom-right">{fight ? 'Nothing personal.' : m.entered ? 'Welcome… I suppose.' : 'Wise choice.'}</Bubble>
            <Sprite {...face(ceoMood, '#a39bc9', C.skin2, '#2b2659', 'neat')} px={7} flip />
            <span className="font-pixel text-xs">INCUMBENT{st.role === 'incumbent' ? ' (CLASS)' : ''}</span>
            <span className="font-mono text-6xl leading-none">{pay[1]}</span>
          </div>
        </div>
      </Panel>
      {over && (
        <Panel tone={score.score > score.nash ? 'gold' : 'night'} className="grid place-items-center gap-3 p-6 text-center">
          <ActionWord text={score.score > score.nash ? 'BEAT NASH!' : score.score === score.nash ? 'MATCHED NASH' : 'NASH WINS'} size={28} />
          <p className="text-2xl font-bold">
            {MARKETS} markets: class {score.score}, equilibrium play {score.nash} on the same markets.
          </p>
        </Panel>
      )}
      <div className="flex flex-wrap gap-4">
        {over ? (
          <>
            <button className="btn-ghost" onClick={onNew}>
              ↺ NEW {MARKETS} MARKETS
            </button>
            <NextStageButton label="SOLVE IT" />
          </>
        ) : (
          <>
            <button className="btn-primary" onClick={onNext}>
              NEXT MARKET ▶
            </button>
            <NextStageButton label="SKIP TO SOLVE" quiet />
          </>
        )}
      </div>
    </div>
  );
}
