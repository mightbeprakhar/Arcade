import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face } from '../../components/pixel/sprites';
import { Notes, rupeeK } from '../../components/ui';
import { useBuildSteps } from '../../state/presenter';
import { PD, ROUNDS, payoffs } from '../../engine/advertising';
import { PixelShop } from './Shop';

/** Game 3 opens as a pixel comic strip about two coffee shops. */
export function AdStory({}: { accent?: string }) {
  const [ss] = payoffs('S', 'S');
  const [as, sa] = payoffs('A', 'S');
  const [aa] = payoffs('A', 'A');
  const panels = [
    'Two coffee shops face each other across the campus gate: Brew Theory and Bean There.',
    'Every week each owner decides: spend on an ad blitz (Ad) or keep the money (Save).',
    `Both save: steady business, ${rupeeK(ss)} profit each. Advertise alone and you steal customers: ${rupeeK(as)} for you, ${rupeeK(sa)} for them.`,
    `Both advertise: the ads cancel out, but both paid for them. ${rupeeK(aa)} each.`,
    `The class runs Brew Theory for ${ROUNDS} weeks against a rival with a fixed playbook. Build trust, or strike first?`,
  ];
  const { shown, advance } = useBuildSteps(panels.length, 1);
  const owner = face(shown >= 4 ? 'grim' : 'smug', C.brown, C.skin, C.blueD, 'short');
  const rival = face(shown >= 4 ? 'grim' : 'happy', C.K, C.skin2, C.redD, 'long');

  return (
    <div className="space-y-6">
      <span className="chip text-gold">STORY · PANEL {shown}/{panels.length}</span>

      <Panel className="halftone-light bg-[#241f52] p-6">
        <Narration className="max-w-2xl">{panels[0]}</Narration>
        <div className="mt-6 flex flex-wrap items-end justify-around gap-6">
          <PixelShop name="Brew Theory" color={C.blue} ad={shown >= 3} px={5} />
          {shown >= 4 && <ActionWord text="AD WAR!" size={36} />}
          <PixelShop name="Bean There" color={C.red} ad={shown >= 4} px={5} />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {shown >= 2 ? (
          <Panel reveal tone="blue" className="flex min-h-[16rem] flex-col justify-between p-4">
            <Narration current={shown === 2}>{panels[1]}</Narration>
            <div className="flex items-end gap-4">
              <Sprite {...owner} px={6} title="Brew Theory's owner" />
              <Bubble side="bottom-left">If I advertise, I steal her customers.</Bubble>
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
        {shown >= 3 ? (
          <Panel reveal tone="night" className="flex min-h-[16rem] flex-col justify-between gap-4 p-4">
            <Narration current={shown === 3}>{panels[2]}</Narration>
            <div className="grid grid-cols-4 gap-2 text-center">
              {(
                [
                  ['T', PD.T, 'tempt'],
                  ['R', PD.R, 'reward'],
                  ['P', PD.P, 'punish'],
                  ['S', PD.S, 'sucker'],
                ] as const
              ).map(([k, v, l]) => (
                <div key={k} className="border-4 border-black bg-deep p-2">
                  <div className="font-pixel text-xs text-gold">{k}</div>
                  <div className="font-mono text-5xl leading-none">{v}</div>
                  <div className="text-sm text-ink-3">{l}</div>
                </div>
              ))}
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
        {shown >= 4 ? (
          <Panel reveal tone="red" className="flex min-h-[16rem] flex-col justify-between p-4">
            <Narration current={shown === 4}>{panels[3]}</Narration>
            <div className="flex items-end justify-end gap-4">
              <Bubble side="bottom-right">She started it.</Bubble>
              <Sprite {...rival} px={6} flip title="Bean There's owner" />
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
      </div>

      {shown >= 5 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Panel reveal tone="gold" className="p-6">
            <div className="font-pixel text-sm">YOUR MISSION</div>
            <p className="mt-3 text-2xl font-bold">{panels[4]}</p>
          </Panel>
          <Notes
            title="WHAT THIS GAME TEACHES"
            items={['Dominant strategies that lead everyone somewhere worse', 'How repetition and reciprocity can rescue cooperation', 'Why mistakes (noise) poison strict reciprocity', 'Finite vs infinite horizons']}
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
