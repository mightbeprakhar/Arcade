/**
 * Generic 2x2 bimatrix game solver.
 * payoffs[r][c] = [rowPayoff, colPayoff]
 */
export type Pair = [number, number];
export type Bimatrix = {
  rowLabels: [string, string];
  colLabels: [string, string];
  rowPlayer: string;
  colPlayer: string;
  payoffs: [[Pair, Pair], [Pair, Pair]];
};

export type Cell = { r: 0 | 1; c: 0 | 1 };

const IDX = [0, 1] as const;

/** Row's best responses to each column c: returns rows that maximise row payoff. */
export function rowBestResponses(g: Bimatrix, c: 0 | 1): (0 | 1)[] {
  const vals = IDX.map((r) => g.payoffs[r][c][0]);
  const m = Math.max(...vals);
  return IDX.filter((r) => vals[r] === m);
}

export function colBestResponses(g: Bimatrix, r: 0 | 1): (0 | 1)[] {
  const vals = IDX.map((c) => g.payoffs[r][c][1]);
  const m = Math.max(...vals);
  return IDX.filter((c) => vals[c] === m);
}

export function pureNash(g: Bimatrix): Cell[] {
  const out: Cell[] = [];
  for (const r of IDX)
    for (const c of IDX)
      if (rowBestResponses(g, c).includes(r) && colBestResponses(g, r).includes(c)) out.push({ r, c });
  return out;
}

/** Strictly dominant strategy for row (if any). */
export function rowDominant(g: Bimatrix): 0 | 1 | null {
  const a = g.payoffs;
  if (a[0][0][0] > a[1][0][0] && a[0][1][0] > a[1][1][0]) return 0;
  if (a[1][0][0] > a[0][0][0] && a[1][1][0] > a[0][1][0]) return 1;
  return null;
}

export function colDominant(g: Bimatrix): 0 | 1 | null {
  const a = g.payoffs;
  if (a[0][0][1] > a[0][1][1] && a[1][0][1] > a[1][1][1]) return 0;
  if (a[0][1][1] > a[0][0][1] && a[1][1][1] > a[1][0][1]) return 1;
  return null;
}

export type MixedNE = {
  /** probability row plays row index 1 */
  rowP1: number;
  /** probability col plays col index 1 */
  colP1: number;
  rowValue: number;
  colValue: number;
};

/**
 * Fully mixed NE via indifference. Each player's mix is chosen to make the
 * OPPONENT indifferent, so it is determined by the opponent's payoffs.
 * Returns null if no interior mixed equilibrium exists.
 */
export function mixedNash(g: Bimatrix): MixedNE | null {
  const A = (r: number, c: number) => g.payoffs[r][c][0];
  const B = (r: number, c: number) => g.payoffs[r][c][1];
  // Row mixes with P(row=1)=p so col is indifferent:
  // (1-p)B00 + pB10 = (1-p)B01 + pB11
  const denR = B(0, 0) - B(1, 0) - B(0, 1) + B(1, 1);
  const denC = A(0, 0) - A(0, 1) - A(1, 0) + A(1, 1);
  if (denR === 0 || denC === 0) return null;
  const p = (B(0, 0) - B(0, 1)) / denR;
  const q = (A(0, 0) - A(1, 0)) / denC;
  if (!(p > 0 && p < 1 && q > 0 && q < 1)) return null;
  const rowValue = (1 - q) * A(0, 0) + q * A(0, 1);
  const colValue = (1 - p) * B(0, 0) + p * B(1, 0);
  return { rowP1: p, colP1: q, rowValue, colValue };
}

/** Expected payoffs when row plays index1 w.p. p and col plays index1 w.p. q. */
export function expectedPayoffs(g: Bimatrix, p: number, q: number): Pair {
  let er = 0;
  let ec = 0;
  for (const r of IDX)
    for (const c of IDX) {
      const w = (r ? p : 1 - p) * (c ? q : 1 - q);
      er += w * g.payoffs[r][c][0];
      ec += w * g.payoffs[r][c][1];
    }
  return [er, ec];
}

/**
 * Nash product (Harsanyi–Selten) for a strict pure equilibrium:
 * product of the two players' deviation losses.
 */
export function nashProduct(g: Bimatrix, cell: Cell): number {
  const { r, c } = cell;
  const or = (1 - r) as 0 | 1;
  const oc = (1 - c) as 0 | 1;
  const rowLoss = g.payoffs[r][c][0] - g.payoffs[or][c][0];
  const colLoss = g.payoffs[r][c][1] - g.payoffs[r][oc][1];
  return rowLoss * colLoss;
}

export function isParetoDominated(g: Bimatrix, cell: Cell): Cell | null {
  const [x, y] = g.payoffs[cell.r][cell.c];
  for (const r of IDX)
    for (const c of IDX) {
      const [a, b] = g.payoffs[r][c];
      if (a >= x && b >= y && (a > x || b > y)) return { r, c };
    }
  return null;
}
