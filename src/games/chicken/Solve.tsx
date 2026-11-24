import { PayoffMatrix } from '../../components/PayoffMatrix';
import { MathBlock, type MathLine } from '../../components/MathBlock';
import { SectionTitle, Toggle } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { lin, num, par } from '../../components/texfmt';
import { useBuildSteps } from '../../state/presenter';
import type { ChickenSolution } from '../../engine/chicken';
import type { ChickenState } from './ChickenGame';
import { BRPlot } from './BRPlot';

const LAYERS = ['The payoff matrix', 'Underline best responses', 'Pure Nash equilibria', 'Mixed-strategy equilibrium'];

export function ChickenSolve({ st, sol, accent }: { st: ChickenState; sol: ChickenSolution; accent: string }) {
  const { shown, advance } = useBuildSteps(LAYERS.length, 1);
  const g = sol.game;
  const P = g.payoffs;
  const R = g.rowPlayer;
  const C = g.colPlayer;
  const A = (r: number, c: number) => P[r][c][0];
  const B = (r: number, c: number) => P[r][c][1];

  const msne: MathLine[] = [
    { tex: `\\text{Let } q = P(\\text{${C} goes straight})`, note: `${R} must be indifferent, or ${R} wouldn’t mix.` },
    {
      tex: `E_{\\text{${R}}}[\\text{Swerve}] = (1-q)\\cdot${par(A(0, 0))} + q\\cdot${par(A(0, 1))} = ${lin(A(0, 0), A(0, 1) - A(0, 0), 'q')}`,
    },
    {
      tex: `E_{\\text{${R}}}[\\text{Straight}] = (1-q)\\cdot${par(A(1, 0))} + q\\cdot${par(A(1, 1))} = ${lin(A(1, 0), A(1, 1) - A(1, 0), 'q')}`,
    },
    {
      tex: `${lin(A(0, 0), A(0, 1) - A(0, 0), 'q')} = ${lin(A(1, 0), A(1, 1) - A(1, 0), 'q')} \\quad\\Rightarrow\\quad q^* = ${num(sol.mixed.colP1)}`,
      note: `${C}’s mix comes from ${R}’s payoffs.`,
    },
    {
      tex: `\\text{Same for ${C}: } ${lin(B(0, 0), B(1, 0) - B(0, 0), 'p')} = ${lin(B(0, 1), B(1, 1) - B(0, 1), 'p')} \\quad\\Rightarrow\\quad p^* = ${num(sol.mixed.rowP1)}`,
      note: `${R}’s mix comes from ${C}’s payoffs.`,
    },
    {
      tex: `P(\\text{crash}) = p^*\\cdot q^* = ${num(sol.mixed.rowP1)}\\times${num(sol.mixed.colP1)} = ${num(sol.crashProb)}`,
    },
    {
      tex: `E[u_{\\text{${R}}}] = ${num(sol.mixed.rowValue)}, \\quad E[u_{\\text{${C}}}] = ${num(sol.mixed.colValue)}`,
      note: 'Worse than either pure equilibrium for at least one driver — the price of not coordinating.',
    },
  ];

  const risk: MathLine[] = [
    { tex: `\\text{Nash product} = \\Delta u_{\\text{${R}}} \\times \\Delta u_{\\text{${C}}}`, note: 'Δu = what each player loses by deviating alone. Bigger product = riskier to abandon = risk dominant.' },
    {
      tex: `(\\text{${R} Straight, ${C} Swerve}): (${par(A(1, 0))} - ${par(A(0, 0))})\\cdot(${par(B(1, 0))} - ${par(B(1, 1))}) = ${num(sol.productRowStraight)}`,
    },
    {
      tex: `(\\text{${R} Swerve, ${C} Straight}): (${par(A(0, 1))} - ${par(A(1, 1))})\\cdot(${par(B(0, 1))} - ${par(B(0, 0))}) = ${num(sol.productColStraight)}`,
    },
    {
      tex: sol.riskDominant
        ? `${num(sol.productRowStraight)} ${sol.productRowStraight > sol.productColStraight ? '>' : '<'} ${num(sol.productColStraight)} \\Rightarrow \\text{${sol.riskDominant.r === 1 ? `${R} Straight` : `${C} Straight`} is risk dominant}`
        : `${num(sol.productRowStraight)} = ${num(sol.productColStraight)} \\Rightarrow \\text{neither equilibrium risk-dominates}`,
      note: sol.riskDominant ? `The ${R} has less to lose from a crash, so “${R} goes straight” is the safer focal point.` : 'Symmetric game, symmetric risk: theory can’t pick a winner.',
    },
  ];

  return (
    <div>
      <SectionTitle kicker="Solve" title={st.asymmetric ? 'Truck vs Car: who should blink?' : 'Two equilibria and a coin flip'} color={accent} />
      <div className="mb-5 max-w-xl">
        <Toggle checked={st.asymmetric} onChange={st.setAsymmetric} label="Asymmetric: Truck vs Car" sub="Re-solves everything below from the engine" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="card">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {LAYERS.map((l, i) => (
              <span key={l} className={`chip ${i < shown ? 'text-slate-100' : 'text-slate-500'}`} style={i === shown - 1 ? { borderColor: accent, color: accent } : undefined}>
                {i + 1}. {l}
              </span>
            ))}
          </div>
          <PayoffMatrix game={g} bestResponses={shown >= 2} nash={shown >= 3} mixed={shown >= 4 ? sol.mixed : null} />
          {shown < LAYERS.length && (
            <button className="btn-ghost mt-4" onClick={advance}>
              Next layer <span className="kbd">→</span>
            </button>
          )}
          {shown >= 4 && (
            <div className="mt-4">
              <BRPlot sol={sol} />
              <p className="mt-2 text-center text-base text-slate-300">Best responses cross three times: two pure equilibria and one mixed.</p>
            </div>
          )}
        </div>
        <div className="space-y-5">
          {shown >= 4 && (
            <>
              <MathBlock key={`m${st.asymmetric}`} title="Mixed strategy by indifference" lines={msne} accent={accent} />
              <MathBlock key={`r${st.asymmetric}`} title="Risk dominance (Harsanyi–Selten)" lines={risk} accent={accent} />
            </>
          )}
          {shown < 4 && (
            <div className="card text-lg text-slate-300">
              Press <span className="kbd">→</span> to build the solution: best responses, then equilibria, then the mixed strategy.
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <NextStageButton label="Simulate" />
      </div>
    </div>
  );
}
