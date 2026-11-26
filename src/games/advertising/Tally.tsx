import { rupeeK } from '../../components/ui';
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
  if (!m) return <div className="h-9 border-2 border-dashed border-panel2" />;
  return (
    <div
      className={`grid h-9 place-items-center border-2 border-black font-pixel text-xs ${m === 'A' ? 'bg-gold text-black' : 'bg-teal text-black'}`}
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
      <div className="grid min-w-[44rem] gap-1" style={{ gridTemplateColumns: `10rem repeat(${rounds}, minmax(0, 1fr))` }}>
        <div className="text-sm text-ink-3">Week</div>
        {cells.map((i) => (
          <div key={i} className="text-center font-mono text-sm text-ink-3">
            {i + 1}
          </div>
        ))}
        <div className="self-center truncate text-lg font-bold text-blue">{nameA}</div>
        {cells.map((i) => (
          <MoveCell key={i} m={a[i]} />
        ))}
        <div className="self-center truncate text-lg font-bold text-red">{nameB}</div>
        {cells.map((i) => (
          <MoveCell key={i} m={b[i]} />
        ))}
      </div>
      <div className="mt-2 flex gap-4 text-base text-ink-2">
        <span>
          <span className="border-2 border-black bg-gold px-1 font-pixel text-xs text-black">A</span> Ad
        </span>
        <span>
          <span className="border-2 border-black bg-teal px-1 font-pixel text-xs text-black">S</span> Save
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
          <YAxis {...axis} width={60} tickFormatter={(v: number) => rupeeK(v)} />
          <Tooltip {...tooltip} formatter={(v: number) => rupeeK(v)} labelFormatter={(l) => `after week ${l}`} />
          <Legend {...legend} />
          <Line type="linear" dataKey="a" name={nameA} stroke={SERIES.pen} strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
          <Line type="linear" dataKey="b" name={nameB} stroke={SERIES.graphite} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
