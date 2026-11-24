import { useSyncExternalStore } from 'react';
import { readJSON, removeKey, writeJSON } from './storage';

export type GameId = 'chicken' | 'advertising' | 'ultimatum' | 'startup' | 'attrition';

export type GameResult = {
  classChoice: string;
  classPayoff: number;
  nashPrediction: string;
  nashPayoff: number;
  unit: string; // e.g. '₹', '₹k', 'utils'
  note?: string;
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

export function clearResult(id: GameId) {
  const next = { ...state };
  delete next[id];
  state = next;
  writeJSON(KEY, state);
  emit();
}

export function clearAllResults() {
  state = {};
  removeKey(KEY);
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useResults(): Store {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
