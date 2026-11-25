import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face, icons } from '../../components/pixel/sprites';
import { Notes } from '../../components/ui';
import { useBuildSteps } from '../../state/presenter';
import { PIE, STEP, outcome } from '../../engine/ultimatum';

const r = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** Level 1 as a pixel comic: one offer, one answer. */
export function UltStory() {
  const ex = 3 * STEP;
  const [keep, give] = outcome(ex, true);
  const panels = [
    `A sponsor drops ${r(PIE)} on the table for two strangers to split. There's one catch.`,
    `The Proposer names a split, in ${r(STEP)} steps. One offer, no haggling.`,
    'The Responder can accept it, or reject it.',
    `Accept: the split happens (offer ${r(ex)} → ${r(keep)} and ${r(give)}). Reject: the sponsor takes it all back and both get ₹0.`,
    'Round A: the class proposes to a stranger whose sense of fairness is hidden. Round B: the class sets its minimum before it sees the offer.',
  ];
  const { shown, advance } = useBuildSteps(panels.length, 1);
  const P = face('smug', C.brown);
  const R = face(shown >= 4 ? 'grim' : 'happy', C.K, C.skin2);

  return (
    <div className="space-y-6">
      <span className="chip text-gold">STORY · PANEL {shown}/{panels.length}</span>
      <Panel className="bg-[#241f52] p-6">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
          <Narration>{panels[0]}</Narration>
          <div className="flex items-end justify-center gap-2">
            <Sprite {...icons.coins} px={8} />
            <Sprite {...icons.coins} px={10} />
            <Sprite {...icons.coins} px={8} />
          </div>
        </div>
        <div className="mt-4 text-center font-mono text-6xl leading-none text-gold">{r(PIE)}</div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {shown >= 2 ? (
          <Panel tone="blue" className="flex min-h-[16rem] flex-col justify-between p-4">
            <Narration current={shown === 2}>{panels[1]}</Narration>
            <div className="flex items-end gap-4">
              <Sprite {...P} px={9} title="The Proposer" />
              <Bubble side="bottom-left">How about… a little for you?</Bubble>
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
        {shown >= 3 ? (
          <Panel tone="red" className="flex min-h-[16rem] flex-col justify-between p-4">
            <Narration current={shown === 3}>{panels[2]}</Narration>
            <div className="flex items-end justify-end gap-4">
              <Bubble side="bottom-right">Lowball me and nobody eats.</Bubble>
              <Sprite {...R} px={9} flip title="The Responder" />
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
        {shown >= 4 ? (
          <Panel tone="night" className="flex min-h-[16rem] flex-col justify-between gap-4 p-4">
            <Narration current={shown === 4}>{panels[3]}</Narration>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="border-4 border-black bg-teal p-2 text-black">
                <div className="font-pixel text-xs">ACCEPT</div>
                <div className="font-mono text-4xl leading-none">
                  {keep / 1000}k / {give / 1000}k
                </div>
              </div>
              <div className="border-4 border-black bg-red p-2 text-black">
                <div className="font-pixel text-xs">REJECT</div>
                <div className="font-mono text-4xl leading-none">0 / 0</div>
              </div>
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
      </div>

      {shown >= 5 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Panel tone="gold" className="p-6">
            <div className="flex items-center justify-between">
              <div className="font-pixel text-sm">TWO ROUNDS</div>
              <ActionWord text="DEAL?" size={24} />
            </div>
            <p className="mt-2 text-2xl font-bold">{panels[4]}</p>
          </Panel>
          <Notes
            title="WHAT THIS LEVEL TEACHES"
            items={['Backward induction and subgame-perfect equilibrium', 'Why the “rational” offer is almost nothing', 'Fairness as a payoff: inequity aversion (Fehr–Schmidt)', 'The strategy method: deciding before you see the move']}
          />
        </div>
      )}

      <div>
        {shown < panels.length ? (
          <button className="btn-ghost" onClick={advance}>
            NEXT PANEL ▶
          </button>
        ) : (
          <NextStageButton label="PLAY" />
        )}
      </div>
    </div>
  );
}

function Blank() {
  return <div className="hidden min-h-[16rem] border-4 border-dashed border-panel2 md:block" />;
}
