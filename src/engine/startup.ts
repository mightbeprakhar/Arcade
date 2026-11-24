export type Demand = 'High' | 'Low';
export type IncAction = 'Fight' | 'Accommodate';
export type Payoff = [number, number]; // [Startup, Incumbent]

export const STARTUP = {
  pHigh: 0.6,
  stayOut: [0, 10] as Payoff,
  High: { Accommodate: [6, 6] as Payoff, Fight: [-2, 3] as Payoff },
  Low: { Accommodate: [1, 4] as Payoff, Fight: [-3, 2] as Payoff },
  /** incumbent's payoff from Low-demand Fight when reputation makes the threat credible */
  credibleLowFight: 5,
};

export type TreeParams = { p: number; credible: boolean; r?: number };

export function leafPayoff(d: Demand, a: IncAction, credible: boolean): Payoff {
  const base = STARTUP[d][a];
  if (credible && d === 'Low' && a === 'Fight') return [base[0], STARTUP.credibleLowFight];
  return [base[0], base[1]];
}

/** CARA utility u(x) = (1 − e^(−r x))/r; r → 0 is risk neutral. */
export function utility(x: number, r = 0) {
  if (Math.abs(r) < 1e-9) return x;
  return (1 - Math.exp(-r * x)) / r;
}

export function certaintyEquivalent(eu: number, r = 0) {
  if (Math.abs(r) < 1e-9) return eu;
  return -Math.log(1 - r * eu) / r;
}

export function incumbentChoice(d: Demand, credible: boolean): IncAction {
  const acc = leafPayoff(d, 'Accommodate', credible)[1];
  const fight = leafPayoff(d, 'Fight', credible)[1];
  return fight > acc ? 'Fight' : 'Accommodate';
}

export type TreeSolution = {
  high: { choice: IncAction; payoff: Payoff };
  low: { choice: IncAction; payoff: Payoff };
  euEnter: number; // expected money for startup
  uEnter: number; // expected utility (risk-adjusted)
  uStayOut: number;
  incumbentEnter: number;
  decision: 'Enter' | 'Stay Out';
  breakEvenP: number | null;
  spnePayoff: Payoff;
};

export function solveTree({ p, credible, r = 0 }: TreeParams): TreeSolution {
  const hc = incumbentChoice('High', credible);
  const lc = incumbentChoice('Low', credible);
  const hp = leafPayoff('High', hc, credible);
  const lp = leafPayoff('Low', lc, credible);
  const euEnter = p * hp[0] + (1 - p) * lp[0];
  const uEnter = p * utility(hp[0], r) + (1 - p) * utility(lp[0], r);
  const uStayOut = utility(STARTUP.stayOut[0], r);
  const incumbentEnter = p * hp[1] + (1 - p) * lp[1];
  const decision = uEnter > uStayOut + 1e-12 ? 'Enter' : 'Stay Out';
  // break-even p for risk-adjusted utilities: p·u(h) + (1−p)·u(l) = u(0)
  const uh = utility(hp[0], r);
  const ul = utility(lp[0], r);
  const breakEvenP = uh === ul ? null : (uStayOut - ul) / (uh - ul);
  const spnePayoff: Payoff = decision === 'Enter' ? [euEnter, incumbentEnter] : [...STARTUP.stayOut] as Payoff;
  return {
    high: { choice: hc, payoff: hp },
    low: { choice: lc, payoff: lp },
    euEnter,
    uEnter,
    uStayOut,
    incumbentEnter,
    decision,
    breakEvenP: breakEvenP !== null && breakEvenP >= 0 && breakEvenP <= 1 ? breakEvenP : null,
    spnePayoff,
  };
}

/** Is Fight ever a best response for the incumbent? */
export function fightIsCredible(d: Demand, credible: boolean) {
  return incumbentChoice(d, credible) === 'Fight';
}

export function euCurve(credible: boolean, r = 0, steps = 50) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const p = i / steps;
    const s = solveTree({ p, credible, r });
    return { p, euEnter: s.euEnter, uEnter: s.uEnter, stayOut: s.uStayOut };
  });
}
