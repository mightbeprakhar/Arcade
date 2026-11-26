import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face, garage, icons, tower } from '../../components/pixel/sprites';
import { Notes } from '../../components/ui';
import { useBuildSteps } from '../../state/presenter';
import { STARTUP } from '../../engine/startup';

const pct = (x: number) => `${Math.round(x * 100)}%`;

export function StartupStory() {
  const p = STARTUP.pHigh;
  const panels = [
    'A tiny startup eyes a market owned by one giant incumbent. Today the giant earns everything.',
    'The founder can enter the market, or stay out and keep building in the garage.',
    'The incumbent makes a loud threat: “Enter, and I start a price war.”',
    `But nobody knows how big the market really is. Demand comes out High with chance ${pct(p)}, Low with ${pct(1 - p)}: a coin flip by Nature.`,
    'The class is the founder. Is the threat real, or just talk?',
  ];
  const { shown, advance } = useBuildSteps(panels.length, 1);
  const founder = face(shown >= 3 ? 'scared' : 'happy', C.brown, C.skin, C.teal, 'spiky');
  const ceo = face('smug', '#a39bc9', C.skin2, '#2b2659', 'neat');

  return (
    <div className="space-y-6">
      <span className="chip text-gold">STORY · PANEL {shown}/{panels.length}</span>
      <Panel className="bg-[#241f52] p-6">
        <Narration className="max-w-2xl">{panels[0]}</Narration>
        <div className="mt-6 flex items-end justify-around">
          <div className="flex flex-col items-center gap-2">
            <Sprite {...garage} px={10} title="The startup's garage" />
            <span className="font-pixel text-xs text-teal">STARTUP</span>
          </div>
          <Sprite {...icons.rocket} px={8} />
          <div className="flex flex-col items-center gap-2">
            <Sprite {...tower} px={12} title="The incumbent's tower" />
            <span className="font-pixel text-xs text-red">MEGACORP</span>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {shown >= 2 ? (
          <Panel reveal tone="teal" className="flex min-h-[16rem] flex-col justify-between p-4">
            <Narration current={shown === 2}>{panels[1]}</Narration>
            <div className="flex items-end gap-4">
              <Sprite {...founder} px={7} title="The founder" />
              <Bubble side="bottom-left">A fortune… or flattened?</Bubble>
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
        {shown >= 3 ? (
          <Panel reveal tone="red" className="flex min-h-[16rem] flex-col justify-between p-4">
            <Narration current={shown === 3}>{panels[2]}</Narration>
            <div className="flex items-end justify-end gap-4">
              <Bubble side="bottom-right">Try it. I dare you.</Bubble>
              <Sprite {...ceo} px={7} flip title="The incumbent's CEO" />
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
        {shown >= 4 ? (
          <Panel reveal tone="night" className="flex min-h-[16rem] flex-col justify-between gap-4 p-4">
            <Narration current={shown === 4}>{panels[3]}</Narration>
            <div className="flex items-center justify-around">
              <div className="border-4 border-black bg-teal p-3 text-center text-black">
                <div className="font-pixel text-xs">HIGH</div>
                <div className="font-mono text-5xl leading-none">{pct(p)}</div>
              </div>
              <Sprite {...icons.coins} px={7} />
              <div className="border-4 border-black bg-red p-3 text-center text-black">
                <div className="font-pixel text-xs">LOW</div>
                <div className="font-mono text-5xl leading-none">{pct(1 - p)}</div>
              </div>
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
      </div>

      {shown >= 5 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Panel reveal tone="gold" className="p-6">
            <div className="flex items-center justify-between">
              <div className="font-pixel text-sm">YOUR CALL</div>
              <ActionWord text="ENTER?" size={24} />
            </div>
            <p className="mt-2 text-2xl font-bold">{panels[4]}</p>
          </Panel>
          <Notes
            title="WHAT THIS GAME TEACHES"
            items={['Sequential games with a chance move (Nature)', 'Credible vs non-credible threats', 'Backward induction with expected utility', 'How risk attitude changes the decision']}
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
