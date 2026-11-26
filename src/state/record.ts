import { payoff, type ChickenSolution, type Move } from '../engine/chicken';
import { PD, ROUNDS, finiteHorizonSPNE, payoffs, strategyById, type Move as AdMove } from '../engine/advertising';
import { outcome, rationalAccepts, spne } from '../engine/ultimatum';
import { STARTUP, leafPayoff, type solveTree } from '../engine/startup';
import { ATTRITION, attritionPayoffs, solveSymmetric } from '../engine/attrition';
import { recordResult } from './results';

/*
 * Each game records its Humans-vs-Nash row the moment a Play round finishes,
 * so the closing screen counts every game the class played, even if Debrief is skipped.
 */
const pct = (x: number) => `${+(x * 100).toFixed(1)}%`;
const rupee = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export function recordChicken(sol: ChickenSolution, o: { a: Move; b: Move }) {
  const g = sol.game;
  const res = payoff(g, o.a, o.b);
  recordResult('chicken', {
    classChoice: `${g.rowPlayer} ${g.rowLabels[o.a]}, ${g.colPlayer} ${g.colLabels[o.b]}`,
    classPayoff: res[0] + res[1],
    nashPrediction: `Mix: ${g.rowPlayer} straight ${pct(sol.mixed.rowP1)}, ${g.colPlayer} ${pct(sol.mixed.colP1)}`,
    nashPayoff: sol.mixed.rowValue + sol.mixed.colValue,
    unit: 'pts (both drivers)',
    note: o.a === 1 && o.b === 1 ? 'The class crashed.' : undefined,
  });
}

export function recordAdvertising(classMoves: AdMove[], aiMoves: AdMove[], opponent: string) {
  if (classMoves.length < ROUNDS) return;
  const total = classMoves.reduce((s, m, i) => s + payoffs(m, aiMoves[i])[0], 0);
  const ads = classMoves.filter((m) => m === 'A').length;
  recordResult('advertising', {
    classChoice: `Ad ${ads}/${ROUNDS} weeks vs ${strategyById(opponent).name}`,
    classPayoff: total,
    nashPrediction: 'Ad every week (SPNE)',
    nashPayoff: finiteHorizonSPNE().length * PD.P,
    unit: '₹k',
  });
}

export type UltRoundLike =
  | { mode: 'proposer'; offer: number; alphaIdx: number; accepted: boolean }
  | { mode: 'responder'; min: number; offer: number; accepted: boolean };

export function ultimatumSummary(rd: UltRoundLike) {
  const [s1] = spne();
  const classPay = outcome(rd.offer, rd.accepted)[rd.mode === 'proposer' ? 0 : 1];
  const nash = rd.mode === 'proposer' ? { label: `Offer ${rupee(s1.offer)} (SPNE)`, pay: s1.payoffs[0] } : { label: 'Accept any offer above ₹0', pay: rationalAccepts(rd.offer) ? rd.offer : 0 };
  const choice = rd.mode === 'proposer' ? `Offered ${rupee(rd.offer)}: ${rd.accepted ? 'accepted' : 'rejected'}` : `Minimum ${rupee(rd.min)}; offered ${rupee(rd.offer)}: ${rd.accepted ? 'accepted' : 'rejected'}`;
  return { classPay, nash, choice };
}
export function recordUltimatum(rd: UltRoundLike) {
  const { classPay, nash, choice } = ultimatumSummary(rd);
  recordResult('ultimatum', { classChoice: choice, classPayoff: classPay, nashPrediction: nash.label, nashPayoff: nash.pay, unit: '₹' });
}

export type StartupRoundLike = { entered: false } | { entered: true; demand: 'High' | 'Low'; action: 'Fight' | 'Accommodate' };
export function recordStartup(rd: StartupRoundLike, sol: ReturnType<typeof solveTree>, p: number, credible: boolean) {
  const pay = rd.entered ? leafPayoff(rd.demand, rd.action, credible)[0] : STARTUP.stayOut[0];
  const nashPay = sol.decision === 'Enter' ? sol.euEnter : STARTUP.stayOut[0];
  recordResult('startup', {
    classChoice: rd.entered ? `Entered; demand ${rd.demand}; incumbent chose ${rd.action}` : 'Stayed out',
    classPayoff: pay,
    nashPrediction: `${sol.decision} (p = ${p.toFixed(2)}${credible ? ', credible threat' : ''})`,
    nashPayoff: +nashPay.toFixed(2),
    unit: 'profit pts',
    note: 'Nash payoff is the expected value',
  });
}

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
  });
}
