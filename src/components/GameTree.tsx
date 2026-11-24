import { motion } from 'framer-motion';

export type TreeEdge = { id: string; label: string; prob?: string; to: TreeNode };
export type TreeNode = {
  id: string;
  kind: 'decision' | 'chance' | 'terminal';
  player?: string;
  payoff?: [string, string];
  children?: TreeEdge[];
};

type Placed = { node: TreeNode; x: number; y: number; depth: number };

const COL_W = 230;
const ROW_H = 78;
const PAD_X = 70;
const PAD_Y = 40;
const LEAF_W = 150;

function layout(root: TreeNode) {
  const placed = new Map<string, Placed>();
  let leafIndex = 0;
  let maxDepth = 0;
  const walk = (n: TreeNode, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    let y: number;
    if (!n.children?.length) {
      y = PAD_Y + leafIndex * ROW_H + ROW_H / 2;
      leafIndex++;
    } else {
      const ys = n.children.map((c) => walk(c.to, depth + 1));
      y = (ys[0] + ys[ys.length - 1]) / 2;
    }
    placed.set(n.id, { node: n, x: PAD_X + depth * COL_W, y, depth });
    return y;
  };
  walk(root, 0);
  return { placed, width: PAD_X + maxDepth * COL_W + LEAF_W + 30, height: PAD_Y * 2 + leafIndex * ROW_H };
}

/**
 * Extensive-form tree (root on the left). Backward induction is shown by passing
 * `pruned` edges (faded + struck) and `chosen` edges (thick accent), plus `values`
 * written beside nodes as they are solved.
 */
export function GameTree({
  root,
  pruned = new Set(),
  chosen = new Set(),
  values = {},
  playerColors,
  payoffColors = ['#a3e635', '#f472b6'],
  accent = '#a3e635',
  highlightPath = new Set(),
}: {
  root: TreeNode;
  pruned?: Set<string>;
  chosen?: Set<string>;
  values?: Record<string, string>;
  playerColors: Record<string, string>;
  payoffColors?: [string, string];
  accent?: string;
  highlightPath?: Set<string>;
}) {
  const { placed, width, height } = layout(root);
  const edges: { from: Placed; to: Placed; e: TreeEdge }[] = [];
  placed.forEach((p) => p.node.children?.forEach((e) => edges.push({ from: p, to: placed.get(e.to.id)!, e })));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Game tree">
      {edges.map(({ from, to, e }) => {
        const isPruned = pruned.has(e.id);
        const isChosen = chosen.has(e.id);
        const isLive = highlightPath.has(e.id);
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const stroke = isPruned ? '#ef4444' : isLive ? '#fbbf24' : isChosen ? accent : '#475569';
        return (
          <g key={e.id}>
            <motion.line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={stroke}
              strokeLinecap="round"
              initial={false}
              animate={{ strokeWidth: isChosen || isLive ? 6 : 3, opacity: isPruned ? 0.35 : 1 }}
              strokeDasharray={isPruned ? '8 8' : undefined}
              transition={{ duration: 0.5 }}
            />
            {isPruned && (
              <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ originX: `${mx}px`, originY: `${my}px` }}>
                <line x1={mx - 10} y1={my - 10} x2={mx + 10} y2={my + 10} stroke="#ef4444" strokeWidth={4} strokeLinecap="round" />
                <line x1={mx - 10} y1={my + 10} x2={mx + 10} y2={my - 10} stroke="#ef4444" strokeWidth={4} strokeLinecap="round" />
              </motion.g>
            )}
            <text
              x={mx}
              y={my - 12}
              textAnchor="middle"
              fontSize={19}
              fontWeight={600}
              fill={isPruned ? '#94a3b8' : '#e2e8f0'}
              style={{ paintOrder: 'stroke', stroke: '#0d111c', strokeWidth: 6 }}
            >
              {e.label}
              {e.prob ? ` (${e.prob})` : ''}
            </text>
          </g>
        );
      })}
      {[...placed.values()].map(({ node, x, y }) => {
        if (node.kind === 'terminal') {
          return (
            <g key={node.id}>
              <circle cx={x} cy={y} r={6} fill="#64748b" />
              <text x={x + 16} y={y + 7} fontSize={21} fontFamily="JetBrains Mono, monospace" fontWeight={600}>
                <tspan fill="#94a3b8">(</tspan>
                <tspan fill={payoffColors[0]}>{node.payoff?.[0]}</tspan>
                <tspan fill="#94a3b8">, </tspan>
                <tspan fill={payoffColors[1]}>{node.payoff?.[1]}</tspan>
                <tspan fill="#94a3b8">)</tspan>
              </text>
            </g>
          );
        }
        const color = node.kind === 'chance' ? '#fbbf24' : playerColors[node.player ?? ''] ?? '#22d3ee';
        const v = values[node.id];
        return (
          <g key={node.id}>
            {node.kind === 'chance' ? (
              <rect x={x - 17} y={y - 17} width={34} height={34} rx={6} fill="#0d111c" stroke={color} strokeWidth={4} transform={`rotate(45 ${x} ${y})`} />
            ) : (
              <circle cx={x} cy={y} r={17} fill="#0d111c" stroke={color} strokeWidth={4} />
            )}
            <text x={x} y={y + 40} textAnchor="middle" fontSize={17} fontWeight={700} fill={color} style={{ paintOrder: 'stroke', stroke: '#0d111c', strokeWidth: 5 }}>
              {node.kind === 'chance' ? 'Nature' : node.player}
            </text>
            {v && (
              <motion.text
                key={v}
                initial={{ opacity: 0, y: y - 30 }}
                animate={{ opacity: 1, y: y - 26 }}
                x={x}
                textAnchor="middle"
                fontSize={19}
                fontWeight={700}
                fontFamily="JetBrains Mono, monospace"
                fill="#fbbf24"
                style={{ paintOrder: 'stroke', stroke: '#0d111c', strokeWidth: 6 }}
              >
                {v}
              </motion.text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
