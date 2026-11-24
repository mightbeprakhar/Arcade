import { motion } from 'framer-motion';
import { Caption, SectionTitle } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { useBuildSteps } from '../../state/presenter';
import { PD, ROUNDS, payoffs } from '../../engine/advertising';

function Shop({ name, color, ad }: { name: string; color: string; ad: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="mb-2 rounded-lg px-3 py-1 text-lg font-bold text-ink-950"
        style={{ background: color }}
        animate={ad ? { scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] } : { scale: 1 }}
        transition={{ repeat: ad ? Infinity : 0, duration: 1.4 }}
      >
        {ad ? '📣 50% OFF!' : '☕'}
      </motion.div>
      <div className="w-36 rounded-t-2xl border-4 border-b-0 pt-2 text-center sm:w-44" style={{ borderColor: color }}>
        <div className="font-display text-xl font-bold" style={{ color }}>
          {name}
        </div>
        <div className="mx-auto mt-2 grid h-20 w-24 place-items-center rounded-t-lg bg-ink-800 text-4xl">☕</div>
      </div>
    </div>
  );
}

export function AdStory({ accent }: { accent: string }) {
  const [ss] = payoffs('S', 'S');
  const [as, sa] = payoffs('A', 'S');
  const [aa] = payoffs('A', 'A');
  const captions = [
    'Two coffee shops face each other across the campus gate: Brew Theory and Bean There.',
    `Every week each owner decides: spend on an advertising blitz (Ad) or save the money (Save).`,
    `Both save: steady business, ₹${ss}k profit each. One advertises: it steals customers — ₹${as}k vs ₹${sa}k.`,
    `Both advertise: the ads cancel out, but both paid for them — ₹${aa}k each.`,
    `You run Brew Theory for ${ROUNDS} weeks against a rival with a fixed playbook. Can you build trust — or should you?`,
  ];
  const { shown, advance } = useBuildSteps(captions.length, 1);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <SectionTitle kicker="Story" title="The Coffee Wars" color={accent} />
        <div className="card flex items-end justify-around gap-4 bg-gradient-to-b from-ink-800 to-ink-900 py-8">
          <Shop name="Brew Theory" color="#22d3ee" ad={shown >= 3} />
          <div className="mb-6 text-3xl text-slate-500">vs</div>
          <Shop name="Bean There" color="#f472b6" ad={shown >= 4} />
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
          <div className="label mb-2">Weekly profit (₹ thousands)</div>
          <div className="grid grid-cols-2 gap-2 text-center font-mono text-lg">
            {[
              ['T · temptation', PD.T],
              ['R · reward', PD.R],
              ['P · punishment', PD.P],
              ['S · sucker', PD.S],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-ink-800 p-3">
                <div className="text-sm text-slate-400">{l}</div>
                <div className="text-3xl font-semibold" style={{ color: accent }}>
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="label mb-2">What this level teaches</div>
          <ul className="list-disc space-y-1.5 pl-5 text-lg">
            <li>Dominant strategies that lead everyone somewhere worse</li>
            <li>How repetition and reciprocity can rescue cooperation</li>
            <li>Why noise (mistakes) is poison for strict reciprocity</li>
            <li>Finite vs infinite horizons</li>
          </ul>
        </div>
        {shown >= captions.length && <NextStageButton label="Play" />}
      </div>
    </div>
  );
}
