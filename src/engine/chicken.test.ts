import { describe, expect, it } from 'vitest';
import { solveChicken, simulateEncounters } from './chicken';
import { mulberry32 } from './random';

describe('Chicken (symmetric)', () => {
  const s = solveChicken(false);
  it('has pure NE (S,D) and (D,S)', () => {
    expect(s.pure).toEqual([
      { r: 0, c: 1 },
      { r: 1, c: 0 },
    ]);
  });
  it('MSNE: each drives straight with p = 0.1', () => {
    expect(s.mixed.rowP1).toBeCloseTo(0.1, 10);
    expect(s.mixed.colP1).toBeCloseTo(0.1, 10);
  });
  it('crash probability 0.01, expected payoff -0.1 each', () => {
    expect(s.crashProb).toBeCloseTo(0.01, 10);
    expect(s.mixed.rowValue).toBeCloseTo(-0.1, 10);
    expect(s.mixed.colValue).toBeCloseTo(-0.1, 10);
  });
  it('Nash products are equal (9 and 9): no risk dominance', () => {
    expect(s.productRowStraight).toBe(9);
    expect(s.productColStraight).toBe(9);
    expect(s.riskDominant).toBeNull();
  });
});

describe('Chicken (asymmetric truck vs car)', () => {
  const s = solveChicken(true);
  it('still has two pure NE', () => {
    expect(s.pure.length).toBe(2);
  });
  it('MSNE: Truck straight q = 0.1, Car straight r = 0.25', () => {
    expect(s.mixed.rowP1).toBeCloseTo(0.1, 10);
    expect(s.mixed.colP1).toBeCloseTo(0.25, 10);
  });
  it('crash probability 0.025', () => {
    expect(s.crashProb).toBeCloseTo(0.025, 10);
  });
  it('Truck-straight equilibrium is risk dominant (9 > 3)', () => {
    expect(s.productRowStraight).toBe(9);
    expect(s.productColStraight).toBe(3);
    expect(s.riskDominant).toEqual({ r: 1, c: 0 });
  });
});

describe('Chicken simulation', () => {
  it('empirical crash rate converges to theory', () => {
    const s = solveChicken(false);
    const sim = simulateEncounters(s.game, 0.1, 0.1, 200000, mulberry32(7));
    expect(sim.crashSeries.at(-1)!.crashRate).toBeCloseTo(0.01, 2);
    expect(sim.avgRow).toBeCloseTo(-0.1, 1);
  });
});
