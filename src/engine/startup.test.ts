import { describe, expect, it } from 'vitest';
import { certaintyEquivalent, fightIsCredible, solveTree, utility } from './startup';

describe('Startup entry (baseline)', () => {
  const s = solveTree({ p: 0.6, credible: false });
  it('Fight is never a best response (non-credible threat)', () => {
    expect(fightIsCredible('High', false)).toBe(false);
    expect(fightIsCredible('Low', false)).toBe(false);
    expect(s.high.choice).toBe('Accommodate');
    expect(s.low.choice).toBe('Accommodate');
  });
  it('EU(Enter) = 0.6·6 + 0.4·1 = 4.0 > 0 → Enter', () => {
    expect(s.euEnter).toBeCloseTo(4.0, 12);
    expect(s.decision).toBe('Enter');
  });
});

describe('Credible threat toggle', () => {
  it('Low-demand Fight becomes the incumbent’s best response', () => {
    expect(fightIsCredible('Low', true)).toBe(true);
    expect(fightIsCredible('High', true)).toBe(false);
  });
  it('p=0.6 → 2.4', () => expect(solveTree({ p: 0.6, credible: true }).euEnter).toBeCloseTo(2.4, 12));
  it('p=1/3 → 0 (break-even)', () => {
    const s = solveTree({ p: 1 / 3, credible: true });
    expect(s.euEnter).toBeCloseTo(0, 12);
    expect(s.breakEvenP).toBeCloseTo(1 / 3, 12);
  });
  it('p=0.2 → −1.2 → Stay Out', () => {
    const s = solveTree({ p: 0.2, credible: true });
    expect(s.euEnter).toBeCloseTo(-1.2, 12);
    expect(s.decision).toBe('Stay Out');
    expect(s.spnePayoff).toEqual([0, 10]);
  });
});

describe('Risk attitude', () => {
  it('r → 0 is risk neutral', () => {
    expect(utility(6, 1e-12)).toBeCloseTo(6, 6);
    expect(utility(6, 0)).toBe(6);
  });
  it('risk aversion raises the break-even probability', () => {
    const neutral = solveTree({ p: 0.5, credible: true, r: 0 }).breakEvenP!;
    const averse = solveTree({ p: 0.5, credible: true, r: 0.3 }).breakEvenP!;
    expect(averse).toBeGreaterThan(neutral);
  });
  it('certainty equivalent inverts utility', () => {
    expect(certaintyEquivalent(utility(3, 0.2), 0.2)).toBeCloseTo(3, 10);
  });
});
