import type { ChickenSolution } from '../../engine/chicken';

/** Best-response correspondences in (p, q) space: p = P(row straight), q = P(col straight). */
export function BRPlot({ sol }: { sol: ChickenSolution }) {
  const S = 300;
  const P = 56;
  const x = (p: number) => P + p * S;
  const y = (q: number) => P + (1 - q) * S;
  const qs = sol.mixed.colP1;
  const ps = sol.mixed.rowP1;
  const row = `M ${x(1)} ${y(0)} L ${x(1)} ${y(qs)} L ${x(0)} ${y(qs)} L ${x(0)} ${y(1)}`;
  const col = `M ${x(0)} ${y(1)} L ${x(ps)} ${y(1)} L ${x(ps)} ${y(0)} L ${x(1)} ${y(0)}`;
  const pts = [
    { p: 1, q: 0 },
    { p: 0, q: 1 },
    { p: ps, q: qs },
  ];
  return (
    <div>
    <svg viewBox={`0 0 ${S + P * 2} ${S + P * 2}`} className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="Best-response diagram">
      <rect x={P} y={P} width={S} height={S} fill="#151233" stroke="#0f0d22" strokeWidth={4} />
      <path d={row} stroke="#5aa7ff" strokeWidth={5} fill="none" strokeLinejoin="round" />
      <path d={col} stroke="#ef5a4b" strokeWidth={5} fill="none" strokeDasharray="10 6" strokeLinejoin="round" />
      {pts.map((pt, i) => (
        <rect key={i} x={x(pt.p) - 9} y={y(pt.q) - 9} width={18} height={18} fill="#ffcc4d" stroke="#0f0d22" strokeWidth={3} />
      ))}
      <text x={P + S / 2} y={S + P + 40} textAnchor="middle" fontSize={17} fill="#d4cdee">
        p = P({sol.game.rowPlayer} straight)
      </text>
      <text x={18} y={P + S / 2} textAnchor="middle" fontSize={17} fill="#d4cdee" transform={`rotate(-90 18 ${P + S / 2})`}>
        q = P({sol.game.colPlayer} straight)
      </text>
      <text x={x(ps) + 16} y={y(qs) - 14} fontSize={17} fill="#ffcc4d" fontWeight={700}>
        Mixed equilibrium ({ps.toFixed(2)}, {qs.toFixed(2)})
      </text>
    </svg>
      <div className="flex flex-wrap justify-center gap-x-6 text-lg font-bold">
        <span className="text-blue">━ {sol.game.rowPlayer}’s best reply</span>
        <span className="text-red">┅ {sol.game.colPlayer}’s best reply</span>
      </div>
    </div>
  );
}
