import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { VotePanel } from '../../components/VotePanel';
import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face } from '../../components/pixel/sprites';
import { Toggle } from '../../components/ui';
import { STARTUP, incumbentChoice, leafPayoff, type Demand } from '../../engine/startup';
import type { StartupRound, StartupState } from './StartupGame';

const pct = (x: number) => `${Math.round(x * 100)}%`;

export function StartupPlay({ st }: { st: StartupState }) {
  const [phase, setPhase] = useState<'vote' | 'flip' | 'incumbent' | 'done'>(st.round ? 'done' : 'vote');
  const [pending, setPending] = useState<StartupRound | null>(st.round);

  useEffect(() => {
    if (!pending || phase === 'done' || phase === 'vote') return;
    const t = setTimeout(
      () => {
        if (phase === 'flip') setPhase('incumbent');
        else {
          st.setRound(pending);
          setPhase('done');
        }
      },
      phase === 'flip' ? 2000 : 1400,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const decide = (id: string) => {
    if (id === 'out') {
      const r: StartupRound = { entered: false };
      setPending(r);
      st.setRound(r);
      setPhase('done');
      return;
    }
    const demand: Demand = Math.random() < st.p ? 'High' : 'Low';
    setPending({ entered: true, demand, action: incumbentChoice(demand, st.credible) });
    setPhase('flip');
  };

  const again = () => {
    st.setRound(null);
    setPending(null);
    setPhase('vote');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="chip text-gold">PLAY · CLASS = THE STARTUP</span>
        <div className="w-full max-w-md">
          <Toggle
            checked={st.credible}
            onChange={(v) => phase === 'vote' && st.setCredible(v)}
            label="Incumbent has a reputation to protect"
            sub={phase === 'vote' ? 'Fighting a weak entrant scares off future rivals' : 'Play again to change this'}
          />
        </div>
      </div>

      {phase === 'vote' && (
        <>
          <Narration>
            Demand will be High with chance {pct(st.p)}. The incumbent has threatened a price war. Enter, or stay out and the incumbent keeps all {STARTUP.stayOut[1]} points of
            profit?
          </Narration>
          <VotePanel
            title="Show of hands: what does the startup do?"
            options={[
              { id: 'enter', label: 'Enter', sub: 'Launch and face the incumbent' },
              { id: 'out', label: 'Stay out', sub: `Safe: you get ${STARTUP.stayOut[0]}` },
            ]}
            onDecide={decide}
            lockLabel="Lock in the startup's move"
          />
        </>
      )}

      {(phase === 'flip' || phase === 'incumbent') && pending?.entered && <Reveal phase={phase} round={pending} p={st.p} />}
      {phase === 'done' && st.round && <Outcome st={st} onAgain={again} />}
    </div>
  );
}

function Coin({ result }: { result: Demand | null }) {
  return (
    <motion.div
      className="grid h-40 w-40 place-items-center border-8 border-black bg-gold font-pixel text-2xl text-black"
      style={{ boxShadow: 'inset -10px -10px 0 #d49a1e, 6px 6px 0 #0f0d22' }}
      initial={{ scaleX: 1 }}
      animate={result ? { scaleX: 1 } : { scaleX: [1, 0.08, 1, 0.08, 1, 0.08, 1, 0.08, 1] }}
      transition={{ duration: 1.8, ease: 'linear' }}
    >
      {result ? (result === 'High' ? 'HIGH' : 'LOW') : '?'}
    </motion.div>
  );
}

function Reveal({ phase, round, p }: { phase: 'flip' | 'incumbent'; round: Extract<StartupRound, { entered: true }>; p: number }) {
  const ceo = face('grim', '#a39bc9', C.skin2, '#2b2659', 'neat');
  return (
    <Panel className="grid min-h-[22rem] grid-cols-1 items-center gap-6 bg-[#241f52] p-6 md:grid-cols-2">
      <div className="flex flex-col items-center gap-4">
        <span className="font-pixel text-xs text-ink-3">NATURE FLIPS THE MARKET · HIGH {pct(p)}</span>
        <Coin result={phase === 'incumbent' ? round.demand : null} />
        {phase === 'incumbent' && <ActionWord text={`${round.demand.toUpperCase()} DEMAND`} size={24} />}
      </div>
      {phase === 'incumbent' && (
        <div className="flex items-end justify-center gap-4">
          <Bubble side="bottom-right">Let me think about that threat…</Bubble>
          <Sprite {...ceo} px={8} flip />
        </div>
      )}
    </Panel>
  );
}

function Outcome({ st, onAgain }: { st: StartupState; onAgain: () => void }) {
  const rd = st.round!;
  const pay = rd.entered ? leafPayoff(rd.demand, rd.action, st.credible) : STARTUP.stayOut;
  const fight = rd.entered && rd.action === 'Fight';
  const founder = face(!rd.entered ? 'sad' : fight ? 'shocked' : 'happy', C.brown, C.skin, C.blueD, 'short');
  const ceo = face(!rd.entered ? 'smug' : fight ? 'grim' : 'sad', '#a39bc9', C.skin2, '#2b2659', 'neat');
  const word = !rd.entered ? 'STAYED OUT' : fight ? 'PRICE WAR!' : 'WELCOME!';
  const line = !rd.entered
    ? 'The garage stays quiet. Safe, but you will never know.'
    : fight
      ? `Demand came out ${rd.demand}. The incumbent fought: with its reputation on the line, crushing you was worth it.`
      : `Demand came out ${rd.demand}. The incumbent accommodated: fighting would have hurt it more than sharing. The threat was empty.`;
  return (
    <div className="space-y-6">
      <Panel tone={fight ? 'red' : rd.entered ? 'teal' : 'night'} className="p-6">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex flex-col items-center gap-2">
            <Sprite {...founder} px={8} />
            <span className="font-pixel text-xs">STARTUP (CLASS)</span>
            <span className="font-mono text-6xl leading-none">{pay[0]}</span>
          </div>
          <div className="grid place-items-center gap-4 text-center">
            <ActionWord text={word} size={34} color={fight ? '#ffcc4d' : '#fff4dc'} />
            <p className="text-2xl font-bold">{line}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Sprite {...ceo} px={8} flip />
            <span className="font-pixel text-xs">INCUMBENT</span>
            <span className="font-mono text-6xl leading-none">{pay[1]}</span>
          </div>
        </div>
      </Panel>
      <Narration>
        Theory says: {st.sol.decision === 'Enter' ? `Enter (expected payoff ${st.sol.euEnter.toFixed(2)} > 0)` : `Stay out (expected payoff of entering is ${st.sol.euEnter.toFixed(2)})`}. One flip
        of the coin is luck; the decision is judged by its expectation.
      </Narration>
      <div className="flex flex-wrap gap-4">
        <button className="btn-ghost" onClick={onAgain}>
          ↺ PLAY AGAIN
        </button>
        <NextStageButton label="SOLVE IT" />
      </div>
    </div>
  );
}
