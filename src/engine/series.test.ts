import { describe, expect, it } from 'vitest';
import { BEST_OF, aiChickenMove, commitResponse, nashSeriesValue, roundWinner, seriesTally, solveChicken, STRAIGHT, SWERVE } from './chicken';
import { ALPHA_TYPES, nashProposerPayoff, nashResponderPayoff, ULT_ROUNDS } from './ultimatum';
import { MARKETS, founderEnters, founderPayoff, incumbentPayoff, nashIncumbentPayoff } from './startup';
import { predictionFor } from './predictions';
import { beatNash, performancePoints, totalPoints, PREDICTION_BONUS } from './score';
import { mulberry32 } from './random';

describe('Chicken best-of-5 vs AI', () => {
  const sol = solveChicken(false);
  it('AI goes straight at the MSNE rate (0.1)', () => {
    const rng = mulberry32(11);
    let s = 0;
    for (let i = 0; i < 100000; i++) s += aiChickenMove(sol, rng);
    expect(s / 100000).toBeCloseTo(0.1, 2);
  });
  it('commit: the AI best-responds to Straight by swerving (also with a truck)', () => {
    expect(commitResponse(sol.game)).toBe(SWERVE);
    expect(commitResponse(solveChicken(true).game)).toBe(SWERVE);
  });
  it('round winners and series end at 3 wins', () => {
    expect(roundWinner([1, -1])).toBe('class');
    expect(roundWinner([-1, 1])).toBe('ai');
    expect(roundWinner([-10, -10])).toBe('none');
    expect(BEST_OF).toBe(5);
    const r = seriesTally([{ a: STRAIGHT, b: SWERVE }, { a: STRAIGHT, b: SWERVE }, { a: STRAIGHT, b: SWERVE }], sol.game);
    expect(r).toMatchObject({ classWins: 3, aiWins: 0, classTotal: 3, over: true });
    expect(seriesTally([{ a: STRAIGHT, b: STRAIGHT }], sol.game)).toMatchObject({ crashes: 1, over: false, classTotal: -10 });
  });
  it('Nash benchmark is the MSNE value per round (-0.1)', () => {
    expect(nashSeriesValue(sol, 5)).toBeCloseTo(-0.5, 10);
  });
});

describe('Ultimatum series', () => {
  it('5 rounds; SPNE Proposer earns ₹9,000 from a money-only stranger and ₹0 from a fair one', () => {
    expect(ULT_ROUNDS).toBe(5);
    expect(nashProposerPayoff(0)).toBe(9000);
    for (const t of ALPHA_TYPES.filter((t) => t.alpha > 0)) expect(nashProposerPayoff(t.alpha)).toBe(0);
  });
  it('money-only Responder takes any positive offer', () => {
    expect(nashResponderPayoff(3000)).toBe(3000);
    expect(nashResponderPayoff(0)).toBe(0);
  });
});

describe('Startup series', () => {
  it('5 markets; theory founder enters at p = 0.6', () => {
    expect(MARKETS).toBe(5);
    expect(founderEnters(0.6, false)).toBe(true);
    expect(founderEnters(0.2, true)).toBe(false);
  });
  it('founder payoffs with a best-responding incumbent', () => {
    expect(founderPayoff(true, 'High', false)).toBe(6);
    expect(founderPayoff(true, 'Low', false)).toBe(1);
    expect(founderPayoff(true, 'Low', true)).toBe(-3);
    expect(founderPayoff(false, 'Low', false)).toBe(0);
  });
  it('class as incumbent: fighting costs it unless the threat is credible', () => {
    expect(incumbentPayoff(true, 'High', 'Fight', false)).toBe(3);
    expect(incumbentPayoff(true, 'High', 'Accommodate', false)).toBe(6);
    expect(incumbentPayoff(true, 'Low', 'Fight', true)).toBe(5);
    expect(nashIncumbentPayoff(true, 'Low', false)).toBe(4);
    expect(nashIncumbentPayoff(true, 'Low', true)).toBe(5);
    expect(incumbentPayoff(false, 'High', 'Fight', false)).toBe(10);
  });
});

describe('Predictions match the engine', () => {
  it.each([
    ['chicken', '10'],
    ['ultimatum', '1000'],
    ['advertising', 'ad'],
    ['startup', 'enter-acc'],
    ['attrition', '5'],
  ] as const)('%s → %s', (g, ans) => {
    const p = predictionFor(g);
    expect(p.correct).toBe(ans);
    expect(p.options.map((o) => o.id)).toContain(ans);
    expect(new Set(p.options.map((o) => o.id)).size).toBe(p.options.length);
  });
});

describe('Scoring', () => {
  it('converts payoffs to points', () => {
    expect(performancePoints('ultimatum', 30000)).toBe(300);
    expect(performancePoints('chicken', -8, 2)).toBe(200);
    expect(performancePoints('advertising', 1130)).toBe(113);
    expect(performancePoints('startup', 8)).toBe(200);
    expect(performancePoints('attrition', 80)).toBe(80);
  });
  it('adds the prediction bonus and compares with Nash', () => {
    expect(totalPoints(50, true, 100)).toBe(50 + 100 + PREDICTION_BONUS);
    expect(totalPoints(50, false)).toBe(50);
    expect(beatNash(1, 0.99)).toBe(true);
    expect(beatNash(-0.5, -0.5)).toBe(false);
  });
});
