import { Rng, defaultRng } from './random';

export const ATTRITION = { V: 200, c: 20 };

/** Constant-hazard symmetric MSNE: λ = c / V. */
export function hazard(c = ATTRITION.c, V = ATTRITION.V) {
  return c / V;
}

export function solveSymmetric(V = ATTRITION.V, c = ATTRITION.c) {
  const lambda = hazard(c, V);
  const meanPerPlayer = 1 / lambda;
  const expectedStandoff = 1 / (2 * lambda);
  const expectedTotalCost = 2 * c * expectedStandoff;
  return {
    lambda,
    meanPerPlayer,
    expectedStandoff,
    expectedTotalCost,
    dissipation: expectedTotalCost / V,
    /** expected payoff of each player in the MSNE */
    expectedPayoff: 0,
    bothWaitingAt: (t: number) => Math.exp(-2 * lambda * t),
  };
}

/** Survival of one player's "still waiting" with constant hazard. */
export function survivalConstant(t: number, lambda: number) {
  return Math.exp(-lambda * t);
}

/** Escalating cost c(t) = c0 + g·t. */
export function escalatingHazard(t: number, c0: number, g: number, V = ATTRITION.V) {
  return (c0 + g * t) / V;
}
export function escalatingSurvival(t: number, c0: number, g: number, V = ATTRITION.V) {
  return Math.exp(-(c0 * t + (g * t * t) / 2) / V);
}

/** Asymmetric: each player's hazard is set by the OPPONENT's cost and value. */
export function asymmetricHazards(cA: number, VA: number, cB: number, VB: number) {
  return { lambdaA: cB / VB, lambdaB: cA / VA };
}

export type CurvePoint = { t: number; survival: number; standoff: number; hazard: number };

export function curves(opts: { tMax?: number; dt?: number; c0?: number; g?: number; V?: number }): CurvePoint[] {
  const { tMax = 30, dt = 0.5, c0 = ATTRITION.c, g = 0, V = ATTRITION.V } = opts;
  const pts: CurvePoint[] = [];
  for (let t = 0; t <= tMax + 1e-9; t += dt) {
    const s = escalatingSurvival(t, c0, g, V);
    pts.push({ t: +t.toFixed(2), survival: s, standoff: s * s, hazard: escalatingHazard(t, c0, g, V) });
  }
  return pts;
}

/** Probability a player with hazard λ(t) concedes during minute [t, t+1). */
export function concedeProbInMinute(t: number, c0: number, g: number, V = ATTRITION.V) {
  return 1 - escalatingSurvival(t + 1, c0, g, V) / escalatingSurvival(t, c0, g, V);
}

/** Cumulative waiting cost per person after t minutes. */
export function cumulativeCost(t: number, c0: number, g: number) {
  return c0 * t + (g * t * t) / 2;
}

/** Payoffs once someone concedes at time t (continuous). Winner: V − cost, loser: −cost. */
export function attritionPayoffs(t: number, classConceded: boolean, V = ATTRITION.V, c0 = ATTRITION.c, g = 0) {
  const cost = cumulativeCost(t, c0, g);
  return classConceded ? { classPayoff: -cost, aiPayoff: V - cost } : { classPayoff: V - cost, aiPayoff: -cost };
}

/** Monte Carlo: both players draw exponential concession times. */
export function simulateStandoffs(n: number, lambdaA: number, lambdaB: number, rng: Rng = defaultRng) {
  let sumLen = 0;
  let aWins = 0;
  const lens: number[] = [];
  for (let i = 0; i < n; i++) {
    const ta = -Math.log(1 - rng()) / lambdaA;
    const tb = -Math.log(1 - rng()) / lambdaB;
    const len = Math.min(ta, tb);
    sumLen += len;
    lens.push(len);
    if (tb < ta) aWins++;
  }
  return { meanLength: sumLen / n, pAWins: aWins / n, lengths: lens };
}
