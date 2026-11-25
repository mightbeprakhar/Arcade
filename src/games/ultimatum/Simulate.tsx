import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Narration, Panel } from '../../components/comic';
import { SectionTitle } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { SERIES, axis, grid, tooltip } from '../../components/chartTheme';
import { ALPHA_TYPES, HUMAN_OFFER_DIST, fehrSchmidtThreshold, optimalOfferVsPopulation, proposerExpectedCurve, responderExpectedCurve } from '../../engine/ultimatum';

const r = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const k = (n: number) => `${n / 1000}k`;

export function UltSimulate() {
  const prop = useMemo(() => proposerExpectedCurve(), []);
  const best = useMemo(() => optimalOfferVsPopulation(), []);
  const resp = useMemo(() => responderExpectedCurve(), []);
  const bestResp = resp.reduce((b, x) => (x.expected > b.expected ? x : b));

  return (
    <div>
      <SectionTitle kicker="SIMULATE" title="Playing against real people">
        The SPNE assumes a money-only Responder. Against a crowd where some people care about fairness, the best offer changes. Both populations below are illustrative: shaped like
        classic lab results, not measured from this class.
      </SectionTitle>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel className="p-4">
          <h3 className="text-sm text-blue">AS PROPOSER: EXPECTED ₹ PER OFFER</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prop} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="offer" {...axis} tickFormatter={k} />
                <YAxis {...axis} width={64} tickFormatter={k} />
                <Tooltip {...tooltip} formatter={(v: number, n: string) => (n === 'expected' ? [r(v), 'Expected payoff'] : [v, n])} labelFormatter={(l) => `Offer ${r(Number(l))}`} />
                <Bar dataKey="expected" isAnimationActive={false}>
                  {prop.map((p) => (
                    <Cell key={p.offer} fill={p.offer === best.offer ? SERIES.gold : SERIES.blue} stroke="#0f0d22" strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Narration className="mt-4">
            Best offer against this crowd: {r(best.offer)} (accepted {Math.round(best.pAccept * 100)}% of the time, expected {r(best.expected)}). The SPNE offer of {r(prop[1].offer)} is
            accepted only {Math.round(prop[1].pAccept * 100)}% of the time.
          </Narration>
          <table className="mt-4 w-full text-left text-lg">
            <thead className="font-pixel text-xs text-ink-3">
              <tr>
                <th className="py-1">TYPE</th>
                <th>α</th>
                <th>SHARE</th>
                <th>REJECTS BELOW</th>
              </tr>
            </thead>
            <tbody>
              {ALPHA_TYPES.map((t) => (
                <tr key={t.label} className="border-t-2 border-black">
                  <td className="py-1">{t.label}</td>
                  <td className="font-mono text-2xl">{t.alpha}</td>
                  <td className="font-mono text-2xl">{Math.round(t.weight * 100)}%</td>
                  <td className="font-mono text-2xl">{t.alpha === 0 ? 'only ₹0' : r(fehrSchmidtThreshold(t.alpha))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel className="p-4">
          <h3 className="text-sm text-red">AS RESPONDER: EXPECTED ₹ PER MINIMUM</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resp} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="min" {...axis} tickFormatter={k} />
                <YAxis {...axis} width={64} tickFormatter={k} />
                <Tooltip {...tooltip} formatter={(v: number) => [r(v), 'Expected money']} labelFormatter={(l) => `Minimum ${r(Number(l))}`} />
                <Bar dataKey="expected" isAnimationActive={false}>
                  {resp.map((p) => (
                    <Cell key={p.min} fill={p.min === bestResp.min ? SERIES.gold : SERIES.red} stroke="#0f0d22" strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Narration className="mt-4">
            Against human-like Proposers, every extra rupee of pride costs money: the minimum that earns the most is {r(bestResp.min)}, just as the SPNE says. Demanding{' '}
            {r(4000)} drops the expected haul to {r(resp.find((x) => x.min === 4000)!.expected)}.
          </Narration>
          <table className="mt-4 w-full text-left text-lg">
            <thead className="font-pixel text-xs text-ink-3">
              <tr>
                <th className="py-1">PROPOSER OFFERS</th>
                {HUMAN_OFFER_DIST.map((d) => (
                  <th key={d.offer} className="font-mono text-xl">
                    {k(d.offer)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t-2 border-black">
                <td className="py-1">how often</td>
                {HUMAN_OFFER_DIST.map((d) => (
                  <td key={d.offer} className="font-mono text-2xl">
                    {Math.round(d.weight * 100)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Panel>
      </div>
      <div className="mt-6">
        <NextStageButton label="DEBRIEF" />
      </div>
    </div>
  );
}
