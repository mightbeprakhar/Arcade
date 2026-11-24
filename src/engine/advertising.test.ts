import { describe, expect, it } from 'vitest';
import {
  PD, finiteHorizonSPNE, grimDeltaThreshold, isPrisonersDilemma, playMatch, runTournament, solveStageGame,
  strategyById, cooperateValue, defectValue,
} from './advertising';

describe('Advertising stage game', () => {
  it('is a valid Prisoner’s Dilemma', () => {
    expect(PD).toEqual({ T: 80, R: 60, P: 40, S: 30 });
    expect(isPrisonersDilemma()).toBe(true);
  });
  it('Ad is dominant; (A,A) is the unique NE and is Pareto-dominated by (S,S)', () => {
    const s = solveStageGame();
    expect(s.rowDominant).toBe(1);
    expect(s.colDominant).toBe(1);
    expect(s.ne).toEqual([{ r: 1, c: 1 }]);
    expect(s.paretoBetter).toEqual({ r: 0, c: 0 });
  });
});

describe('20-round matches', () => {
  it('TFT vs Always Ad = (790, 840)', () => {
    const m = playMatch(strategyById('tft'), strategyById('alwaysAd'));
    expect([m.totalA, m.totalB]).toEqual([790, 840]);
  });
  it('TFT vs TFT = (1200, 1200)', () => {
    const m = playMatch(strategyById('tft'), strategyById('tft'));
    expect([m.totalA, m.totalB]).toEqual([1200, 1200]);
  });
  it('Grim vs Always Save = (1200, 1200)', () => {
    const m = playMatch(strategyById('grim'), strategyById('alwaysSave'));
    expect([m.totalA, m.totalB]).toEqual([1200, 1200]);
  });
});

describe('Tournament', () => {
  it('with 0% noise, reciprocal strategies (Grim, TFT) top the table', () => {
    const t = runTournament(undefined, { noise: 0 });
    expect(t.slice(0, 2).map((r) => r.id).sort()).toEqual(['grim', 'tft']);
  });
  it('with 5% noise, Always Ad climbs near the top (top 2)', () => {
    const t = runTournament(undefined, { noise: 0.05 });
    expect(t.find((r) => r.id === 'alwaysAd')!.rank).toBeLessThanOrEqual(2);
    const t0 = runTournament(undefined, { noise: 0 });
    expect(t.find((r) => r.id === 'alwaysAd')!.rank).toBeLessThan(t0.find((r) => r.id === 'alwaysAd')!.rank);
  });
});

describe('Horizon results', () => {
  it('Grim sustains cooperation iff δ ≥ 0.5', () => {
    expect(grimDeltaThreshold()).toBe(0.5);
    expect(cooperateValue(0.5)).toBeCloseTo(defectValue(0.5), 10);
    expect(cooperateValue(0.6)).toBeGreaterThan(defectValue(0.6));
    expect(cooperateValue(0.4)).toBeLessThan(defectValue(0.4));
  });
  it('finite horizon SPNE is Ad every round', () => {
    expect(finiteHorizonSPNE(20)).toEqual(Array(20).fill('A'));
  });
});
