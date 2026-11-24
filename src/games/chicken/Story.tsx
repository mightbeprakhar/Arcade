import { useEffect } from 'react';
import { BridgeScene } from './BridgeScene';
import { Caption, SectionTitle, Toggle } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { useBuildSteps } from '../../state/presenter';
import { speak, speechSupported, stopSpeaking } from '../../state/speech';
import { CHICKEN_BASE } from '../../engine/chicken';
import type { ChickenState } from './ChickenGame';

export function ChickenStory({ st, accent }: { st: ChickenState; accent: string }) {
  const { bothSwerve, swerveLoss, straightWin, crashCar } = CHICKEN_BASE;
  const captions = [
    'Midnight. A single-lane bridge over the river. Two drivers enter from opposite ends at full speed.',
    'Neither wants to look like a coward. Whoever swerves into the ditch loses face; whoever holds the line wins bragging rights.',
    `If both swerve, nobody wins or loses (${bothSwerve}). Swerve while the other holds: ${swerveLoss}. Hold while the other swerves: +${straightWin}.`,
    `If both hold the line… they crash. ${crashCar} each. Nobody wants that — but nobody wants to blink first either.`,
    'Half the room drives Car A. The other half drives Car B. You decide at the same time — no talking across the aisle.',
  ];
  const { shown, advance } = useBuildSteps(captions.length, 1);
  useEffect(() => {
    if (st.voice) speak(captions[shown - 1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, st.voice]);
  useEffect(() => () => stopSpeaking(), []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <SectionTitle kicker="Story" title="The Bridge at Midnight" color={accent} />
        <div className="overflow-hidden rounded-2xl border border-ink-700">
          <BridgeScene phase={shown >= 2 ? 'approach' : 'idle'} a={null} b={null} truck={false} />
        </div>
        <div className="mt-4 space-y-3">
          {captions.slice(0, shown).map((c, i) => (
            <Caption key={i} color={i === shown - 1 ? accent : '#2e3958'}>
              {c}
            </Caption>
          ))}
        </div>
        {shown < captions.length && (
          <button className="btn-ghost mt-3" onClick={advance}>
            Next caption <span className="kbd">→</span>
          </button>
        )}
      </div>
      <div className="space-y-4">
        <div className="card">
          <div className="label mb-3">Narration</div>
          <div className="space-y-3">
            <Toggle checked={true} onChange={() => {}} label="On-screen captions" sub="Always on in the classroom" />
            {speechSupported() ? (
              <Toggle
                checked={st.voice}
                onChange={(v) => {
                  st.setVoice(v);
                  if (!v) stopSpeaking();
                }}
                label="Voiceover"
                sub="Reads each caption aloud (Web Speech API)"
              />
            ) : (
              <p className="text-base text-slate-400">Voiceover isn’t supported in this browser.</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="label mb-2">What this level teaches</div>
          <ul className="list-disc space-y-1.5 pl-5 text-lg text-slate-200">
            <li>Two pure equilibria — and a coordination problem over which one</li>
            <li>Mixed strategies: being unpredictable on purpose</li>
            <li>Why your mix is set by your <em>opponent’s</em> payoffs</li>
            <li>Risk dominance: which equilibrium is “safer”</li>
          </ul>
        </div>
        {shown >= captions.length && <NextStageButton label="Play" />}
      </div>
    </div>
  );
}
