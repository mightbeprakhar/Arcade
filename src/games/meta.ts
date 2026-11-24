import type { GameId } from '../state/results';

export type GameMeta = {
  id: GameId;
  path: string;
  number: number;
  title: string;
  concept: string;
  hook: string;
  accent: string;
  icon: string;
};

/** Order = presentation order on the hub. */
export const GAMES: GameMeta[] = [
  { id: 'ultimatum', path: '/ultimatum', number: 1, title: 'Ultimatum Game', concept: 'Sequential bargaining · SPNE vs fairness', hook: 'Split ₹10,000. One offer. Take it or nobody gets anything.', accent: '#22d3ee', icon: '🤝' },
  { id: 'chicken', path: '/chicken', number: 2, title: 'Game of Chicken', concept: 'Anti-coordination · mixed strategies · risk dominance', hook: 'One lane, two drivers, nobody wants to blink first.', accent: '#fbbf24', icon: '🚗' },
  { id: 'advertising', path: '/advertising', number: 3, title: 'Advertising Game', concept: 'Repeated Prisoner’s Dilemma · reciprocity', hook: 'Two coffee shops, twenty weeks, one ad budget.', accent: '#f472b6', icon: '☕' },
  { id: 'attrition', path: '/attrition', number: 4, title: 'The Waiting Game', concept: 'War of attrition · rent dissipation', hook: 'The trash is overflowing. Whoever cracks first takes it out.', accent: '#a78bfa', icon: '🗑️' },
  { id: 'startup', path: '/startup', number: 5, title: 'Startup Entry', concept: 'Sequential game with chance · credible threats', hook: 'Enter the market and risk a price war — or stay out?', accent: '#a3e635', icon: '🚀' },
];

export const metaById = (id: GameId) => GAMES.find((g) => g.id === id)!;
