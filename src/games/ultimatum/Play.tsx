import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HistogramVote } from '../../components/HistogramVote';
import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face } from '../../components/pixel/sprites';
import { T } from '../../components/motion';
import { ALPHA_TYPES, OFFERS, PIE, ULT_ROUNDS, aiResponderAccepts, drawAlpha, drawHumanOffer, fehrSchmidtThreshold, outcome } from '../../engine/ultimatum';
import { ultimatumBank, type UltRound } from '../../state/record';
import type { UltMode, UltState } from './UltimatumGame';

const r = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const k = (n: number) => `${n / 1000}k`;

export function UltPlay({ st }: { st: UltState }) {
  const [vote, setVote] = useState<number | null>(null);
  const [phase, setPhase] = useState<'vote' | 'thinking' | 'done'>(st.rounds.length ? 'done' : 'vote');
  const [pending, setPending] = useState<UltRound | null>(null);
  const seriesOver = st.rounds.length >= ULT_ROUNDS;
  const bank = ultimatumBank(st.rounds);

  useEffect(() => {
    if (phase !== 'thinking' || !pending) return;
    const t = setTimeout(() => {
      st.addRound(pending);
      setPhase('done');
    }, 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const lock = () => {
    if (vote === null) return;
    if (st.mode === 'proposer') {
      const type = drawAlpha();
      const alphaIdx = ALPHA_TYPES.indexOf(type);
      setPending({ mode: 'proposer', offer: vote, alphaIdx, accepted: aiResponderAccepts(vote, type.alpha) });
    } else {
      const offer = drawHumanOffer();
      setPending({ mode: 'responder', min: vote, offer, accepted: offer >= vote });
    }
    setPhase('thinking');
  };

  /** Next stranger in the same series. */
  const nextStranger = () => {
    setPending(null);
    setVote(null);
    setPhase('vote');
  };
  /** Start a fresh 5-round series (optionally switching role). */
  const again = () => {
    st.resetRounds();
    nextStranger();
  };

  const switchMode = (m: UltMode) => {
    if (phase !== 'vote' || st.rounds.length) return;
    st.setMode(m);
    setVote(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="chip text-gold">PLAY</span>
        <div className="flex gap-2" role="group" aria-label="Round">
          {(
            [
              ['proposer', 'ROUND A · CLASS PROPOSES'],
              ['responder', 'ROUND B · CLASS RESPONDS'],
            ] as const
          )
            // Once a round is under way only its own tab shows; the next round is offered as a button at the end.
            .filter(([m]) => (phase === 'vote' && !st.rounds.length) || st.mode === m)
            .map(([m, l]) => (
              <button key={m} onClick={() => switchMode(m)} aria-pressed={st.mode === m} className={`btn-ghost ${st.mode === m ? '!border-gold !text-gold' : ''}`}>
                {l}
              </button>
            ))}
        </div>
        <span className="chip ml-auto text-gold">
          STRANGER {Math.min(st.rounds.length + (phase === 'done' ? 0 : 1), ULT_ROUNDS)}/{ULT_ROUNDS}
        </span>
      </div>

      <Panel className="grid grid-cols-3 items-center gap-4 p-4 text-center">
        <div>
          <div className="font-pixel text-xs text-blue">CLASS BANK</div>
          <div className="font-mono text-5xl leading-none text-blue">{r(bank.bank)}</div>
        </div>
        <div>
          <div className="font-pixel text-xs text-ink-3">DEALS</div>
          <div className="font-mono text-5xl leading-none">
            {bank.accepted}/{st.rounds.length}
          </div>
        </div>
        <div>
          <div className="font-pixel text-xs text-gold">NASH ON SAME STRANGERS</div>
          <div className="font-mono text-5xl leading-none text-gold">{r(bank.nash)}</div>
        </div>
      </Panel>

      {phase === 'vote' && (
        <>
          <Narration>
            {st.mode === 'proposer'
              ? `The class is the Proposer. How much of ${r(PIE)} do you offer the stranger? They have a hidden sense of fairness: they might take anything, or they might punish a lowball.`
              : `The class is the Responder. Before you see the offer, set the smallest amount you'll accept. The Proposer is a stranger who decides on their own.`}
          </Narration>
          <HistogramVote
            key={`${st.mode}-${st.rounds.length}`}
            title={st.mode === 'proposer' ? 'Show of hands: what do we offer?' : 'Show of hands: our minimum to accept'}
            options={OFFERS}
            format={k}
            onChange={(w) => setVote(w)}
          />
          <div className="flex flex-wrap items-center gap-4">
            <button className="btn-primary" disabled={vote === null} onClick={lock}>
              {st.mode === 'proposer' ? 'SEND THE OFFER ▶' : 'LOCK OUR MINIMUM ▶'}
            </button>
            <span className="text-xl text-ink-3">{vote === null ? 'Count hands under each amount. The tallest bar wins.' : `Class move: ${r(vote)}`}</span>
          </div>
        </>
      )}

      {phase === 'thinking' && pending && <Thinking round={pending} />}
      {phase === 'done' && st.rounds.length > 0 && (
        <Ending
          st={st}
          over={seriesOver}
          onNext={nextStranger}
          onAgain={again}
          onRoundB={() => {
            // Keep Round A's results; start Round B fresh.
            st.setMode('responder');
            st.resetRounds('responder');
            nextStranger();
          }}
        />
      )}
    </div>
  );
}

function Thinking({ round }: { round: UltRound }) {
  const R = face('grim', C.K, C.skin2, C.redD, 'long');
  return (
    <Panel className="grid min-h-[22rem] place-items-center bg-[#241f52] p-6">
      <div className="flex items-end gap-6">
        <Sprite {...R} px={10} flip />
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: 1 }}>
          <Bubble side="bottom-left">{round.mode === 'proposer' ? `${r(round.offer)}? Hmm…` : 'The Proposer is writing an offer…'}</Bubble>
        </motion.div>
      </div>
    </Panel>
  );
}

/** The two ending screens from the spec: "Accepted" or "Zero payout". */
function Ending({ st, over, onNext, onAgain, onRoundB }: { st: UltState; over: boolean; onNext: () => void; onAgain: () => void; onRoundB: () => void }) {
  const rd = st.rounds[st.rounds.length - 1];
  const bank = ultimatumBank(st.rounds);
  const [pp, rr] = outcome(rd.offer, rd.accepted);
  const P = face(rd.accepted ? 'happy' : 'shocked', C.brown, C.skin, C.blueD, 'short');
  const R = face(rd.accepted ? 'smug' : 'grim', C.K, C.skin2, C.redD, 'long');
  const type = rd.mode === 'proposer' ? ALPHA_TYPES[rd.alphaIdx] : null;
  const thr = type ? (type.alpha === 0 ? 0 : fehrSchmidtThreshold(type.alpha)) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T} className="space-y-6">
      <Panel tone={rd.accepted ? 'teal' : 'red'} className="p-6">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex flex-col items-center gap-2">
            <Sprite {...P} px={8} />
            <span className="font-pixel text-xs">PROPOSER{rd.mode === 'proposer' ? ' (CLASS)' : ''}</span>
            <span className="font-mono text-6xl leading-none">{r(pp)}</span>
          </div>
          <div className="grid place-items-center gap-4 text-center">
            <ActionWord text={rd.accepted ? 'ACCEPTED!' : 'ZERO PAYOUT'} size={36} color={rd.accepted ? '#fff4dc' : '#ffcc4d'} />
            <div className="text-2xl font-bold">
              {rd.mode === 'proposer' ? `The class offered ${r(rd.offer)}.` : `The stranger offered ${r(rd.offer)}; the class's minimum was ${r(rd.min)}.`}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Sprite {...R} px={8} flip />
            <span className="font-pixel text-xs">RESPONDER{rd.mode === 'responder' ? ' (CLASS)' : ''}</span>
            <span className="font-mono text-6xl leading-none">{r(rr)}</span>
          </div>
        </div>
      </Panel>
      {type && (
        <Narration>
          The stranger's hidden type: <b>{type.label}</b> (α = {type.alpha}).{' '}
          {type.alpha === 0 ? 'They accept any offer above ₹0.' : `They reject anything below ${r(thr!)}, because a lopsided split hurts more than the money helps.`}
        </Narration>
      )}
      {rd.mode === 'responder' && !rd.accepted && rd.offer > 0 && (
        <Narration>A purely money-minded responder would have pocketed {r(rd.offer)}. Your pride cost exactly that. Was it worth it?</Narration>
      )}
      {over && (
        <Panel tone={bank.bank > bank.nash ? 'gold' : 'night'} className="grid place-items-center gap-3 p-6 text-center">
          <ActionWord text={bank.bank > bank.nash ? 'BEAT NASH!' : 'NASH WINS'} size={30} />
          <p className="text-2xl font-bold">
            After {ULT_ROUNDS} strangers the class banked {r(bank.bank)}. The equilibrium {rd.mode === 'proposer' ? 'Proposer' : 'Responder'} would have banked {r(bank.nash)} against the same people.
          </p>
        </Panel>
      )}
      <div className="flex flex-wrap gap-4">
        {!over ? (
          <button className="btn-primary" onClick={onNext}>
            NEXT STRANGER ▶
          </button>
        ) : (
          <button className="btn-ghost" onClick={onAgain}>
            ↺ NEW {ULT_ROUNDS} ROUNDS
          </button>
        )}
        {!over ? (
          <NextStageButton label="SKIP TO SOLVE" quiet />
        ) : rd.mode === 'proposer' ? (
          <>
            <button className="btn-primary" onClick={onRoundB}>
              NEXT: ROUND B ▶
            </button>
            <NextStageButton label="SKIP TO SOLVE" quiet />
          </>
        ) : (
          <NextStageButton label="SOLVE IT" />
        )}
      </div>
    </motion.div>
  );
}
