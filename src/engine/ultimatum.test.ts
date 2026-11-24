import { describe, expect, it } from 'vitest';
import {
  OFFERS, behaviouralAccepts, bestOfferAgainst, fehrSchmidtThreshold, fehrSchmidtUtility, outcome, spne,
  responderExpected, optimalOfferVsPopulation, ALPHA_TYPES, HUMAN_OFFER_DIST,
} from './ultimatum';

describe('Ultimatum basics', () => {
  it('offers ₹0..₹10,000 in ₹1,000 steps', () => {
    expect(OFFERS).toEqual([0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]);
  });
  it('payoffs', () => {
    expect(outcome(3000, true)).toEqual([7000, 3000]);
    expect(outcome(3000, false)).toEqual([0, 0]);
  });
});

describe('SPNE', () => {
  it('offer ₹1,000 accepted, and offer ₹0 accepted are both SPNE', () => {
    const s = spne();
    expect(s.map((x) => x.offer)).toEqual([1000, 0]);
    expect(s[0].payoffs).toEqual([9000, 1000]);
    expect(s[1].payoffs).toEqual([10000, 0]);
  });
});

describe('Fehr–Schmidt thresholds', () => {
  it('α=0.25 → ₹1,667', () => expect(Math.round(fehrSchmidtThreshold(0.25))).toBe(1667));
  it('α=0.5 → ₹2,500', () => expect(Math.round(fehrSchmidtThreshold(0.5))).toBe(2500));
  it('α=1.0 → ₹3,333', () => expect(Math.round(fehrSchmidtThreshold(1))).toBe(3333));
  it('utility is zero exactly at threshold', () => {
    for (const a of [0.25, 0.5, 1]) expect(fehrSchmidtUtility(fehrSchmidtThreshold(a), a)).toBeCloseTo(0, 8);
  });
  it('accept/reject around threshold', () => {
    expect(behaviouralAccepts(2000, 0.5)).toBe(false);
    expect(behaviouralAccepts(2500, 0.5)).toBe(true);
    expect(bestOfferAgainst(0.25)).toBe(2000);
    expect(bestOfferAgainst(1)).toBe(4000);
  });
});

describe('Populations', () => {
  it('weights sum to 1', () => {
    expect(ALPHA_TYPES.reduce((s, t) => s + t.weight, 0)).toBeCloseTo(1, 10);
    expect(HUMAN_OFFER_DIST.reduce((s, t) => s + t.weight, 0)).toBeCloseTo(1, 10);
  });
  it('responder expected money falls as minimum demand rises past the SPNE', () => {
    expect(responderExpected(0)).toBeGreaterThan(responderExpected(4000));
  });
  it('optimal offer vs population is above the SPNE offer', () => {
    expect(optimalOfferVsPopulation().offer).toBeGreaterThan(1000);
  });
});
