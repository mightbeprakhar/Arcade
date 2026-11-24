import { Rng, defaultRng, sampleIndex } from './random';

export const PIE = 10000;
export const STEP = 1000;
export const OFFERS = Array.from({ length: PIE / STEP + 1 }, (_, i) => i * STEP);

export function outcome(offer: number, accepted: boolean): [number, number] {
  return accepted ? [PIE - offer, offer] : [0, 0];
}

/** A purely self-interested responder accepts any x > 0 (indifferent at 0). */
export function rationalAccepts(offer: number) {
  return offer > 0;
}

export type SPNE = { offer: number; responderRule: string; payoffs: [number, number] };

/**
 * Discrete game SPNEs by backward induction.
 * 1. Responder accepts every x > 0, rejects 0 → Proposer offers smallest positive step.
 * 2. Responder accepts every x ≥ 0 → Proposer offers 0.
 */
export function spne(): SPNE[] {
  return [
    { offer: STEP, responderRule: 'Accept any x > 0, reject x = 0', payoffs: outcome(STEP, true) },
    { offer: 0, responderRule: 'Accept any x ≥ 0', payoffs: outcome(0, true) },
  ];
}

/** Fehr–Schmidt (disadvantageous inequity only): U_R = x − α·max(PIE − 2x, 0). */
export function fehrSchmidtUtility(offer: number, alpha: number) {
  return offer - alpha * Math.max(PIE - 2 * offer, 0);
}

/** Responder rejects if x < PIE·α/(1+2α). */
export function fehrSchmidtThreshold(alpha: number) {
  return (PIE * alpha) / (1 + 2 * alpha);
}

export function behaviouralAccepts(offer: number, alpha: number) {
  return offer >= fehrSchmidtThreshold(alpha) - 1e-9;
}

/** Smallest offer on the ₹1,000 grid that a responder with α accepts. */
export function bestOfferAgainst(alpha: number) {
  const t = fehrSchmidtThreshold(alpha);
  return OFFERS.find((x) => x >= t - 1e-9) ?? PIE;
}

/** Hidden-α AI responder population (class plays Proposer). */
export const ALPHA_TYPES = [
  { alpha: 0, weight: 0.25, label: 'Pure money-maximiser' },
  { alpha: 0.25, weight: 0.3, label: 'Mildly fair' },
  { alpha: 0.5, weight: 0.3, label: 'Fair-minded' },
  { alpha: 1.0, weight: 0.15, label: 'Strongly fair' },
];

export function drawAlpha(rng: Rng = defaultRng) {
  return ALPHA_TYPES[sampleIndex(ALPHA_TYPES.map((t) => t.weight), rng)];
}

/** P(accept | offer) against the hidden-α population. α=0 accepts any x>0 (rejects 0). */
export function acceptProbability(offer: number) {
  return ALPHA_TYPES.reduce((s, t) => {
    const acc = t.alpha === 0 ? rationalAccepts(offer) : behaviouralAccepts(offer, t.alpha);
    return s + (acc ? t.weight : 0);
  }, 0);
}

export function aiResponderAccepts(offer: number, alpha: number) {
  return alpha === 0 ? rationalAccepts(offer) : behaviouralAccepts(offer, alpha);
}

/** Proposer's expected payoff per offer against the population. */
export function proposerExpectedCurve() {
  return OFFERS.map((x) => {
    const p = acceptProbability(x);
    return { offer: x, pAccept: p, expected: p * (PIE - x) };
  });
}

export function optimalOfferVsPopulation() {
  return proposerExpectedCurve().reduce((b, r) => (r.expected > b.expected ? r : b));
}

/**
 * Human-like AI proposer for the strategy-method mode (class = Responder).
 * Shape follows the experimental literature: mode at 40–50% of the pie.
 */
export const HUMAN_OFFER_DIST: { offer: number; weight: number }[] = [
  { offer: 0, weight: 0.02 },
  { offer: 1000, weight: 0.05 },
  { offer: 2000, weight: 0.08 },
  { offer: 3000, weight: 0.15 },
  { offer: 4000, weight: 0.3 },
  { offer: 5000, weight: 0.38 },
  { offer: 6000, weight: 0.02 },
];

export function drawHumanOffer(rng: Rng = defaultRng) {
  return HUMAN_OFFER_DIST[sampleIndex(HUMAN_OFFER_DIST.map((d) => d.weight), rng)].offer;
}

/** Responder's expected money for a minimum acceptable offer m vs the human proposer distribution. */
export function responderExpected(minAccept: number) {
  return HUMAN_OFFER_DIST.reduce((s, d) => s + (d.offer >= minAccept ? d.weight * d.offer : 0), 0);
}

export function responderExpectedCurve() {
  return OFFERS.filter((m) => m <= 6000).map((m) => ({ min: m, expected: responderExpected(m) }));
}
