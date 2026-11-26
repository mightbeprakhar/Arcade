import { Bimatrix, Cell, colBestResponses, mixedNash, nashProduct, pureNash, expectedPayoffs, type MixedNE } from './bimatrix';
import { Rng, defaultRng } from './random';

/** Strategy index: 0 = Swerve (S), 1 = Drive straight (D). */
export const SWERVE = 0 as const;
export const STRAIGHT = 1 as const;
export type Move = 0 | 1;

export const CHICKEN_BASE = {
  bothSwerve: 0,
  swerveLoss: -1,
  straightWin: 1,
  crashCar: -10,
  crashTruck: -4,
};

export function chickenGame(asymmetric: boolean): Bimatrix {
  const { bothSwerve, swerveLoss, straightWin, crashCar, crashTruck } = CHICKEN_BASE;
  const rowCrash = asymmetric ? crashTruck : crashCar;
  return {
    rowPlayer: asymmetric ? 'Truck' : 'Driver A',
    colPlayer: asymmetric ? 'Car' : 'Driver B',
    rowLabels: ['Swerve', 'Straight'],
    colLabels: ['Swerve', 'Straight'],
    payoffs: [
      [
        [bothSwerve, bothSwerve],
        [swerveLoss, straightWin],
      ],
      [
        [straightWin, swerveLoss],
        [rowCrash, crashCar],
      ],
    ],
  };
}

export type ChickenSolution = {
  game: Bimatrix;
  pure: Cell[];
  mixed: MixedNE;
  /** P(both drive straight) under the MSNE */
  crashProb: number;
  /** Nash products for (row D, col S) and (row S, col D) */
  productRowStraight: number;
  productColStraight: number;
  riskDominant: Cell | null;
};

export function solveChicken(asymmetric: boolean): ChickenSolution {
  const game = chickenGame(asymmetric);
  const pure = pureNash(game);
  const mixed = mixedNash(game);
  if (!mixed) throw new Error('Chicken must have an interior MSNE');
  const crashProb = mixed.rowP1 * mixed.colP1;
  const rowStraight: Cell = { r: 1, c: 0 };
  const colStraight: Cell = { r: 0, c: 1 };
  const productRowStraight = nashProduct(game, rowStraight);
  const productColStraight = nashProduct(game, colStraight);
  const riskDominant =
    Math.abs(productRowStraight - productColStraight) < 1e-9
      ? null
      : productRowStraight > productColStraight
        ? rowStraight
        : colStraight;
  return { game, pure, mixed, crashProb, productRowStraight, productColStraight, riskDominant };
}

export function payoff(game: Bimatrix, r: Move, c: Move): [number, number] {
  return game.payoffs[r][c];
}

/** Simulate N independent encounters where both players use mixing probs pRow/pCol of driving straight. */
export function simulateEncounters(game: Bimatrix, pRow: number, pCol: number, n: number, rng: Rng = defaultRng) {
  const counts = [
    [0, 0],
    [0, 0],
  ];
  let sumRow = 0;
  let sumCol = 0;
  const crashSeries: { n: number; crashRate: number; theory: number }[] = [];
  let crashes = 0;
  const step = Math.max(1, Math.floor(n / 100));
  for (let i = 1; i <= n; i++) {
    const r = (rng() < pRow ? 1 : 0) as Move;
    const c = (rng() < pCol ? 1 : 0) as Move;
    counts[r][c]++;
    const [a, b] = game.payoffs[r][c];
    sumRow += a;
    sumCol += b;
    if (r === 1 && c === 1) crashes++;
    if (i % step === 0 || i === n) crashSeries.push({ n: i, crashRate: crashes / i, theory: pRow * pCol });
  }
  return {
    counts,
    avgRow: sumRow / n,
    avgCol: sumCol / n,
    expected: expectedPayoffs(game, pRow, pCol),
    crashSeries,
  };
}

/* ---------- Best-of-5 series against an AI driver ---------- */

export const BEST_OF = 5;
export type RoundWinner = 'class' | 'ai' | 'none';

/** The AI drives the column car and goes straight with its MSNE probability. */
export function aiChickenMove(sol: ChickenSolution, rng: Rng = defaultRng): Move {
  return rng() < sol.mixed.colP1 ? STRAIGHT : SWERVE;
}

/**
 * "Commit" power-up: the class visibly locks itself into Straight before the AI moves.
 * The AI then simply best-responds to Straight.
 */
export function commitResponse(game: Bimatrix): Move {
  return colBestResponses(game, STRAIGHT)[0];
}

/** A round is won by whoever got the higher payoff; equal payoffs (both swerve, crash) are a draw. */
export function roundWinner([a, b]: [number, number]): RoundWinner {
  return a > b ? 'class' : b > a ? 'ai' : 'none';
}

export function seriesTally(rounds: { a: Move; b: Move }[], game: Bimatrix) {
  let classWins = 0;
  let aiWins = 0;
  let classTotal = 0;
  let crashes = 0;
  rounds.forEach(({ a, b }) => {
    const p = payoff(game, a, b);
    classTotal += p[0];
    if (a === STRAIGHT && b === STRAIGHT) crashes++;
    const w = roundWinner(p);
    if (w === 'class') classWins++;
    if (w === 'ai') aiWins++;
  });
  const need = Math.ceil(BEST_OF / 2);
  const over = classWins >= need || aiWins >= need || rounds.length >= BEST_OF;
  return { classWins, aiWins, classTotal, crashes, over, played: rounds.length };
}

/** Nash benchmark for the class over n rounds: against an MSNE opponent every move earns the row MSNE value. */
export function nashSeriesValue(sol: ChickenSolution, rounds: number) {
  return sol.mixed.rowValue * rounds;
}
