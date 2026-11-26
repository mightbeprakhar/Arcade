import { GameTree, type TreeNode } from '../../components/GameTree';
import { MathBlock, type MathLine } from '../../components/MathBlock';
import { Narration, Panel } from '../../components/comic';
import { SectionTitle, Slider, Stat, Toggle } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { num } from '../../components/texfmt';
import { useBuildSteps } from '../../state/presenter';
import { STARTUP, certaintyEquivalent, leafPayoff, utility } from '../../engine/startup';
import type { StartupState } from './StartupGame';

const STEPS = ['The game tree', 'Incumbent’s best replies', 'Nature’s expected value', 'Startup decides'];

function tree(credible: boolean, p: number): TreeNode {
  const leaf = (id: string, d: 'High' | 'Low', a: 'Fight' | 'Accommodate'): TreeNode => {
    const v = leafPayoff(d, a, credible);
    return { id, kind: 'terminal', payoff: [num(v[0]), num(v[1])] };
  };
  const inc = (d: 'High' | 'Low'): TreeNode => ({
    id: `I${d}`,
    kind: 'decision',
    player: 'Incumbent',
    children: [
      { id: `f${d}`, label: 'Fight', to: leaf(`F${d}`, d, 'Fight') },
      { id: `a${d}`, label: 'Accommodate', to: leaf(`A${d}`, d, 'Accommodate') },
    ],
  });
  return {
    id: 'S',
    kind: 'decision',
    player: 'Startup',
    children: [
      { id: 'out', label: 'Stay out', to: { id: 'OUT', kind: 'terminal', payoff: [num(STARTUP.stayOut[0]), num(STARTUP.stayOut[1])] } },
      {
        id: 'enter',
        label: 'Enter',
        to: {
          id: 'N',
          kind: 'chance',
          children: [
            { id: 'h', label: 'High', prob: num(+p.toFixed(2)), to: inc('High') },
            { id: 'l', label: 'Low', prob: num(+(1 - p).toFixed(2)), to: inc('Low') },
          ],
        },
      },
    ],
  };
}

export function StartupSolve({ st }: { st: StartupState }) {
  const { shown, advance } = useBuildSteps(STEPS.length, 1, 0);
  const s = st.sol;
  const pruned = new Set<string>();
  const chosen = new Set<string>();
  const values: Record<string, string> = {};
  if (shown >= 2) {
    (['High', 'Low'] as const).forEach((d) => {
      const c = d === 'High' ? s.high : s.low;
      pruned.add(c.choice === 'Fight' ? `a${d}` : `f${d}`);
      chosen.add(c.choice === 'Fight' ? `f${d}` : `a${d}`);
      values[`I${d}`] = `(${num(c.payoff[0])}, ${num(c.payoff[1])})`;
    });
  }
  if (shown >= 3) values.N = `EU = ${num(+s.euEnter.toFixed(3))}`;
  if (shown >= 4) {
    chosen.add(s.decision === 'Enter' ? 'enter' : 'out');
    pruned.add(s.decision === 'Enter' ? 'out' : 'enter');
    values.S = s.decision;
  }
  const hi = leafPayoff('High', s.high.choice, st.credible)[0];
  const lo = leafPayoff('Low', s.low.choice, st.credible)[0];
  const fightLow = leafPayoff('Low', 'Fight', st.credible)[1];
  const accLow = leafPayoff('Low', 'Accommodate', st.credible)[1];

  const lines: MathLine[] = [
    { tex: `\\text{High: Fight } ${num(leafPayoff('High', 'Fight', st.credible)[1])} \\text{ vs Accommodate } ${num(leafPayoff('High', 'Accommodate', st.credible)[1])} \\Rightarrow \\text{${s.high.choice}}` },
    {
      tex: `\\text{Low: Fight } ${num(fightLow)} \\text{ vs Accommodate } ${num(accLow)} \\Rightarrow \\text{${s.low.choice}}`,
      note: st.credible ? 'With a reputation at stake, fighting in a weak market pays: the threat is now credible.' : 'Fight is never a best reply, so the threat is not credible and is pruned.',
    },
    { tex: [`EU(\\text{Enter}) = p\\cdot ${num(hi)} + (1-p)\\cdot ${lo < 0 ? `(${num(lo)})` : num(lo)}`, `= ${num(+st.p.toFixed(3))}\\cdot ${num(hi)} + ${num(+(1 - st.p).toFixed(3))}\\cdot ${lo < 0 ? `(${num(lo)})` : num(lo)} = ${num(+s.euEnter.toFixed(3))}`] },
    {
      tex: `EU(\\text{Enter}) = ${num(+s.euEnter.toFixed(3))} ${s.euEnter > 0 ? '>' : s.euEnter < 0 ? '<' : '='} ${num(STARTUP.stayOut[0])} = u(\\text{Stay out}) \\Rightarrow \\text{${s.decision}}`,
    },
    ...(s.breakEvenP !== null
      ? [{ tex: [`\\text{Break-even: } p\\cdot ${num(hi)} + (1-p)\\cdot ${lo < 0 ? `(${num(lo)})` : num(lo)} = 0`, `\\Rightarrow p^* = ${num(+s.breakEvenP.toFixed(4))}`], note: st.r > 0 ? 'With risk aversion the break-even uses utilities, so it moves up.' : 'Below this probability of high demand, the startup should stay out.' }]
      : []),
  ];
  const riskLines: MathLine[] = [
    { tex: `u(x) = \\frac{1 - e^{-r x}}{r}, \\qquad r \\to 0 \\Rightarrow u(x) = x`, note: 'r > 0 means the founder dislikes risk: losses hurt more than equal gains help.' },
    { tex: `r = ${st.r.toFixed(2)}:\\quad E[u(\\text{Enter})] = ${num(+s.uEnter.toFixed(3))} \\text{ vs } u(0) = 0` },
    { tex: `\\text{Certainty equivalent} = ${num(+certaintyEquivalent(s.uEnter, st.r).toFixed(3))}`, note: 'The sure amount the founder would trade the risky entry for.' },
  ];

  return (
    <div>
      <SectionTitle kicker="SOLVE" title="Prune the empty threat" />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Slider label="P(High demand)" value={st.p} min={0} max={1} step={0.01} onChange={st.setP} format={(v) => v.toFixed(2)} />
        <Toggle checked={st.credible} onChange={st.setCredible} label="Credible threat" sub={`Low-demand Fight pays the incumbent ${STARTUP.credibleLowFight}`} />
        <Slider label="Risk aversion r" value={st.r} min={0} max={0.6} step={0.05} onChange={st.setR} format={(v) => v.toFixed(2)} />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <Panel className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="chip text-gold">
              STEP {shown}/{STEPS.length}
            </span>
            <span className="font-display text-xl font-bold">{STEPS[shown - 1]}</span>
          </div>
          <GameTree key={`${st.credible}`} root={tree(st.credible, st.p)} pruned={pruned} chosen={chosen} values={values} playerColors={{ Startup: '#5aa7ff', Incumbent: '#ef5a4b' }} />
          <Narration className="mt-4">
            {
              [
                'The startup moves first; Nature then draws demand; then the incumbent chooses. Leaves show (Startup, Incumbent).',
                'Solve from the end: in each market the incumbent picks whatever pays it more. Crossed-out branches are moves it would never make.',
                'Nature isn’t a player with goals, so we take the probability-weighted average of the two branches.',
                'Finally the startup compares that expected value with staying out.',
              ][shown - 1]
            }
          </Narration>
          {shown < STEPS.length && (
            <button className="btn-ghost mt-4" onClick={advance}>
              NEXT STEP ▶
            </button>
          )}
        </Panel>
        <div className="space-y-6">
          <MathBlock key={`m${st.credible}`} title="Backward induction with chance" lines={lines} />
          <div className="grid grid-cols-2 gap-4">
            <Stat label="EU(enter)" value={num(+s.euEnter.toFixed(2))} color={s.euEnter > 0 ? '#47c9a8' : '#ef5a4b'} />
            <Stat label="Decision" value={s.decision} color="#ffcc4d" />
          </div>
          <MathBlock key={`r${st.r}`} title="Risk attitude" lines={riskLines} />
          <p className="text-lg text-ink-2">
            At r = {st.r.toFixed(2)}: u({num(lo)}) = {utility(lo, st.r).toFixed(2)}, u({num(hi)}) = {utility(hi, st.r).toFixed(2)}.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <NextStageButton label="SIMULATE" />
      </div>
    </div>
  );
}
