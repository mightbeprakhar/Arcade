import type { GameId } from '../state/results';

export type GameMeta = {
  id: GameId;
  path: string;
  number: number;
  title: string;
  concept: string;
  hook: string;
  /** All games share the one accent (red pen); kept as a field so components stay generic. */
  accent: string;
};

/** Order = presentation order on the hub. */
export const GAMES: GameMeta[] = [
  { id: 'ultimatum', path: '/ultimatum', number: 1, title: 'Ultimatum Game', concept: 'Bargaining · fairness vs SPNE', hook: 'Split ₹10,000. One offer. Take it or nobody gets anything.', accent: '#b8361f' },
  { id: 'chicken', path: '/chicken', number: 2, title: 'Game of Chicken', concept: 'Mixed strategies · risk dominance', hook: 'One lane, two drivers, nobody wants to blink first.', accent: '#b8361f' },
  { id: 'advertising', path: '/advertising', number: 3, title: 'Advertising Game', concept: 'Repeated Prisoner’s Dilemma', hook: 'Two coffee shops, twenty weeks, one ad budget.', accent: '#b8361f' },
  { id: 'attrition', path: '/attrition', number: 4, title: 'The Waiting Game', concept: 'War of attrition', hook: 'The trash is overflowing. Whoever cracks first takes it out.', accent: '#b8361f' },
  { id: 'startup', path: '/startup', number: 5, title: 'Startup Entry', concept: 'Chance · credible threats', hook: 'Enter the market and risk a price war, or stay out?', accent: '#b8361f' },
];

export const metaById = (id: GameId) => GAMES.find((g) => g.id === id)!;
