import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HistogramVote } from '../../components/HistogramVote';
import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face } from '../../components/pixel/sprites';
import { T } from '../../components/motion';
import { ALPHA_TYPES, OFFERS, PIE, aiResponderAccepts, drawAlpha, drawHumanOffer, fehrSchmidtThreshold, outcome } from '../../engine/ultimatum';
import type { UltMode, UltState } from './UltimatumGame';

const r = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const k = (n: number) => `${n / 1000}k`;

export function UltPlay({ st }: { st: UltState }) {
  const [vote, setVote] = useState<number | null>(null);
  const [phase, setPhase] = useState<'vote' | 'thinking' | 'done'>(st.round ? 'done' : 'vote');
  const [pending, setPending] = useState<UltState['round']>(null);

  useEffect(() => {
    if (phase !== 'thinking' || !pending) return;
    const t = setTimeout(() => {
      st.setRound(pending);
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

  const again = () => {
    st.setRound(null);
    setPending(null);
    setVote(null);
    setPhase('vote');
  };

  const switchMode = (m: UltMode) => {
    if (phase !== 'vote') return;
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
          ).map(([m, l]) => (
            <button key={m} onClick={() => switchMode(m)} aria-pressed={st.mode === m} disabled={phase !== 'vote' && st.mode !== m} className={`btn-ghost ${st.mode === m ? '!border-gold !text-gold' : ''}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {phase === 'vote' && (
        <>
          <Narration>
            {st.mode === 'proposer'
              ? `The class is the Proposer. How much of ${r(PIE)} do you offer the stranger? They have a hidden sense of fairness: they might take anything, or they might punish a lowball.`
              : `The class is the Responder. Before you see the offer, set the smallest amount you'll accept. The Proposer is a stranger who decides on their own.`}
          </Narration>
          <HistogramVote
            key={st.mode}
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
      {phase === 'done' && st.round && <Ending st={st} onAgain={again} />}
    </div>
  );
}

function Thinking({ round }: { round: NonNullable<UltState['round']> }) {
  const R = face('grim', C.K, C.skin2);
  return (
    <Panel className="grid min-h-[22rem] place-items-center bg-[#241f52] p-6">
      <div className="flex items-end gap-6">
        <Sprite {...R} px={12} flip />
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: 1 }}>
          <Bubble side="bottom-left">{round.mode === 'proposer' ? `${r(round.offer)}? Hmm…` : 'The Proposer is writing an offer…'}</Bubble>
        </motion.div>
      </div>
    </Panel>
  );
}

/** The two ending screens from the spec: "Accepted" or "Zero payout". */
function Ending({ st, onAgain }: { st: UltState; onAgain: () => void }) {
  const rd = st.round!;
  const [pp, rr] = outcome(rd.offer, rd.accepted);
  const P = face(rd.accepted ? 'happy' : 'shocked', C.brown);
  const R = face(rd.accepted ? 'smug' : 'grim', C.K, C.skin2);
  const type = rd.mode === 'proposer' ? ALPHA_TYPES[rd.alphaIdx] : null;
  const thr = type ? (type.alpha === 0 ? 0 : fehrSchmidtThreshold(type.alpha)) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T} className="space-y-6">
      <Panel tone={rd.accepted ? 'teal' : 'red'} className="p-6">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex flex-col items-center gap-2">
            <Sprite {...P} px={10} />
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
            <Sprite {...R} px={10} flip />
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
      <div className="flex flex-wrap gap-4">
        <button className="btn-ghost" onClick={onAgain}>
          ↺ PLAY AGAIN
        </button>
        <NextStageButton label="SOLVE IT" />
      </div>
    </motion.div>
  );
}
