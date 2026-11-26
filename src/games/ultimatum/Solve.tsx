import { useMemo, useState } from 'react';
import { GameTree, type TreeNode } from '../../components/GameTree';
import { MathBlock, type MathLine } from '../../components/MathBlock';
import { Narration, Panel } from '../../components/comic';
import { SectionTitle, Slider, Stat } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { useBuildSteps } from '../../state/presenter';
import { PIE, STEP, fehrSchmidtThreshold, fehrSchmidtUtility, bestOfferAgainst, spne } from '../../engine/ultimatum';

const k = (n: number) => `${n / 1000}k`;
const r = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const TREE_OFFERS = [0, STEP, 2 * STEP, PIE / 2, PIE - STEP];

function buildTree(): TreeNode {
  return {
    id: 'P',
    kind: 'decision',
    player: 'Proposer',
    children: TREE_OFFERS.map((x) => ({
      id: `o${x}`,
      label: `offer ${k(x)}`,
      to: {
        id: `R${x}`,
        kind: 'decision',
        player: 'Responder',
        children: [
          { id: `a${x}`, label: 'accept', to: { id: `A${x}`, kind: 'terminal', payoff: [k(PIE - x), k(x)] } },
          { id: `r${x}`, label: 'reject', to: { id: `X${x}`, kind: 'terminal', payoff: ['0', '0'] } },
        ],
      },
    })),
  };
}

const STEPS = ['The game tree', 'Responder’s last move', 'Proposer looks ahead'];
const EXPLAIN = [
  `Read left to right: the Proposer picks an offer (only five of the eleven are drawn), then the Responder accepts or rejects. Leaves show (Proposer, Responder) in ₹.`,
  `Start at the end. A money-only Responder compares x with 0: any positive offer beats nothing, so “reject” is crossed out. At x = 0 they're indifferent.`,
  `Now the Proposer knows the Responder will accept anything positive, so they offer the smallest positive step and keep the rest. That's the subgame-perfect equilibrium.`,
];

export function UltSolve() {
  const tree = useMemo(buildTree, []);
  const { shown, advance } = useBuildSteps(STEPS.length, 1, 0);
  const [s1] = spne();
  const pruned = new Set<string>();
  const chosen = new Set<string>();
  const values: Record<string, string> = {};
  if (shown >= 2)
    TREE_OFFERS.forEach((x) => {
      if (x > 0) {
        pruned.add(`r${x}`);
        chosen.add(`a${x}`);
        values[`R${x}`] = `(${k(PIE - x)}, ${k(x)})`;
      } else values[`R${x}`] = 'indifferent';
    });
  if (shown >= 3) {
    chosen.add(`o${s1.offer}`);
    values.P = `(${k(s1.payoffs[0])}, ${k(s1.payoffs[1])})`;
    TREE_OFFERS.filter((x) => x !== s1.offer && x !== 0).forEach((x) => pruned.add(`o${x}`));
  }

  const [alpha, setAlpha] = useState(0.5);
  const thr = fehrSchmidtThreshold(alpha);

  const spneLines: MathLine[] = [
    { tex: [`\\text{Responder at offer } x:\\quad \\text{accept} \\to x`, `\\text{reject} \\to 0`] },
    { tex: `x > 0 \\Rightarrow \\text{accept};\\qquad x = 0 \\Rightarrow \\text{indifferent}`, note: 'Backward induction: solve the last mover first.' },
    { tex: [`\\text{Proposer: } \\max_x\\quad ${PIE} - x \\quad \\text{ s.t. accepted}`, `\\Rightarrow x^* = ${STEP}`], note: `SPNE 1: offer ${r(STEP)}, payoffs (${r(s1.payoffs[0])}, ${r(s1.payoffs[1])}).` },
    { tex: `\\text{If the Responder accepts } x = 0 \\text{ too} \\Rightarrow x^* = 0`, note: `SPNE 2 (discrete game): offer ₹0, payoffs (${r(PIE)}, ₹0). Both are subgame perfect.` },
  ];
  const fsLines: MathLine[] = [
    { tex: `U_R(x) = x - \\alpha \\cdot \\max(${PIE} - 2x,\\, 0)`, note: 'α = how much a lopsided split hurts the Responder, per rupee of gap.' },
    { tex: `\\text{Reject} \\iff U_R(x) < 0 \\iff x < \\frac{${PIE}\\,\\alpha}{1 + 2\\alpha}` },
    ...[0.25, 0.5, 1].map((a) => ({ tex: `\\alpha = ${a}:\\quad x < \\frac{${PIE}\\cdot${a}}{1+${2 * a}} = ${Math.round(fehrSchmidtThreshold(a)).toLocaleString('en-IN')}` })),
    { tex: `\\Rightarrow \\text{Proposer's best offer rises with } \\alpha`, note: `On the ₹${STEP / 1000}k grid: α=0.25 → ${r(bestOfferAgainst(0.25))}, α=0.5 → ${r(bestOfferAgainst(0.5))}, α=1 → ${r(bestOfferAgainst(1))}.` },
  ];

  return (
    <div>
      <SectionTitle kicker="SOLVE" title="Backward induction" />
      <div className="grid grid-cols-1 gap-6">
        <Panel className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="chip text-gold">
              STEP {shown}/{STEPS.length}
            </span>
            <span className="font-display text-xl font-bold">{STEPS[shown - 1]}</span>
          </div>
          <GameTree root={tree} pruned={pruned} chosen={chosen} values={values} playerColors={{ Proposer: '#5aa7ff', Responder: '#ef5a4b' }} />
          <Narration className="mt-4">{EXPLAIN[shown - 1]}</Narration>
          {shown < STEPS.length && (
            <button className="btn-ghost mt-4" onClick={advance}>
              NEXT STEP ▶
            </button>
          )}
        </Panel>
        <div className="space-y-6">
          <MathBlock title="Subgame-perfect equilibrium" lines={spneLines} />
          <MathBlock title="Fairness as a payoff (Fehr–Schmidt)" lines={fsLines} />
          <Panel className="p-4">
            <Slider label="Responder’s α (inequity aversion)" value={alpha} min={0} max={2} step={0.05} onChange={setAlpha} format={(v) => v.toFixed(2)} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Rejects below" value={r(thr)} color="#ef5a4b" />
              <Stat label="Best offer on grid" value={r(bestOfferAgainst(alpha))} color="#5aa7ff" />
            </div>
            <p className="mt-3 text-lg text-ink-2">
              At x = {r(thr)}, U = {fehrSchmidtUtility(thr, alpha).toFixed(1)}: exactly indifferent. As α grows the threshold approaches half the pie but never reaches it.
            </p>
          </Panel>
        </div>
      </div>
      <div className="mt-6">
        <NextStageButton label="SIMULATE" />
      </div>
    </div>
  );
}
