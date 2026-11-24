import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from './storage';

/* ---------- Presenter mode (global) ---------- */
type PresenterCtx = { presenter: boolean; togglePresenter: () => void; captions: boolean; toggleCaptions: () => void };
const PresenterContext = createContext<PresenterCtx>({
  presenter: false,
  togglePresenter: () => {},
  captions: true,
  toggleCaptions: () => {},
});

export function PresenterProvider({ children }: { children: ReactNode }) {
  const [presenter, setPresenter] = useState<boolean>(() => readJSON('gt-presenter', false));
  const [captions, setCaptions] = useState<boolean>(true);
  useEffect(() => {
    document.documentElement.classList.toggle('presenter', presenter);
    writeJSON('gt-presenter', presenter);
  }, [presenter]);
  const togglePresenter = useCallback(() => setPresenter((p) => !p), []);
  const toggleCaptions = useCallback(() => setCaptions((p) => !p), []);
  return (
    <PresenterContext.Provider value={{ presenter, togglePresenter, captions, toggleCaptions }}>
      {children}
    </PresenterContext.Provider>
  );
}

export const usePresenter = () => useContext(PresenterContext);

export function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.().catch(() => {});
    else void document.exitFullscreen?.().catch(() => {});
  } catch {
    /* unsupported */
  }
}

/* ---------- Builds: step-by-step reveals that consume → / ← before the stage changes ---------- */
export type BuildHandler = { next: () => boolean; prev: () => boolean };
type BuildRegistry = { register: (id: string, h: BuildHandler) => () => void };
const BuildContext = createContext<BuildRegistry | null>(null);

export function useBuildRegistry() {
  const handlers = useRef(new Map<string, BuildHandler>());
  const register = useCallback((id: string, h: BuildHandler) => {
    handlers.current.set(id, h);
    return () => {
      handlers.current.delete(id);
    };
  }, []);
  const next = useCallback(() => {
    for (const h of handlers.current.values()) if (h.next()) return true;
    return false;
  }, []);
  const prev = useCallback(() => {
    const list = [...handlers.current.values()].reverse();
    for (const h of list) if (h.prev()) return true;
    return false;
  }, []);
  return { registry: { register }, next, prev };
}

export const BuildProvider = BuildContext.Provider;

let buildSeq = 0;

/**
 * A reveal-in-steps counter wired to the presenter keys.
 * Starts at `initial`, → increments until `total`, ← decrements back to `initial`.
 */
export function useBuildSteps(total: number, initial = 1) {
  const reg = useContext(BuildContext);
  const [shown, setShown] = useState(Math.min(initial, total));
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const totalRef = useRef(total);
  totalRef.current = total;
  const idRef = useRef(`b${++buildSeq}`);
  useEffect(() => {
    if (!reg) return;
    return reg.register(idRef.current, {
      next: () => {
        if (shownRef.current < totalRef.current) {
          shownRef.current += 1;
          setShown(shownRef.current);
          return true;
        }
        return false;
      },
      prev: () => {
        if (shownRef.current > initial) {
          shownRef.current -= 1;
          setShown(shownRef.current);
          return true;
        }
        return false;
      },
    });
  }, [reg, initial]);
  const advance = useCallback(() => setShown((s) => Math.min(totalRef.current, s + 1)), []);
  const showAll = useCallback(() => setShown(totalRef.current), []);
  const reset = useCallback(() => setShown(Math.min(initial, totalRef.current)), [initial]);
  return { shown, advance, showAll, reset, done: shown >= total };
}
