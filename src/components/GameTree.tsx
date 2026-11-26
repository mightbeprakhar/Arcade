import { motion } from 'framer-motion';
import { T, T_SLOW } from './motion';

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
  payoffColors = ['#5aa7ff', '#ef5a4b'],
  accent = '#ffcc4d',
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
    <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto block h-auto w-full max-w-4xl" role="img" aria-label="Game tree">
      {edges.map(({ from, to, e }) => {
        const isPruned = pruned.has(e.id);
        const isChosen = chosen.has(e.id);
        const isLive = highlightPath.has(e.id);
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const stroke = isPruned ? 'rgba(246,240,220,0.3)' : isLive ? '#5aa7ff' : isChosen ? accent : '#a39bc9';
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
              animate={{ strokeWidth: isChosen || isLive ? 4 : 2, opacity: isPruned ? 0.6 : 1 }}
              strokeDasharray={isPruned ? '8 8' : undefined}
              transition={T}
            />
            {isPruned && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T}>
                <line x1={mx - 10} y1={my - 10} x2={mx + 10} y2={my + 10} stroke="#ef5a4b" strokeWidth={4} strokeLinecap="round" />
                <line x1={mx - 10} y1={my + 10} x2={mx + 10} y2={my - 10} stroke="#ef5a4b" strokeWidth={4} strokeLinecap="round" />
              </motion.g>
            )}
            <text
              x={mx}
              y={my - 12}
              textAnchor="middle"
              fontSize={19}
              fontWeight={400}
              fill={isPruned ? '#a39bc9' : '#f6f0dc'}
              style={{ paintOrder: 'stroke', stroke: '#1d1a3a', strokeWidth: 6 }}
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
              <rect x={x - 5} y={y - 5} width={10} height={10} fill="#a39bc9" />
              <text x={x + 16} y={y + 7} fontSize={21} fontFamily="Pixelify Sans, monospace" fontWeight={700}>
                <tspan fill="#a39bc9">(</tspan>
                <tspan fill={payoffColors[0]}>{node.payoff?.[0]}</tspan>
                <tspan fill="#a39bc9">, </tspan>
                <tspan fill={payoffColors[1]}>{node.payoff?.[1]}</tspan>
                <tspan fill="#a39bc9">)</tspan>
              </text>
            </g>
          );
        }
        const color = node.kind === 'chance' ? '#ffcc4d' : playerColors[node.player ?? ''] ?? '#f6f0dc';
        const v = values[node.id];
        return (
          <g key={node.id}>
            {node.kind === 'chance' ? (
              <rect x={x - 17} y={y - 17} width={34} height={34} rx={6} fill="#151233" stroke={color} strokeWidth={4} transform={`rotate(45 ${x} ${y})`} />
            ) : (
              <rect x={x - 16} y={y - 16} width={32} height={32} fill="#151233" stroke={color} strokeWidth={4} />
            )}
            <text x={x} y={y + 40} textAnchor="middle" fontSize={17} fill={color} style={{ paintOrder: 'stroke', stroke: '#1d1a3a', strokeWidth: 5 }}>
              {node.kind === 'chance' ? 'Nature' : node.player}
            </text>
            {v && (
              <motion.text
                key={v}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={T_SLOW}
                y={y - 26}
                x={x}
                textAnchor="middle"
                fontSize={19}
                fontFamily="Pixelify Sans, monospace" fontWeight={700}
                fill="#ffcc4d"
                style={{ paintOrder: 'stroke', stroke: '#1d1a3a', strokeWidth: 6 }}
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
