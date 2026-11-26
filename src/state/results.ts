import { useSyncExternalStore } from 'react';
import { readJSON, removeKey, writeJSON } from './storage';
import { beatNash, totalPoints } from '../engine/score';

export type GameId = 'chicken' | 'advertising' | 'ultimatum' | 'startup' | 'attrition';

export type GameResult = {
  classChoice: string;
  classPayoff: number;
  nashPrediction: string;
  nashPayoff: number;
  unit: string; // e.g. '₹', '₹k', 'utils'
  note?: string;
  /** Performance points for the play itself (see engine/score.ts). */
  basePoints: number;
  /** Extra points, e.g. guessing the mystery rival. */
  bonus?: number;
  /** Rounds played so far in a series (results are recorded after every round). */
  rounds?: number;
  at: number;
};

type Store = Partial<Record<GameId, GameResult>>;

const KEY = 'gt-arcade-results-v1';
let state: Store = typeof window === 'undefined' ? {} : readJSON<Store>(KEY, {});
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function recordResult(id: GameId, r: Omit<GameResult, 'at'>) {
  state = { ...state, [id]: { ...r, at: Date.now() } };
  writeJSON(KEY, state);
  emit();
}

/* ---------- Predictions (the vote before each Solve stage) ---------- */
type Predictions = Partial<Record<GameId, boolean>>;
const PKEY = 'gt-arcade-predictions-v1';
let predictions: Predictions = typeof window === 'undefined' ? {} : readJSON<Predictions>(PKEY, {});

export function recordPrediction(id: GameId, correct: boolean) {
  predictions = { ...predictions, [id]: correct };
  writeJSON(PKEY, predictions);
  emit();
}

export function usePredictions(): Predictions {
  return useSyncExternalStore(subscribe, () => predictions, () => predictions);
}

/** Total arcade points for one game: play + bonus + prediction. */
export function pointsFor(id: GameId, results: Partial<Record<GameId, GameResult>>, preds: Predictions) {
  const r = results[id];
  if (!r && preds[id] === undefined) return null;
  return totalPoints(r?.basePoints ?? 0, preds[id], r?.bonus ?? 0);
}

export function beatNashFor(r: GameResult | undefined) {
  return !!r && beatNash(r.classPayoff, r.nashPayoff);
}

export function clearResult(id: GameId) {
  const next = { ...state };
  delete next[id];
  state = next;
  writeJSON(KEY, state);
  emit();
}

export function clearAllResults() {
  state = {};
  predictions = {};
  removeKey(KEY);
  removeKey(PKEY);
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useResults(): Store {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
