import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Renders its child at natural size, and if that is wider than the available space,
 * scales it down (crisply, with a CSS transform) so it always fits: nothing is ever
 * clipped or needs horizontal scrolling. The measured scale is exposed as data-fit-scale.
 */
export function FitWidth({ children, align = 'center', className = '' }: { children: ReactNode; align?: 'left' | 'center'; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0, offset: 0 });

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      const natural = i.scrollWidth;
      const avail = o.clientWidth;
      if (!natural || !avail) return;
      const scale = Math.min(1, avail / natural);
      const offset = align === 'center' ? Math.max(0, (avail - natural * scale) / 2) : 0;
      setFit((f) => (Math.abs(f.scale - scale) < 0.001 && Math.abs(f.height - i.offsetHeight * scale) < 0.5 && Math.abs(f.offset - offset) < 0.5 ? f : { scale, height: i.offsetHeight * scale, offset }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [align]);

  return (
    <div ref={outer} className={`fit-width w-full overflow-hidden ${className}`} style={{ height: fit.height || undefined }} data-fit-scale={fit.scale.toFixed(3)}>
      <div ref={inner} style={{ width: 'max-content', transform: `translateX(${fit.offset}px) scale(${fit.scale})`, transformOrigin: 'left top' }}>
        {children}
      </div>
    </div>
  );
}
