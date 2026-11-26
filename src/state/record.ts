import { nashSeriesValue, payoff, seriesTally, type ChickenSolution, type Move } from '../engine/chicken';
import { PD, ROUNDS, finiteHorizonSPNE, payoffs, strategyById, type Move as AdMove } from '../engine/advertising';
import { ALPHA_TYPES, nashProposerPayoff, nashResponderPayoff, outcome, spne } from '../engine/ultimatum';
import { founderEnters, founderPayoff, incumbentPayoff, nashIncumbentPayoff, type Demand, type IncAction } from '../engine/startup';
import { ATTRITION, attritionPayoffs, solveSymmetric } from '../engine/attrition';
import { GUESS_BONUS, performancePoints } from '../engine/score';
import { recordResult } from './results';

/*
 * Each game records its Humans-vs-Nash row after every round it plays, so the closing
 * screen and the hub always reflect what the class has actually played.
 */
const pct = (x: number) => `${+(x * 100).toFixed(1)}%`;
const rupee = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/* ---------- Chicken ---------- */
export type ChickenRound = { a: Move; b: Move; committed: boolean };

export function recordChickenSeries(sol: ChickenSolution, rounds: ChickenRound[]) {
  if (!rounds.length) return;
  const t = seriesTally(rounds, sol.game);
  recordResult('chicken', {
    classChoice: `vs AI driver: won ${t.classWins}–${t.aiWins} in ${t.played} round${t.played === 1 ? '' : 's'}${t.crashes ? `, ${t.crashes} crash${t.crashes === 1 ? '' : 'es'}` : ''}`,
    classPayoff: t.classTotal,
    nashPrediction: `Mix: straight ${pct(sol.mixed.rowP1)} (MSNE value ${sol.mixed.rowValue} per round)`,
    nashPayoff: +nashSeriesValue(sol, t.played).toFixed(3),
    unit: `pts for ${sol.game.rowPlayer}`,
    basePoints: performancePoints('chicken', t.classTotal, t.classWins),
    rounds: t.played,
  });
}

export function recordChickenRoom(sol: ChickenSolution, o: { a: Move; b: Move }) {
  const g = sol.game;
  const res = payoff(g, o.a, o.b);
  recordResult('chicken', {
    classChoice: `Left vs right: ${g.rowPlayer} ${g.rowLabels[o.a]}, ${g.colPlayer} ${g.colLabels[o.b]}`,
    classPayoff: res[0] + res[1],
    nashPrediction: `Mix: ${g.rowPlayer} straight ${pct(sol.mixed.rowP1)}, ${g.colPlayer} ${pct(sol.mixed.colP1)}`,
    nashPayoff: sol.mixed.rowValue + sol.mixed.colValue,
    unit: 'pts (both drivers)',
    basePoints: 0,
    note: o.a === 1 && o.b === 1 ? 'The class crashed.' : undefined,
  });
}

/* ---------- Advertising ---------- */
export function recordAdvertising(classMoves: AdMove[], aiMoves: AdMove[], opponent: string, guessCorrect?: boolean) {
  if (!classMoves.length) return;
  const total = classMoves.reduce((s, m, i) => s + payoffs(m, aiMoves[i])[0], 0);
  const ads = classMoves.filter((m) => m === 'A').length;
  const weeks = classMoves.length;
  recordResult('advertising', {
    classChoice: `Ad ${ads}/${weeks} weeks vs ${weeks >= ROUNDS ? strategyById(opponent).name : 'the rival'}${guessCorrect === undefined ? '' : guessCorrect ? ' · guessed the rival' : ' · guess missed'}`,
    classPayoff: total,
    nashPrediction: 'Ad every week (SPNE)',
    nashPayoff: finiteHorizonSPNE(weeks).length * PD.P,
    unit: '₹k',
    basePoints: performancePoints('advertising', total),
    bonus: guessCorrect ? GUESS_BONUS : 0,
    rounds: weeks,
  });
}

/* ---------- Ultimatum ---------- */
export type UltRound =
  | { mode: 'proposer'; offer: number; alphaIdx: number; accepted: boolean }
  | { mode: 'responder'; min: number; offer: number; accepted: boolean };

/** Bank so far and what the equilibrium player would have banked against the same strangers. */
export function ultimatumBank(rounds: UltRound[]) {
  let bank = 0;
  let nash = 0;
  rounds.forEach((rd) => {
    if (rd.mode === 'proposer') {
      bank += outcome(rd.offer, rd.accepted)[0];
      nash += nashProposerPayoff(ALPHA_TYPES[rd.alphaIdx].alpha);
    } else {
      bank += outcome(rd.offer, rd.accepted)[1];
      nash += nashResponderPayoff(rd.offer);
    }
  });
  return { bank, nash, accepted: rounds.filter((r) => r.accepted).length };
}

export function recordUltimatum(rounds: UltRound[]) {
  if (!rounds.length) return;
  const mode = rounds[0].mode;
  const { bank, nash, accepted } = ultimatumBank(rounds);
  recordResult('ultimatum', {
    classChoice: `${mode === 'proposer' ? 'Proposer' : 'Responder'}, ${rounds.length} round${rounds.length === 1 ? '' : 's'}: ${accepted} accepted, bank ${rupee(bank)}`,
    classPayoff: bank,
    nashPrediction: mode === 'proposer' ? `Offer ${rupee(spne()[0].offer)} every round (SPNE)` : 'Accept any offer above ₹0',
    nashPayoff: nash,
    unit: '₹ banked',
    basePoints: performancePoints('ultimatum', bank),
    rounds: rounds.length,
  });
}

/* ---------- Startup ---------- */
export type Market = { entered: boolean; demand: Demand; action: IncAction };
export type StartupRole = 'founder' | 'incumbent';

export function startupScore(role: StartupRole, markets: Market[], p: number, credible: boolean) {
  let score = 0;
  let nash = 0;
  markets.forEach((m) => {
    if (role === 'founder') {
      score += founderPayoff(m.entered, m.demand, credible);
      nash += founderPayoff(founderEnters(p, credible), m.demand, credible);
    } else {
      score += incumbentPayoff(m.entered, m.demand, m.action, credible);
      nash += nashIncumbentPayoff(m.entered, m.demand, credible);
    }
  });
  return { score, nash };
}

export function recordStartup(role: StartupRole, markets: Market[], p: number, credible: boolean) {
  if (!markets.length) return;
  const { score, nash } = startupScore(role, markets, p, credible);
  const entries = markets.filter((m) => m.entered).length;
  const fights = markets.filter((m) => m.entered && m.action === 'Fight').length;
  recordResult('startup', {
    classChoice: role === 'founder' ? `Founder: entered ${entries}/${markets.length} markets` : `Incumbent: fought ${fights} of ${entries} entries`,
    classPayoff: score,
    nashPrediction: role === 'founder' ? `${founderEnters(p, credible) ? 'Enter' : 'Stay out'} every market (p = ${p.toFixed(2)}${credible ? ', credible' : ''})` : `Best-respond: ${credible ? 'fight only in Low' : 'always accommodate'}`,
    nashPayoff: nash,
    unit: `profit pts as ${role}`,
    basePoints: performancePoints('startup', score),
    rounds: markets.length,
  });
}

/* ---------- Waiting game ---------- */
export function recordAttrition(rd: { minute: number; classConceded: boolean; escalating: boolean; g: number }) {
  const { V, c } = ATTRITION;
  const s = solveSymmetric(V, c);
  const pay = attritionPayoffs(rd.minute, rd.classConceded, V, c, rd.escalating ? rd.g : 0).classPayoff;
  recordResult('attrition', {
    classChoice: `${rd.classConceded ? 'Conceded' : 'Outlasted the roommate'} after ${rd.minute} min`,
    classPayoff: Math.round(pay),
    nashPrediction: `Quit at rate λ = ${s.lambda}/min (mean ${s.meanPerPlayer} min)`,
    nashPayoff: s.expectedPayoff,
    unit: '₹',
    basePoints: performancePoints('attrition', pay),
  });
}
