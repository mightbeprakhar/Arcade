import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face, icons, trashBag } from '../../components/pixel/sprites';
import { Notes } from '../../components/ui';
import { useBuildSteps } from '../../state/presenter';
import { ATTRITION } from '../../engine/attrition';

export function AttStory() {
  const { V, c } = ATTRITION;
  const panels = [
    'Two roommates. One kitchen bin. It has been full since yesterday.',
    'Whoever cracks first has to carry it down four floors.',
    `Not carrying it is worth ₹${V} of comfort to each of them.`,
    `But every minute of the standoff costs each of them ₹${c} in smell, guilt and glaring.`,
    'The class is roommate A. Every minute you vote: keep waiting, or give in.',
  ];
  const { shown, advance } = useBuildSteps(panels.length, 1);
  const A = face(shown >= 4 ? 'grim' : 'smug', C.brown, C.skin, C.blueD, 'short');
  const B = face(shown >= 4 ? 'grim' : 'smug', C.K, C.skin2, C.redD, 'long');

  return (
    <div className="space-y-6">
      <span className="chip text-gold">STORY · PANEL {shown}/{panels.length}</span>
      <Panel className="bg-[#2d2a52] p-6">
        <Narration className="max-w-2xl">{panels[0]}</Narration>
        <div className="mt-6 flex items-end justify-center gap-2">
          {Array.from({ length: 2 + Math.min(shown, 5) * 2 }, (_, i) => (
            <Sprite key={i} {...trashBag} px={6} />
          ))}
          <Sprite {...icons.bin} px={10} />
        </div>
      </Panel>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {shown >= 2 ? (
          <Panel reveal tone="blue" className="flex min-h-[16rem] flex-col justify-between p-4">
            <Narration current={shown === 2}>{panels[1]}</Narration>
            <div className="flex items-end gap-4">
              <Sprite {...A} px={7} />
              <Bubble side="bottom-left">Not it.</Bubble>
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
        {shown >= 3 ? (
          <Panel reveal tone="red" className="flex min-h-[16rem] flex-col justify-between p-4">
            <Narration current={shown === 3}>{panels[2]}</Narration>
            <div className="flex items-end justify-end gap-4">
              <Bubble side="bottom-right">Definitely not it.</Bubble>
              <Sprite {...B} px={7} flip />
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
        {shown >= 4 ? (
          <Panel reveal tone="night" className="flex min-h-[16rem] flex-col justify-between gap-4 p-4">
            <Narration current={shown === 4}>{panels[3]}</Narration>
            <div className="grid place-items-center">
              <ActionWord text={`-₹${c}/MIN`} size={28} />
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
      </div>
      {shown >= 5 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Panel reveal tone="gold" className="p-6">
            <div className="font-pixel text-sm">YOUR MOVE, EVERY MINUTE</div>
            <p className="mt-2 text-2xl font-bold">{panels[4]}</p>
          </Panel>
          <Notes
            title="WHAT THIS GAME TEACHES"
            items={['War of attrition: waiting games in continuous time', 'Mixed strategies as a constant “hazard rate”', 'Rent dissipation: fighting burns the whole prize', 'Why your quitting rate depends on your opponent’s costs']}
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
