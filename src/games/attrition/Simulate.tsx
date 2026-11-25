import { useMemo, useState } from 'react';
import { Bar, CartesianGrid, Legend, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Narration, Panel } from '../../components/comic';
import { SectionTitle, Slider, Stat } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { SERIES, axis, grid, legend, tooltip } from '../../components/chartTheme';
import { ATTRITION, simulateStandoffs, solveSymmetric } from '../../engine/attrition';
import { mulberry32 } from '../../engine/random';

export function AttSimulate() {
  const { V, c } = ATTRITION;
  const s = solveSymmetric(V, c);
  const [n, setN] = useState(2000);
  const [seed, setSeed] = useState(3);
  const sim = useMemo(() => simulateStandoffs(n, s.lambda, s.lambda, mulberry32(seed)), [n, seed, s.lambda]);
  const hist = useMemo(() => {
    const bins = Array.from({ length: 16 }, (_, i) => ({ t: i, count: 0, theory: 0 }));
    sim.lengths.forEach((L) => {
      const b = Math.min(15, Math.floor(L));
      bins[b].count++;
    });
    const r = 2 * s.lambda;
    bins.forEach((b, i) => (b.theory = +(n * (Math.exp(-r * i) - (i === 15 ? 0 : Math.exp(-r * (i + 1))))).toFixed(1)));
    return bins;
  }, [sim, n, s.lambda]);
  const avgBurn = 2 * c * sim.meanLength;

  return (
    <div>
      <SectionTitle kicker="SIMULATE" title="Every flat in the hostel">
        Thousands of standoffs where both roommates play the equilibrium. How long do they last, and how much do they burn?
      </SectionTitle>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel className="p-4">
          <h3 className="text-sm">HOW LONG STANDOFFS LAST (MINUTES)</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hist} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="t" {...axis} tickFormatter={(v: number) => (v === 15 ? '15+' : String(v))} />
                <YAxis {...axis} width={60} />
                <Tooltip {...tooltip} labelFormatter={(l) => `${l}–${Number(l) + 1} min`} />
                <Legend {...legend} />
                <Bar dataKey="count" name="Simulated" fill={SERIES.blue} stroke="#0f0d22" strokeWidth={2} isAnimationActive={false} />
                <Line dataKey="theory" name="Theory (rate 2λ)" stroke={SERIES.gold} strokeWidth={3} strokeDasharray="8 5" dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <div className="space-y-4">
          <Slider label="Standoffs" value={n} min={200} max={20000} step={200} onChange={setN} format={(v) => v.toLocaleString('en-IN')} />
          <button className="btn-ghost" onClick={() => setSeed((x) => x + 1)}>
            ↺ RUN AGAIN
          </button>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Avg length" value={`${sim.meanLength.toFixed(2)}m`} sub={`theory ${s.expectedStandoff}m`} color="#5aa7ff" />
            <Stat label="Avg burned" value={`₹${avgBurn.toFixed(0)}`} sub={`prize ₹${V}`} color="#ef5a4b" />
            <Stat label="A wins" value={`${(sim.pAWins * 100).toFixed(1)}%`} sub="theory 50%" color="#47c9a8" />
            <Stat label="Still at 10m" value={`${((sim.lengths.filter((L) => L >= 10).length / n) * 100).toFixed(1)}%`} sub={`theory ${(s.bothWaitingAt(10) * 100).toFixed(1)}%`} color="#ffcc4d" />
          </div>
          <Narration current={false}>The money burned on waiting averages out to the whole prize. Nobody gains in expectation; the fight eats the rent.</Narration>
        </div>
      </div>
      <div className="mt-6">
        <NextStageButton label="DEBRIEF" />
      </div>
    </div>
  );
}
