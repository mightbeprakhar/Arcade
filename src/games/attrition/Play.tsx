import { useState } from 'react';
import { VotePanel } from '../../components/VotePanel';
import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Narration, Panel } from '../../components/comic';
import { Slider, Toggle } from '../../components/ui';
import { ATTRITION, attritionPayoffs, concedeProbInMinute, cumulativeCost, hazard } from '../../engine/attrition';
import { Room } from './Room';
import type { AttState } from './AttritionGame';

export function AttPlay({ st }: { st: AttState }) {
  const { V, c } = ATTRITION;
  const g = st.escalating ? st.g : 0;
  const [minute, setMinute] = useState(st.round?.minute ?? 0);
  const [lastNote, setLastNote] = useState<string | null>(null);
  const done = st.round !== null;
  const cost = cumulativeCost(minute, c, g);
  const pAI = concedeProbInMinute(minute, c, g);

  const decide = (id: string) => {
    if (id === 'concede') {
      st.setRound({ minute, classConceded: true, escalating: st.escalating, g: st.g });
      return;
    }
    // The class waits this minute; the roommate concedes with the equilibrium probability for this minute.
    if (Math.random() < pAI) {
      st.setRound({ minute: minute + 1, classConceded: false, escalating: st.escalating, g: st.g });
      setMinute(minute + 1);
    } else {
      setMinute(minute + 1);
      setLastNote(['They’re not budging.', 'Still glaring.', 'The smell is getting worse.', 'They put headphones on.', 'A fly has moved in.'][minute % 5]);
    }
  };

  const again = () => {
    st.setRound(null);
    setMinute(0);
    setLastNote(null);
  };

  const res = st.round ? attritionPayoffs(st.round.minute, st.round.classConceded, V, c, st.round.escalating ? st.round.g : 0) : null;
  const maxCost = Math.max(V, cumulativeCost(Math.max(minute, 10), c, g));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <span className="chip text-gold">PLAY · ONE VOTE PER MINUTE</span>
        <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
          <Toggle checked={st.escalating} onChange={(v) => minute === 0 && !done && st.setEscalating(v)} label="Trash piles up" sub="Cost per minute grows" />
          {st.escalating && <Slider label="Extra ₹/min each minute" value={st.g} min={1} max={10} step={1} onChange={(v) => minute === 0 && !done && st.setG(v)} format={(v) => `+${v}`} />}
        </div>
      </div>

      <Room minute={minute} moodA={done ? (st.round!.classConceded ? 'sad' : 'smug') : minute > 5 ? 'grim' : 'smug'} moodB={done ? (st.round!.classConceded ? 'smug' : 'sad') : minute > 5 ? 'grim' : 'smug'} costEach={cost} maxCost={maxCost} />

      {!done ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <VotePanel
            key={minute}
            title={`Minute ${minute + 1}: wait or concede?`}
            options={[
              { id: 'wait', label: 'Wait', sub: `Costs you ₹${(c + g * minute).toFixed(0)} this minute` },
              { id: 'concede', label: 'Concede', sub: 'Take the trash out now' },
            ]}
            onDecide={decide}
            lockLabel={`Lock minute ${minute + 1}`}
          />
          <div className="space-y-4">
            {lastNote && <Narration>{lastNote}</Narration>}
            <Narration current={false}>
              Each roommate values not going at ₹{V}. Waiting costs each of you ₹{c}
              {st.escalating ? ` plus ₹${st.g} more every minute` : ''} per minute. So far you have each burned ₹{Math.round(cost)}.
            </Narration>
            <p className="text-lg text-ink-3">
              Your roommate plays the equilibrium: they give in with probability {(pAI * 100).toFixed(1)}% this minute (hazard {(hazard(c + g * minute, V)).toFixed(2)} per minute).
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Panel tone={st.round!.classConceded ? 'red' : 'teal'} className="p-6">
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
              <div className="text-center">
                <div className="font-pixel text-xs">YOU (A)</div>
                <div className="font-mono text-6xl leading-none">₹{Math.round(res!.classPayoff)}</div>
              </div>
              <ActionWord text={st.round!.classConceded ? 'YOU CRACKED!' : 'THEY CRACKED!'} size={32} color={st.round!.classConceded ? '#ffcc4d' : '#fff4dc'} />
              <div className="text-center">
                <div className="font-pixel text-xs">ROOMMATE (B)</div>
                <div className="font-mono text-6xl leading-none">₹{Math.round(res!.aiPayoff)}</div>
              </div>
            </div>
          </Panel>
          <Narration>
            The standoff lasted {st.round!.minute} minute{st.round!.minute === 1 ? '' : 's'}. Together you burned ₹{Math.round(2 * cumulativeCost(st.round!.minute, c, st.round!.escalating ? st.round!.g : 0))} of misery
            fighting over a ₹{V} prize.
          </Narration>
          <div className="flex flex-wrap gap-4">
            <button className="btn-ghost" onClick={again}>
              ↺ PLAY AGAIN
            </button>
            <NextStageButton label="SOLVE IT" />
          </div>
        </div>
      )}
    </div>
  );
}
