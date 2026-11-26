/**
 * Web storage can throw (private mode, blocked storage) or come back empty. Never let it break the app.
 * 'local' persists across tabs and restarts (used for the Presenter Mode preference);
 * 'session' lives only in this tab: a refresh keeps it, a new tab or window starts fresh (used for class results).
 */
export type Area = 'local' | 'session';
const store = (area: Area) => (area === 'session' ? window.sessionStorage : window.localStorage);

export function readJSON<T>(key: string, fallback: T, area: Area = 'local'): T {
  try {
    const raw = store(area).getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown, area: Area = 'local') {
  try {
    store(area).setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string, area: Area = 'local') {
  try {
    store(area).removeItem(key);
  } catch {
    /* ignore */
  }
}
