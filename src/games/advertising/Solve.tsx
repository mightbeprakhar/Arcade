import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PayoffMatrix } from '../../components/PayoffMatrix';
import { MathBlock, type MathLine } from '../../components/MathBlock';
import { SectionTitle, Slider, Stat } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { SERIES, axis, grid, legend, tooltip } from '../../components/chartTheme';
import { num } from '../../components/texfmt';
import { useBuildSteps } from '../../state/presenter';
import { PD, ROUNDS, cooperateValue, defectValue, grimDeltaThreshold, solveStageGame } from '../../engine/advertising';

const LAYERS = ['Stage game', 'Best responses', 'Nash equilibrium'];

export function AdSolve({ accent }: { accent: string }) {
  const s = useMemo(() => solveStageGame(), []);
  const { shown, advance } = useBuildSteps(LAYERS.length, 1, 0);
  const { T, R, P, S } = PD;
  const dStar = grimDeltaThreshold();
  const [delta, setDelta] = useState(0.7);
  const curve = useMemo(
    () =>
      Array.from({ length: 19 }, (_, i) => {
        const d = i * 0.05;
        return { d: +d.toFixed(2), coop: +cooperateValue(d).toFixed(1), defect: +defectValue(d).toFixed(1) };
      }),
    [],
  );
  const ne = s.ne[0];
  const neVal = s.game.payoffs[ne.r][ne.c];
  const pb = s.paretoBetter!;
  const pbVal = s.game.payoffs[pb.r][pb.c];

  const dominance: MathLine[] = [
    { tex: `\\text{Rival Saves: } u(\\text{Ad}) = T = ${T} \\quad >\\quad  u(\\text{Save}) = R = ${R}` },
    { tex: `\\text{Rival Ads: } u(\\text{Ad}) = P = ${P} \\quad >\\quad  u(\\text{Save}) = S = ${S}` },
    { tex: `\\Rightarrow\\quad  \\text{Ad strictly dominates Save} \\Rightarrow \\text{NE} = (\\text{Ad},\\text{Ad}) = (${neVal[0]}, ${neVal[1]})`, note: 'Each shop advertises whatever the other does.' },
    { tex: `(\\text{Save},\\text{Save}) = (${pbVal[0]}, ${pbVal[1]}) \\text{ is better for both} \\Rightarrow \\text{NE is Pareto-dominated}`, note: 'Individually rational, collectively worse: the dilemma.' },
    { tex: `T > R > P > S:\\quad  ${T} > ${R} > ${P} > ${S}, \\qquad 2R = ${2 * R} > T + S = ${T + S}`, note: 'The two conditions that make it a Prisoner’s Dilemma (the second rules out taking turns).' },
  ];
  const finite: MathLine[] = [
    { tex: `\\text{Week } ${ROUNDS}: \\text{ no future} \\Rightarrow \\text{one-shot PD} \\Rightarrow \\text{Ad}`, note: 'Everyone knows week 20 is the last one.' },
    { tex: `\\text{Week } ${ROUNDS - 1}: \\text{ week ${ROUNDS} is Ad regardless} \\Rightarrow \\text{Ad}` },
    { tex: `\\cdots \\Rightarrow \\text{Week } 1: \\text{Ad}` },
    { tex: `\\text{SPNE: Ad every week} \\Rightarrow ${ROUNDS} \\times P = ${ROUNDS * P}`, note: `vs ${ROUNDS * R} if both had saved every week.` },
  ];
  const infinite: MathLine[] = [
    { tex: `\\text{Cooperate forever: } R + \\delta R + \\delta^2 R + \\cdots = \\frac{R}{1-\\delta}`, note: 'δ = how much next week matters (or the chance there is a next week).' },
    { tex: `\\text{Deviate once vs Grim: } T + \\frac{\\delta P}{1-\\delta}` },
    { tex: `\\frac{R}{1-\\delta} \\ge T + \\frac{\\delta P}{1-\\delta} \\iff \\delta \\ge \\frac{T-R}{T-P} = \\frac{${T}-${R}}{${T}-${P}} = ${num(dStar)}` },
  ];

  return (
    <div>
      <SectionTitle kicker="Solve" title="Why both shops end up advertising" color={accent} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="card">
          <div className="mb-4 text-base text-ink-3">
            Step {shown} of {LAYERS.length}: <span className="text-ink">{LAYERS[shown - 1]}</span>
          </div>
          <PayoffMatrix game={s.game} bestResponses={shown >= 2} nash={shown >= 3} format={(n) => `${n}`} />
          <p className="mt-3 text-center text-base text-ink-2">Payoffs in ₹ thousands per week (Shop A, Shop B).</p>
          {shown < LAYERS.length && (
            <button className="btn-ghost mt-3" onClick={advance}>
              Next layer <span className="kbd">→</span>
            </button>
          )}
        </div>
        <div className="space-y-6">
          <MathBlock title="One week: dominant strategy" lines={dominance} accent={accent} />
          <MathBlock title={`Finite horizon: ${ROUNDS} known weeks`} lines={finite} accent={accent} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <MathBlock title="Infinite horizon: Grim Trigger" lines={infinite} accent={accent} />
        <div className="card">
          <div className="label mb-2">Is cooperation worth it at this δ?</div>
          <Slider label="δ (patience)" value={delta} min={0} max={0.95} step={0.01} onChange={setDelta} format={(v) => v.toFixed(2)} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Cooperate" value={`₹${cooperateValue(delta).toFixed(0)}k`} color={SERIES.pen} />
            <Stat label="Deviate" value={`₹${defectValue(delta).toFixed(0)}k`} color={SERIES.graphite} />
          </div>
          <div className={`mt-3 text-lg ${delta >= dStar ? 'text-teal' : 'text-red'}`}>
            {delta >= dStar ? `δ ≥ ${dStar}: cooperation is self-enforcing.` : `δ < ${dStar}: the one-time gain from Ad wins.`}
          </div>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="d" type="number" domain={[0, 0.9]} ticks={[0, 0.25, 0.5, 0.75, 0.9]} {...axis} />
                <YAxis {...axis} width={60} tickFormatter={(v: number) => `₹${v}k`} />
                <Tooltip {...tooltip} formatter={(v: number) => `₹${v}k`} labelFormatter={(l) => `δ = ${l}`} />
                <Legend {...legend} />
                <ReferenceLine x={dStar} stroke={SERIES.mark} strokeDasharray="4 4" label={{ value: `δ* = ${dStar}`, fill: SERIES.mark, fontSize: 16, position: 'top' }} />
                <ReferenceLine x={delta} stroke="rgba(246,240,220,0.5)" />
                <Line dataKey="coop" name="Cooperate forever" stroke={SERIES.pen} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line dataKey="defect" name="Deviate, then punished" stroke={SERIES.graphite} strokeDasharray="6 4" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <NextStageButton label="Run the tournament" />
      </div>
    </div>
  );
}
