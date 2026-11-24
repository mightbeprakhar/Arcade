import { Bimatrix, colDominant, isParetoDominated, pureNash, rowDominant } from './bimatrix';
import { Rng, defaultRng, mulberry32 } from './random';

export type Move = 'A' | 'S'; // Ad or Save
export const PD = { T: 80, R: 60, P: 40, S: 30 };
export const ROUNDS = 20;

export function payoffs(a: Move, b: Move): [number, number] {
  const { T, R, P, S } = PD;
  if (a === 'S' && b === 'S') return [R, R];
  if (a === 'A' && b === 'S') return [T, S];
  if (a === 'S' && b === 'A') return [S, T];
  return [P, P];
}

export function advertisingGame(): Bimatrix {
  return {
    rowPlayer: 'Shop A',
    colPlayer: 'Shop B',
    rowLabels: ['Save', 'Ad'],
    colLabels: ['Save', 'Ad'],
    payoffs: [
      [payoffs('S', 'S'), payoffs('S', 'A')],
      [payoffs('A', 'S'), payoffs('A', 'A')],
    ],
  };
}

export function isPrisonersDilemma(p = PD) {
  return p.T > p.R && p.R > p.P && p.P > p.S && 2 * p.R > p.T + p.S;
}

export function solveStageGame() {
  const g = advertisingGame();
  const ne = pureNash(g);
  return {
    game: g,
    ne,
    rowDominant: rowDominant(g),
    colDominant: colDominant(g),
    paretoBetter: ne.length ? isParetoDominated(g, ne[0]) : null,
    isPD: isPrisonersDilemma(),
  };
}

/** Grim trigger sustains cooperation iff delta >= (T-R)/(T-P). */
export function grimDeltaThreshold(p = PD) {
  return (p.T - p.R) / (p.T - p.P);
}

/** Present value comparison for the infinite-horizon sidebar. */
export function cooperateValue(delta: number, p = PD) {
  return p.R / (1 - delta);
}
export function defectValue(delta: number, p = PD) {
  return p.T + (delta * p.P) / (1 - delta);
}

export type History = { mine: Move[]; theirs: Move[] };
export type Strategy = {
  id: string;
  name: string;
  short: string;
  description: string;
  nice: boolean;
  /** intended move given history */
  move: (h: History, rng: Rng) => Move;
};

const last = (arr: Move[]) => arr[arr.length - 1];

export const STRATEGIES: Strategy[] = [
  {
    id: 'alwaysAd',
    name: 'Always Ad',
    short: 'ALL-A',
    description: 'Advertises every single round, no matter what.',
    nice: false,
    move: () => 'A',
  },
  {
    id: 'alwaysSave',
    name: 'Always Save',
    short: 'ALL-S',
    description: 'Never advertises. Trusting to a fault.',
    nice: true,
    move: () => 'S',
  },
  {
    id: 'tft',
    name: 'Tit-for-Tat',
    short: 'TFT',
    description: 'Saves first, then copies whatever the rival did last round.',
    nice: true,
    move: (h) => (h.theirs.length === 0 ? 'S' : last(h.theirs)),
  },
  {
    id: 'grim',
    name: 'Grim Trigger',
    short: 'GRIM',
    description: 'Saves until the rival advertises once — then advertises forever.',
    nice: true,
    move: (h) => (h.theirs.includes('A') ? 'A' : 'S'),
  },
  {
    id: 'pavlov',
    name: 'Pavlov',
    short: 'WSLS',
    description: 'Win-stay, lose-shift: repeats its move after a good result (T or R), switches after a bad one (P or S).',
    nice: true,
    move: (h) => {
      if (h.mine.length === 0) return 'S';
      const m = last(h.mine);
      const [mine] = payoffs(m, last(h.theirs));
      const won = mine >= PD.R;
      return won ? m : m === 'A' ? 'S' : 'A';
    },
  },
  {
    id: 'gtft',
    name: 'Generous TFT',
    short: 'GTFT',
    description: 'Like Tit-for-Tat, but forgives an Ad 25% of the time.',
    nice: true,
    move: (h, rng) => {
      if (h.theirs.length === 0) return 'S';
      if (last(h.theirs) === 'S') return 'S';
      return rng() < GTFT_FORGIVENESS ? 'S' : 'A';
    },
  },
  {
    id: 'random',
    name: 'Random',
    short: 'RND',
    description: 'Flips a fair coin every round.',
    nice: false,
    move: (_h, rng) => (rng() < 0.5 ? 'A' : 'S'),
  },
];

export const GTFT_FORGIVENESS = 0.25;

export function strategyById(id: string): Strategy {
  const s = STRATEGIES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown strategy ${id}`);
  return s;
}

const flip = (m: Move): Move => (m === 'A' ? 'S' : 'A');

export type RoundRecord = { round: number; a: Move; b: Move; pa: number; pb: number; cumA: number; cumB: number };

/** Play a match. noise = probability each intended move is flipped (execution error). */
export function playMatch(
  sa: Strategy,
  sb: Strategy,
  rounds = ROUNDS,
  noise = 0,
  rng: Rng = defaultRng,
): { totalA: number; totalB: number; rounds: RoundRecord[] } {
  const ha: History = { mine: [], theirs: [] };
  const hb: History = { mine: [], theirs: [] };
  let cumA = 0;
  let cumB = 0;
  const recs: RoundRecord[] = [];
  for (let t = 1; t <= rounds; t++) {
    let a = sa.move(ha, rng);
    let b = sb.move(hb, rng);
    if (noise > 0 && rng() < noise) a = flip(a);
    if (noise > 0 && rng() < noise) b = flip(b);
    const [pa, pb] = payoffs(a, b);
    cumA += pa;
    cumB += pb;
    ha.mine.push(a);
    ha.theirs.push(b);
    hb.mine.push(b);
    hb.theirs.push(a);
    recs.push({ round: t, a, b, pa, pb, cumA, cumB });
  }
  return { totalA: cumA, totalB: cumB, rounds: recs };
}

/** AI response for one round when the class plays shop A live. */
export function aiMove(s: Strategy, classMoves: Move[], aiMoves: Move[], rng: Rng = defaultRng): Move {
  return s.move({ mine: aiMoves, theirs: classMoves }, rng);
}

export type TournamentRow = { id: string; name: string; short: string; total: number; avgPerRound: number; rank: number };

/**
 * Round-robin tournament (each pair once, plus self-play, as in Axelrod).
 * Stochastic results are averaged over `reps` repetitions with a seeded RNG.
 */
export function runTournament(
  strategies: Strategy[] = STRATEGIES,
  opts: { rounds?: number; noise?: number; reps?: number; seed?: number; selfPlay?: boolean } = {},
): TournamentRow[] {
  const { rounds = ROUNDS, noise = 0, reps = 200, seed = 42, selfPlay = true } = opts;
  const rng = mulberry32(seed);
  const totals = new Map<string, number>(strategies.map((s) => [s.id, 0]));
  const games = new Map<string, number>(strategies.map((s) => [s.id, 0]));
  for (let rep = 0; rep < reps; rep++) {
    for (let i = 0; i < strategies.length; i++) {
      for (let j = i; j < strategies.length; j++) {
        if (i === j && !selfPlay) continue;
        const a = strategies[i];
        const b = strategies[j];
        const m = playMatch(a, b, rounds, noise, rng);
        if (i === j) {
          // self-play: count one copy's score so every strategy plays N matches
          totals.set(a.id, totals.get(a.id)! + (m.totalA + m.totalB) / 2);
          games.set(a.id, games.get(a.id)! + 1);
        } else {
          totals.set(a.id, totals.get(a.id)! + m.totalA);
          totals.set(b.id, totals.get(b.id)! + m.totalB);
          games.set(a.id, games.get(a.id)! + 1);
          games.set(b.id, games.get(b.id)! + 1);
        }
      }
    }
  }
  const rows = strategies.map((s) => {
    const total = totals.get(s.id)! / reps;
    const n = games.get(s.id)! / reps;
    return { id: s.id, name: s.name, short: s.short, total, avgPerRound: total / (n * rounds), rank: 0 };
  });
  rows.sort((x, y) => y.total - x.total);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

/** In a finite game with a known last round, backward induction gives Ad every round. */
export function finiteHorizonSPNE(rounds = ROUNDS): Move[] {
  return Array.from({ length: rounds }, () => 'A' as Move);
}
