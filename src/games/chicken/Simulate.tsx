import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PEN, RED, SectionTitle, Slider, Stat } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { SERIES, axis, grid, legend, tooltip } from '../../components/chartTheme';
import { expectedPayoffs } from '../../engine/bimatrix';
import { simulateEncounters, type ChickenSolution } from '../../engine/chicken';
import { mulberry32 } from '../../engine/random';

const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;

export function ChickenSimulate({ sol, accent }: { sol: ChickenSolution; accent: string }) {
  const g = sol.game;
  const [pA, setPA] = useState(sol.mixed.rowP1);
  const [pB, setPB] = useState(sol.mixed.colP1);
  const [n, setN] = useState(2000);
  const [seed, setSeed] = useState(1);

  const sim = useMemo(() => simulateEncounters(g, pA, pB, n, mulberry32(seed)), [g, pA, pB, n, seed]);
  const exp = expectedPayoffs(g, pA, pB);
  const deviation = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => {
        const p = i / 20;
        return { p, row: Math.round(expectedPayoffs(g, p, pB)[0] * 1e6) / 1e6 };
      }),
    [g, pB],
  );
  const flat = Math.abs(pB - sol.mixed.colP1) < 1e-9;

  return (
    <div>
      <SectionTitle kicker="Simulate" title="Run a thousand midnights" color={accent}>
        Set how often each driver goes straight and replay the bridge thousands of times. At the mixed equilibrium the crash rate settles on{' '}
        {pct(sol.crashProb)}.
      </SectionTitle>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-3">
          <Slider label={`${g.rowPlayer}: P(straight)`} value={pA} min={0} max={1} step={0.01} onChange={setPA} format={(v) => pct(v, 0)} />
          <Slider label={`${g.colPlayer}: P(straight)`} value={pB} min={0} max={1} step={0.01} onChange={setPB} format={(v) => pct(v, 0)} />
          <Slider label="Encounters" value={n} min={100} max={20000} step={100} onChange={setN} format={(v) => v.toLocaleString('en-IN')} />
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => setSeed((s) => s + 1)}>
              Run again
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setPA(sol.mixed.rowP1);
                setPB(sol.mixed.colP1);
              }}
            >
              Snap to MSNE
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Crash rate" value={pct(sim.crashSeries.at(-1)!.crashRate, 2)} sub={`theory ${pct(pA * pB, 2)}`} color={RED} />
            <Stat label="Crashes" value={sim.counts[1][1].toLocaleString('en-IN')} sub={`of ${n.toLocaleString('en-IN')}`} />
            <Stat label={`${g.rowPlayer} avg`} value={sim.avgRow.toFixed(2)} sub={`expected ${exp[0].toFixed(2)}`} color={PEN} />
            <Stat label={`${g.colPlayer} avg`} value={sim.avgCol.toFixed(2)} sub={`expected ${exp[1].toFixed(2)}`} color={RED} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="card">
            <div className="label mb-2">Crash rate as encounters pile up</div>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sim.crashSeries} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="n" type="number" domain={[0, n]} tickCount={6} {...axis} tickFormatter={(v: number) => (v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(v))} />
                  <YAxis {...axis} tickFormatter={(v) => pct(v, 1)} width={64} />
                  <Tooltip {...tooltip} formatter={(v: number) => pct(v, 2)} labelFormatter={(l) => `after ${l} encounters`} />
                  <Legend {...legend} />
                  <Line type="monotone" dataKey="crashRate" name="Simulated" stroke={SERIES.pen} strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="theory" name="Theory p·q" stroke={SERIES.mark} strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="label mb-1">
              {g.rowPlayer}’s expected payoff for each of its own mixes (given {g.colPlayer} at {pct(pB, 0)})
            </div>
            <p className="mb-2 text-base text-ink-2">
              {flat
                ? `Flat line: when ${g.colPlayer} plays the MSNE, every mix gives ${g.rowPlayer} the same payoff — that indifference is the equilibrium.`
                : `Move ${g.colPlayer}’s slider to ${pct(sol.mixed.colP1, 0)} and this line goes flat.`}
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deviation} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="p" type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} {...axis} tickFormatter={(v: number) => pct(v, 0)} />
                  <YAxis {...axis} width={60} domain={[(m: number) => Math.floor(m - 0.5), (m: number) => Math.ceil(m + 0.5)]} tickFormatter={(v: number) => v.toFixed(1)} />
                  <Tooltip {...tooltip} formatter={(v: number) => v.toFixed(3)} labelFormatter={(l) => `${g.rowPlayer} straight ${pct(Number(l), 0)}`} />
                  <ReferenceLine x={pA} stroke="rgba(31,29,26,0.35)" strokeDasharray="4 4" />
                  <Line type="linear" dataKey="row" name={`${g.rowPlayer} E[u]`} stroke={SERIES.pen} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <NextStageButton label="Debrief" />
      </div>
    </div>
  );
}
