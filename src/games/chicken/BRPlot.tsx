import type { ChickenSolution } from '../../engine/chicken';

/** Best-response correspondences in (p, q) space: p = P(row straight), q = P(col straight). */
export function BRPlot({ sol }: { sol: ChickenSolution }) {
  const S = 300;
  const P = 50;
  const x = (p: number) => P + p * S;
  const y = (q: number) => P + (1 - q) * S;
  const qs = sol.mixed.colP1; // threshold for row
  const ps = sol.mixed.rowP1; // threshold for col
  const row = `M ${x(1)} ${y(0)} L ${x(1)} ${y(qs)} L ${x(0)} ${y(qs)} L ${x(0)} ${y(1)}`;
  const col = `M ${x(0)} ${y(1)} L ${x(ps)} ${y(1)} L ${x(ps)} ${y(0)} L ${x(1)} ${y(0)}`;
  const pts = [
    { p: 1, q: 0, label: 'pure' },
    { p: 0, q: 1, label: 'pure' },
    { p: ps, q: qs, label: 'mixed' },
  ];
  return (
    <svg viewBox={`0 0 ${S + P * 2} ${S + P * 2}`} className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="Best-response diagram">
      <rect x={P} y={P} width={S} height={S} fill="#0d111c" stroke="#2e3958" strokeWidth={2} />
      <path d={row} stroke="#22d3ee" strokeWidth={5} fill="none" strokeLinejoin="round" />
      <path d={col} stroke="#f472b6" strokeWidth={5} fill="none" strokeDasharray="10 6" strokeLinejoin="round" />
      {pts.map((pt, i) => (
        <circle key={i} cx={x(pt.p)} cy={y(pt.q)} r={10} fill="#a3e635" stroke="#0d111c" strokeWidth={3} />
      ))}
      <text x={P + S / 2} y={S + P + 38} textAnchor="middle" fontSize={18} fill="#cbd5e1">
        p = P({sol.game.rowPlayer} straight)
      </text>
      <text x={16} y={P + S / 2} textAnchor="middle" fontSize={18} fill="#cbd5e1" transform={`rotate(-90 16 ${P + S / 2})`}>
        q = P({sol.game.colPlayer} straight)
      </text>
      <text x={x(ps) + 14} y={y(qs) - 12} fontSize={17} fill="#a3e635" fontWeight={700}>
        MSNE ({ps.toFixed(2)}, {qs.toFixed(2)})
      </text>
      <text x={P} y={P - 12} fontSize={16} fill="#22d3ee" fontWeight={700}>
        ━ {sol.game.rowPlayer} BR
      </text>
      <text x={P + S} y={P - 12} fontSize={16} fill="#f472b6" fontWeight={700} textAnchor="end">
        ┅ {sol.game.colPlayer} BR
      </text>
    </svg>
  );
}
