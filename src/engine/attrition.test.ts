import { describe, expect, it } from 'vitest';
import {
  asymmetricHazards, concedeProbInMinute, escalatingHazard, escalatingSurvival, simulateStandoffs, solveSymmetric,
} from './attrition';
import { mulberry32 } from './random';

describe('War of attrition (symmetric)', () => {
  const s = solveSymmetric();
  it('hazard λ = c/V = 0.1 per minute, mean 10 min per player', () => {
    expect(s.lambda).toBeCloseTo(0.1, 12);
    expect(s.meanPerPlayer).toBeCloseTo(10, 10);
  });
  it('expected standoff 5 min; total waiting cost ₹200 = V (full dissipation)', () => {
    expect(s.expectedStandoff).toBeCloseTo(5, 10);
    expect(s.expectedTotalCost).toBeCloseTo(200, 10);
    expect(s.dissipation).toBeCloseTo(1, 10);
  });
  it('P(both still waiting at 10 min) = e^-2 ≈ 0.135', () => {
    expect(s.bothWaitingAt(10)).toBeCloseTo(Math.exp(-2), 12);
    expect(s.bothWaitingAt(10)).toBeCloseTo(0.135, 3);
  });
  it('Monte Carlo agrees', () => {
    const sim = simulateStandoffs(100000, 0.1, 0.1, mulberry32(3));
    expect(sim.meanLength).toBeCloseTo(5, 1);
    expect(sim.pAWins).toBeCloseTo(0.5, 1);
  });
  it('per-minute concede probability is 1 − e^−0.1 with constant cost', () => {
    expect(concedeProbInMinute(3, 20, 0)).toBeCloseTo(1 - Math.exp(-0.1), 12);
  });
});

describe('Escalating cost', () => {
  it('λ(t) = (c0 + g t)/V and S(t) = exp(−(c0 t + g t²/2)/V)', () => {
    expect(escalatingHazard(5, 20, 4)).toBeCloseTo(0.2, 12);
    expect(escalatingSurvival(10, 20, 4)).toBeCloseTo(Math.exp(-(200 + 200) / 200), 12);
    expect(escalatingSurvival(10, 20, 0)).toBeCloseTo(Math.exp(-1), 12);
  });
});

describe('Asymmetric', () => {
  it('opponent payoffs set your rate', () => {
    const h = asymmetricHazards(20, 200, 40, 200);
    expect(h.lambdaA).toBeCloseTo(0.2, 12);
    expect(h.lambdaB).toBeCloseTo(0.1, 12);
  });
});
