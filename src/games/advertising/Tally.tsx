import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SERIES, axis, grid, legend, tooltip } from '../../components/chartTheme';
import { ROUNDS, payoffs, type Move } from '../../engine/advertising';

export function cumulative(a: Move[], b: Move[]) {
  let ca = 0;
  let cb = 0;
  return a.map((m, i) => {
    const [pa, pb] = payoffs(m, b[i]);
    ca += pa;
    cb += pb;
    return { round: i + 1, a: ca, b: cb, pa, pb };
  });
}

export function MoveCell({ m }: { m?: Move }) {
  if (!m) return <div className="h-9 rounded-md border border-dashed border-ink-600" />;
  return (
    <div
      className={`grid h-9 place-items-center rounded-md font-mono text-base font-bold ${m === 'A' ? 'bg-neon-pink/25 text-neon-pink' : 'bg-neon-lime/20 text-neon-lime'}`}
      title={m === 'A' ? 'Ad' : 'Save'}
    >
      {m}
    </div>
  );
}

export function TallyGrid({ a, b, nameA, nameB, rounds = ROUNDS }: { a: Move[]; b: Move[]; nameA: string; nameB: string; rounds?: number }) {
  const cells = Array.from({ length: rounds }, (_, i) => i);
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[44rem] gap-1" style={{ gridTemplateColumns: `8rem repeat(${rounds}, minmax(0, 1fr))` }}>
        <div className="text-sm text-slate-400">Week</div>
        {cells.map((i) => (
          <div key={i} className="text-center font-mono text-sm text-slate-400">
            {i + 1}
          </div>
        ))}
        <div className="self-center truncate text-base font-semibold text-neon-cyan">{nameA}</div>
        {cells.map((i) => (
          <MoveCell key={i} m={a[i]} />
        ))}
        <div className="self-center truncate text-base font-semibold text-neon-pink">{nameB}</div>
        {cells.map((i) => (
          <MoveCell key={i} m={b[i]} />
        ))}
      </div>
      <div className="mt-2 flex gap-4 text-base text-slate-300">
        <span>
          <span className="font-mono font-bold text-neon-pink">A</span> = Ad
        </span>
        <span>
          <span className="font-mono font-bold text-neon-lime">S</span> = Save
        </span>
      </div>
    </div>
  );
}

export function CumulativeChart({ a, b, nameA, nameB }: { a: Move[]; b: Move[]; nameA: string; nameB: string }) {
  const data = [{ round: 0, a: 0, b: 0 }, ...cumulative(a, b)];
  return (
    <div className="h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 24, left: 10, bottom: 10 }}>
          <CartesianGrid {...grid} />
          <XAxis dataKey="round" type="number" domain={[0, ROUNDS]} ticks={[0, 5, 10, 15, 20]} {...axis} />
          <YAxis {...axis} width={60} tickFormatter={(v: number) => `₹${v}k`} />
          <Tooltip {...tooltip} formatter={(v: number) => `₹${v}k`} labelFormatter={(l) => `after week ${l}`} />
          <Legend {...legend} />
          <Line type="linear" dataKey="a" name={nameA} stroke={SERIES[0]} strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
          <Line type="linear" dataKey="b" name={nameB} stroke={SERIES[1]} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
