import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Narration, Panel } from '../../components/comic';
import { SectionTitle, Slider, Stat } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { SERIES, axis, grid, legend, tooltip } from '../../components/chartTheme';
import { euCurve, leafPayoff } from '../../engine/startup';
import { mulberry32 } from '../../engine/random';
import type { StartupState } from './StartupGame';

export function StartupSimulate({ st }: { st: StartupState }) {
  const data = useMemo(() => {
    const a = euCurve(false, st.r);
    const b = euCurve(true, st.r);
    return a.map((x, i) => ({ p: x.p, empty: +x.uEnter.toFixed(3), credible: +b[i].uEnter.toFixed(3) }));
  }, [st.r]);
  const [n, setN] = useState(1000);
  const [seed, setSeed] = useState(1);
  const sim = useMemo(() => {
    const rng = mulberry32(seed);
    let total = 0;
    let wars = 0;
    for (let i = 0; i < n; i++) {
      const d = rng() < st.p ? 'High' : 'Low';
      const c = d === 'High' ? st.sol.high.choice : st.sol.low.choice;
      if (c === 'Fight') wars++;
      total += leafPayoff(d, c, st.credible)[0];
    }
    return { avg: total / n, wars };
  }, [n, seed, st.p, st.credible, st.sol]);

  return (
    <div>
      <SectionTitle kicker="SIMULATE" title="A thousand startups">
        Every possible market size at once, and a thousand founders who all enter. Change the settings in Solve and these update.
      </SectionTitle>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel className="p-4">
          <h3 className="text-sm">EXPECTED {st.r > 0 ? 'UTILITY' : 'PAYOFF'} OF ENTERING VS P(HIGH)</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="p" type="number" domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} {...axis} />
                <YAxis {...axis} width={50} />
                <Tooltip {...tooltip} labelFormatter={(l) => `P(High) = ${Number(l).toFixed(2)}`} />
                <Legend {...legend} />
                <ReferenceLine y={0} stroke="rgba(246,240,220,0.6)" label={{ value: 'Stay out = 0', fill: '#d4cdee', fontSize: 18, position: 'insideBottomRight' }} />
                <ReferenceLine x={st.p} stroke={SERIES.gold} strokeDasharray="6 4" />
                <Line dataKey="empty" name="Empty threat" stroke={SERIES.teal} strokeWidth={3} dot={false} isAnimationActive={false} />
                <Line dataKey="credible" name="Credible threat" stroke={SERIES.red} strokeWidth={3} strokeDasharray="8 5" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Narration className="mt-4">
            Where a line is above zero, entering beats staying out. A credible threat pulls the line down and pushes the break-even probability right
            {st.r > 0 ? '; risk aversion pulls both lines down further.' : '.'}
          </Narration>
        </Panel>
        <div className="space-y-4">
          <Slider label="Founders who enter" value={n} min={100} max={10000} step={100} onChange={setN} format={(v) => v.toLocaleString('en-IN')} />
          <button className="btn-ghost" onClick={() => setSeed((s) => s + 1)}>
            ↺ RUN AGAIN
          </button>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Avg payoff" value={sim.avg.toFixed(2)} sub={`theory ${st.sol.euEnter.toFixed(2)}`} color="#5aa7ff" />
            <Stat label="Price wars" value={sim.wars.toLocaleString('en-IN')} sub={`of ${n.toLocaleString('en-IN')}`} color="#ef5a4b" />
          </div>
          <Narration current={false}>
            Individual founders win or lose on the coin flip; the average lands on the expected value. That's why backward induction uses the expectation.
          </Narration>
        </div>
      </div>
      <div className="mt-6">
        <NextStageButton label="DEBRIEF" />
      </div>
    </div>
  );
}
