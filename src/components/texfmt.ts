/** Helpers to build KaTeX strings from engine numbers (no hard-coded payoffs in UI). */
export function num(x: number, digits = 4): string {
  if (Number.isInteger(x)) return String(x);
  const s = x.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

/** Wrap negatives in parentheses for products: 3·(−1). */
export function par(x: number, digits = 4) {
  return x < 0 ? `(${num(x, digits)})` : num(x, digits);
}

/** Render c0 + c1·v as tex, e.g. "1 - 11q", "-q". */
export function lin(c0: number, c1: number, v: string) {
  const term = (c: number) => (c === 1 ? v : c === -1 ? `-${v}` : `${num(c)}${v}`);
  if (c1 === 0) return num(c0);
  if (c0 === 0) return term(c1);
  return c1 < 0 ? `${num(c0)} - ${term(-c1)}` : `${num(c0)} + ${term(c1)}`;
}

export const rupeeTex = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`.replace('₹', '\\text{₹}');
