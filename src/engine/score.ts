/**
 * Arcade scoring. Points turn each game's own payoff (rupees, profit points…) into one
 * comparable score, plus bonuses for predicting the equilibrium and guessing the mystery rival.
 */
export type GameKey = 'ultimatum' | 'chicken' | 'advertising' | 'startup' | 'attrition';

export const PREDICTION_BONUS = 100;
export const GUESS_BONUS = 100;
export const POINTS_PER_ROUND_WON = 100;

/** Performance points from the class's payoff. Chicken scores rounds won instead of payoff. */
export function performancePoints(game: GameKey, classPayoff: number, roundsWon = 0): number {
  switch (game) {
    case 'ultimatum':
      return Math.round(classPayoff / 100); // ₹100 = 1 point
    case 'chicken':
      return roundsWon * POINTS_PER_ROUND_WON;
    case 'advertising':
      return Math.round(classPayoff / 10); // ₹10k = 1 point
    case 'startup':
      return Math.round(classPayoff * 25); // 1 profit point = 25 points
    case 'attrition':
      return Math.round(classPayoff); // ₹1 = 1 point
  }
}

export function totalPoints(base: number, predictionCorrect: boolean | undefined, bonus = 0) {
  return base + bonus + (predictionCorrect ? PREDICTION_BONUS : 0);
}

/** The class "beats Nash" when it earned strictly more than the equilibrium benchmark. */
export function beatNash(classPayoff: number, nashPayoff: number) {
  return classPayoff > nashPayoff + 1e-9;
}
