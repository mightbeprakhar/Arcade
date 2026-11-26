import { useEffect, useRef } from 'react';

/**
 * When an element appears because the presenter revealed it (→ / Space / a button),
 * scroll it into view so it is visible on a 720p projector. The bottom presenter bar
 * is kept clear with scroll-margin (see .reveal in index.css).
 */
export function useRevealScroll<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    const id = requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    return () => cancelAnimationFrame(id);
  }, [enabled]);
  return ref;
}
