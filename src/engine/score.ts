/**
 * Arcade scoring. Every game's performance is scaled onto the same 0–500 range using its
 * worst and best possible payoff per round, so no single game dominates the total.
 * Bonuses (+100) are added for a correct prediction and for guessing the mystery rival.
 */
import { chickenGame } from './chicken';
import { PD } from './advertising';
import { HUMAN_OFFER_DIST, PIE, STEP } from './ultimatum';
import { STARTUP, founderPayoff, leafPayoff } from './startup';
import { ATTRITION } from './attrition';

export type GameKey = 'ultimatum' | 'chicken' | 'advertising' | 'startup' | 'attrition';

export const MAX_POINTS = 500;
export const PREDICTION_BONUS = 100;
export const GUESS_BONUS = 100;

/** Worst and best payoff the class can get in ONE round of a game. */
export type Range = { worst: number; best: number };

/**
 * Affine map from a total payoff over `rounds` rounds onto 0…MAX_POINTS (unrounded).
 * Because it is affine, expected points = points of the expected payoff.
 */
export function scaleExact(payoff: number, r: Range, rounds = 1) {
  return (MAX_POINTS * (payoff - rounds * r.worst)) / (rounds * (r.best - r.worst));
}

/** Rounded and clamped to 0…MAX_POINTS. */
export function scalePoints(payoff: number, r: Range, rounds = 1) {
  if (rounds <= 0) return 0;
  return Math.max(0, Math.min(MAX_POINTS, Math.round(scaleExact(payoff, r, rounds))));
}

const span = (xs: number[]): Range => ({ worst: Math.min(...xs), best: Math.max(...xs) });

export const ranges = {
  /** Row driver's payoffs: a crash is the worst round, winning the standoff the best. */
  chicken: (asymmetric: boolean): Range => span(chickenGame(asymmetric).payoffs.flat().map((p) => p[0])),
  /** Proposer: ₹0 (rejected) up to keeping everything but the smallest offer a stranger accepts. Responder: ₹0 up to the largest offer a stranger makes. */
  ultimatum: (mode: 'proposer' | 'responder'): Range =>
    mode === 'proposer' ? { worst: 0, best: PIE - STEP } : { worst: 0, best: Math.max(...HUMAN_OFFER_DIST.map((d) => d.offer)) },
  /** Per week: the sucker payoff S up to the temptation T. */
  advertising: (): Range => ({ worst: PD.S, best: PD.T }),
  /** Per market, everything the class's role can end up with. */
  startup: (role: 'founder' | 'incumbent', credible: boolean): Range =>
    role === 'founder'
      ? span([STARTUP.stayOut[0], founderPayoff(true, 'High', credible), founderPayoff(true, 'Low', credible)])
      : span([STARTUP.stayOut[1], ...(['High', 'Low'] as const).flatMap((d) => (['Fight', 'Accommodate'] as const).map((a) => leafPayoff(d, a, credible)[1]))]),
  /** Conceding after burning as much as the prize, up to winning it outright. */
  attrition: (): Range => ({ worst: -ATTRITION.V, best: ATTRITION.V }),
};

export function totalPoints(base: number, predictionCorrect: boolean | undefined, bonus = 0) {
  return base + bonus + (predictionCorrect ? PREDICTION_BONUS : 0);
}

/** The class "beats Nash" when it earned strictly more than the equilibrium benchmark. */
export function beatNash(classPayoff: number, nashPayoff: number) {
  return classPayoff > nashPayoff + 1e-9;
}
