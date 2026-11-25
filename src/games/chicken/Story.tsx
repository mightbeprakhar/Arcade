import { useEffect } from 'react';
import { BridgeScene } from './BridgeScene';
import { NextStageButton } from '../../components/GameShell';
import { ActionWord, Bubble, Narration, Panel } from '../../components/comic';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face } from '../../components/pixel/sprites';
import { Toggle } from '../../components/ui';
import { useBuildSteps } from '../../state/presenter';
import { speak, speechSupported, stopSpeaking } from '../../state/speech';
import { CHICKEN_BASE } from '../../engine/chicken';
import type { ChickenState } from './ChickenGame';

/** Level 2 opens as a pixel comic strip. Each → reveals the next panel. */
export function ChickenStory({ st }: { st: ChickenState; accent?: string }) {
  const { bothSwerve, swerveLoss, straightWin, crashCar } = CHICKEN_BASE;
  const panels = [
    'Midnight. A single-lane bridge over the river. Two drivers enter from opposite ends at full speed.',
    'Whoever swerves into the railing loses face.',
    'Whoever holds the line wins the bragging rights.',
    `Both swerve: ${bothSwerve} each. Swerve alone: ${swerveLoss}. Hold while they swerve: +${straightWin}. Both hold the line…`,
    'Left half of the room drives the blue car. Right half drives the red car. You decide at the same time, with no talking across the aisle.',
  ];
  const { shown, advance } = useBuildSteps(panels.length, 1);
  useEffect(() => {
    if (st.voice) speak(panels[shown - 1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, st.voice]);
  useEffect(() => () => stopSpeaking(), []);

  const A = face('grim', C.brown);
  const B = face('smug', C.K);
  const shocked = face('shocked', C.brown);
  const shocked2 = face('shocked', C.K);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="chip text-gold">STORY · PANEL {shown}/{panels.length}</span>
        {speechSupported() && (
          <div className="w-full max-w-xs">
            <Toggle
              checked={st.voice}
              onChange={(v) => {
                st.setVoice(v);
                if (!v) stopSpeaking();
              }}
              label="Voiceover"
              sub="Reads each panel aloud"
            />
          </div>
        )}
      </div>

      <Panel className="p-0">
        <BridgeScene phase={shown >= 2 ? 'approach' : 'idle'} a={null} b={null} truck={false} />
        <Narration className="absolute left-4 top-4 max-w-xl">{panels[0]}</Narration>
      </Panel>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {shown >= 2 ? (
          <Panel tone="blue" className="flex min-h-[18rem] flex-col justify-between p-4">
            <Narration current={shown === 2}>{panels[1]}</Narration>
            <div className="flex items-end justify-between gap-4">
              <Sprite {...A} px={10} title="Driver A" />
              <Bubble side="bottom-left">Swerve? Me? Never.</Bubble>
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
        {shown >= 3 ? (
          <Panel tone="red" className="flex min-h-[18rem] flex-col justify-between p-4">
            <Narration current={shown === 3}>{panels[2]}</Narration>
            <div className="flex items-end justify-between gap-4">
              <Bubble side="bottom-right">Hold the line and I win.</Bubble>
              <Sprite {...B} px={10} flip title="Driver B" />
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
        {shown >= 4 ? (
          <Panel tone="night" className="flex min-h-[18rem] flex-col justify-between p-4">
            <Narration current={shown === 4}>{panels[3]}</Narration>
            <div className="relative flex items-end justify-between">
              <Sprite {...shocked} px={8} title="Driver A, shocked" />
              <ActionWord text="CRASH!" size={32} className="-my-4" />
              <Sprite {...shocked2} px={8} flip title="Driver B, shocked" />
            </div>
            <div className="text-center font-pixel text-sm text-red">
              {crashCar} EACH
            </div>
          </Panel>
        ) : (
          <Blank />
        )}
      </div>

      {shown >= 5 && (
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]">
          <Panel tone="blue" className="grid place-items-center p-6 text-center">
            <div className="font-pixel text-lg text-black">◀ LEFT SIDE</div>
            <div className="mt-2 text-2xl font-bold text-black">You drive the blue car</div>
          </Panel>
          <Narration className="self-center text-center md:max-w-md">{panels[4]}</Narration>
          <Panel tone="red" className="grid place-items-center p-6 text-center">
            <div className="font-pixel text-lg text-black">RIGHT SIDE ▶</div>
            <div className="mt-2 text-2xl font-bold text-black">You drive the red car</div>
          </Panel>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
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
  return <div className="hidden min-h-[18rem] border-4 border-dashed border-panel2 md:block" />;
}
