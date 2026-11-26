import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MathBlock, type MathLine } from '../../components/MathBlock';
import { Narration, Panel } from '../../components/comic';
import { SectionTitle, Slider, Stat, Toggle } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { SERIES, axis, grid, legend, tooltip } from '../../components/chartTheme';
import { num } from '../../components/texfmt';
import { ATTRITION, asymmetricHazards, curves, solveSymmetric } from '../../engine/attrition';
import type { AttState } from './AttritionGame';

export function AttSolve({ st }: { st: AttState }) {
  const { V, c } = ATTRITION;
  const s = solveSymmetric(V, c);
  const g = st.escalating ? st.g : 0;
  const data = useMemo(() => curves({ tMax: 30, dt: 0.5, c0: c, g, V }), [c, g, V]);
  const [asym, setAsym] = useState(false);
  const [cB, setCB] = useState(40);
  const [VB, setVB] = useState(V);
  const h = asymmetricHazards(c, V, cB, VB);

  const lines: MathLine[] = [
    { tex: [`\\text{In a tiny moment } dt:\\quad \\text{wait} \\Rightarrow \\text{pay } c\\,dt`, `\\text{win } V \\text{ with prob. } \\lambda\\,dt`], note: 'λ is the rival’s quitting rate (hazard): the chance they give in right now, per minute.' },
    { tex: `\\text{Indifferent between waiting and quitting} \\iff \\lambda V = c`, note: 'If you weren’t indifferent you wouldn’t randomise; you’d always wait or always quit.' },
    { tex: [`\\lambda^* = \\frac{c}{V} = \\frac{${c}}{${V}} = ${num(s.lambda)} \\text{ per minute}`, `\\Rightarrow \\text{mean } \\frac{1}{\\lambda} = ${num(s.meanPerPlayer)} \\text{ min}`] },
    { tex: [`\\text{Standoff ends at the first quit: rate } 2\\lambda`, `\\Rightarrow E[T] = \\frac{1}{2\\lambda} = ${num(s.expectedStandoff)} \\text{ min}`] },
    { tex: `\\text{Total waiting cost} = 2c \\cdot E[T] = 2\\cdot ${c}\\cdot ${num(s.expectedStandoff)} = ${num(s.expectedTotalCost)} = V`, note: 'Full rent dissipation: on average the fight burns the entire prize. Expected payoff of each player: ₹0.' },
    { tex: `P(\\text{both still waiting at } 10) = e^{-2\\lambda\\cdot 10} = e^{-2} \\approx ${s.bothWaitingAt(10).toFixed(3)}` },
  ];
  const esc: MathLine[] = [
    { tex: `c(t) = c_0 + g\\,t \\Rightarrow \\lambda(t) = \\frac{c(t)}{V}`, note: 'As the trash piles up, quitting gets more attractive every minute.' },
    { tex: `S(t) = \\exp\\!\\left(-\\frac{c_0 t + g t^2/2}{V}\\right)`, note: 'Survival: probability one player is still holding out at time t.' },
  ];
  const asy: MathLine[] = [
    { tex: `\\lambda_A = \\frac{c_B}{V_B}, \\qquad \\lambda_B = \\frac{c_A}{V_A}`, note: 'Your quitting rate keeps your OPPONENT indifferent, so it is set by their cost and value, not yours.' },
    { tex: `c_B = ${cB},\\quad  V_B = ${VB}:\\quad \\lambda_A = ${num(+h.lambdaA.toFixed(3))},\\quad  \\lambda_B = ${num(+h.lambdaB.toFixed(3))}` },
  ];

  return (
    <div>
      <SectionTitle kicker="SOLVE" title="The rate of giving up" />
      <div className="grid grid-cols-1 gap-6">
        <MathBlock title="Symmetric mixed equilibrium" lines={lines} />
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="λ*/min" value={num(s.lambda)} color="#ffcc4d" />
            <Stat label="E[standoff]" value={`${num(s.expectedStandoff)}m`} color="#5aa7ff" />
            <Stat label="Burned" value={`₹${num(s.expectedTotalCost)}`} color="#ef5a4b" />
          </div>
          <Toggle checked={st.escalating} onChange={st.setEscalating} label="Escalating cost (trash piles up)" sub="c(t) = c₀ + g·t" />
          {st.escalating && <Slider label="g: extra ₹/min each minute" value={st.g} min={1} max={10} step={1} onChange={st.setG} format={(v) => String(v)} />}
          {st.escalating && <MathBlock title="Escalating cost" lines={esc} />}
          <Toggle checked={asym} onChange={setAsym} label="Asymmetric roommates" sub="B has a different cost or value" />
          {asym && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Slider label="B's cost c_B" value={cB} min={5} max={80} step={5} onChange={setCB} format={(v) => `₹${v}`} />
                <Slider label="B's value V_B" value={VB} min={50} max={400} step={10} onChange={setVB} format={(v) => `₹${v}`} />
              </div>
              <MathBlock key={`${cB}-${VB}`} title="Asymmetric rates" lines={asy} />
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <Panel className="p-4">
          <h3 className="text-sm">SURVIVAL: STILL WAITING AT TIME t</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="t" type="number" domain={[0, 30]} ticks={[0, 5, 10, 15, 20, 25, 30]} {...axis} />
                <YAxis {...axis} width={50} domain={[0, 1]} />
                <Tooltip {...tooltip} formatter={(v: number) => v.toFixed(3)} labelFormatter={(l) => `t = ${l} min`} />
                <Legend {...legend} />
                <Line dataKey="survival" name="One player S(t)" stroke={SERIES.blue} strokeWidth={3} dot={false} isAnimationActive={false} />
                <Line dataKey="standoff" name="Both still waiting S(t)²" stroke={SERIES.gold} strokeWidth={3} strokeDasharray="8 5" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="p-4">
          <h3 className="text-sm">HAZARD RATE λ(t)</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="t" type="number" domain={[0, 30]} ticks={[0, 5, 10, 15, 20, 25, 30]} {...axis} />
                <YAxis {...axis} width={50} domain={[0, 'auto']} />
                <Tooltip {...tooltip} formatter={(v: number) => `${v.toFixed(3)} /min`} labelFormatter={(l) => `t = ${l} min`} />
                <Line dataKey="hazard" name="λ(t)" stroke={SERIES.red} strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Narration className="mt-4" current={false}>
            {st.escalating ? 'With escalating costs the hazard climbs in a straight line: the longer it goes, the more likely someone cracks.' : 'With a constant cost the hazard is flat: having waited 9 minutes tells you nothing about minute 10. The process is memoryless.'}
          </Narration>
        </Panel>
      </div>
      <div className="mt-6">
        <NextStageButton label="SIMULATE" />
      </div>
    </div>
  );
}
