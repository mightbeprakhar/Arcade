import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../components/motion';
import { SectionTitle, Slider } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { SERIES } from '../../components/chartTheme';
import type { TournamentRow } from '../../engine/advertising';
import { ROUNDS, STRATEGIES, playMatch, runTournament, strategyById } from '../../engine/advertising';
import { mulberry32 } from '../../engine/random';
import { CumulativeChart } from './Tally';

export function AdSimulate({ accent }: { accent: string }) {
  const [noise, setNoise] = useState(0);
  const [seed, setSeed] = useState(42);
  const [a, setA] = useState('tft');
  const [b, setB] = useState('alwaysAd');
  const table = useMemo(() => runTournament(undefined, { noise: noise / 100, seed, reps: 200 }), [noise, seed]);
  const match = useMemo(() => playMatch(strategyById(a), strategyById(b), ROUNDS, noise / 100, mulberry32(seed)), [a, b, noise, seed]);
  const allAdRank = table.find((r) => r.id === 'alwaysAd')!.rank;

  return (
    <div>
      <SectionTitle kicker="Simulate" title="The Axelrod tournament" color={accent}>
        Every strategy plays every other (and a copy of itself) for {ROUNDS} weeks; scores are averaged over 200 repeats. Then add mistakes.
      </SectionTitle>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-3">
          <Slider label="Noise (execution errors)" value={noise} min={0} max={10} step={1} onChange={setNoise} format={(v) => `${v}%`} />
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => setNoise(0)}>
              0% noise
            </button>
            <button className="btn-ghost" onClick={() => setNoise(5)}>
              5% noise
            </button>
            <button className="btn-ghost" onClick={() => setSeed((s) => s + 1)}>
              Re-run
            </button>
          </div>
          <div className="card">
            <div className="label mb-1">What to notice</div>
            <p className="text-lg">
              {noise === 0
                ? `No noise: the reciprocal strategies (${table[0].name}, ${table[1].name}) top the table. Being nice but retaliatory pays.`
                : `${noise}% noise: one accidental Ad sends Grim into permanent war and TFT into echoing feuds. Always Ad is now #${allAdRank}.`}
            </p>
          </div>
          <ol className="space-y-2">
            {table.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-lg bg-paper px-3 py-2 text-lg">
                <span className="w-6 font-mono text-ink-3">{r.rank}</span>
                <span className="flex-1">{r.name}</span>
                <span className="font-mono text-2xl">₹{(r.avgPerRound).toFixed(1)}k/wk</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-6">
          <div className="card">
            <div className="label mb-2">Tournament total (₹k over all matches)</div>
            <DotPlot rows={table} />
            <p className="mt-6 text-base text-ink-2">Always Ad is the gold dot. Watch it move as noise rises. Axis is zoomed to the spread of scores.</p>
          </div>
          <div className="card">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="label mr-2">Head to head</span>
              <select className="border-4 border-black bg-deep px-3 py-2 text-lg" value={a} onChange={(e) => setA(e.target.value)} aria-label="Strategy A">
                {STRATEGIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span className="text-ink-3">vs</span>
              <select className="border-4 border-black bg-deep px-3 py-2 text-lg" value={b} onChange={(e) => setB(e.target.value)} aria-label="Strategy B">
                {STRATEGIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span className="ml-auto font-mono text-4xl">
                <span className="text-blue">{match.totalA}</span> : <span className="text-red">{match.totalB}</span>
              </span>
            </div>
            <CumulativeChart a={match.rounds.map((r) => r.a)} b={match.rounds.map((r) => r.b)} nameA={strategyById(a).name} nameB={strategyById(b).name} />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <NextStageButton label="Debrief" />
      </div>
    </div>
  );
}

/** Dot plot (no zero baseline needed, so the zoomed axis is honest). */
function DotPlot({ rows }: { rows: TournamentRow[] }) {
  const vals = rows.map((r) => r.total);
  const lo = Math.floor(Math.min(...vals) / 250) * 250;
  const hi = Math.ceil(Math.max(...vals) / 250) * 250;
  const x = (v: number) => ((v - lo) / (hi - lo || 1)) * 100;
  const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);
  return (
    <div className="mt-2">
      {rows.map((r) => {
        const pink = r.id === 'alwaysAd';
        return (
          <div key={r.id} className="grid grid-cols-[9rem_1fr_4.5rem] items-center gap-3" title={`${r.name}: ₹${r.total.toFixed(0)}k`}>
            <span className={`truncate text-right text-lg ${pink ? 'text-gold' : 'text-ink'}`}>{r.name}</span>
            <div className="relative h-8">
              <div className="absolute inset-x-0 top-1/2 h-px bg-line2" />
              <motion.div
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface"
                style={{ background: pink ? SERIES.mark : SERIES.pen }}
                initial={false}
                animate={{ left: `${x(r.total)}%` }}
                transition={T}
              />
            </div>
            <span className="font-mono text-2xl text-ink">{r.total.toFixed(0)}</span>
          </div>
        );
      })}
      <div className="grid grid-cols-[9rem_1fr_4.5rem] gap-3">
        <span />
        <div className="relative h-6 border-t border-line2">
          {ticks.map((t) => (
            <span key={t} className="absolute top-1 -translate-x-1/2 font-mono text-xl text-ink-3" style={{ left: `${x(t)}%` }}>
              {t.toFixed(0)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
