import { memo, useMemo } from 'react';

export type Palette = Record<string, string>;

/**
 * Renders a pixel map (array of strings, one char per pixel, '.' = empty) as crisp SVG.
 * Pixels of the same colour are merged into one <path> so large scenes stay cheap.
 */
export const Sprite = memo(function Sprite({
  map,
  pal,
  px = 4,
  flip = false,
  className,
  title,
}: {
  map: string[];
  pal: Palette;
  px?: number;
  flip?: boolean;
  className?: string;
  title?: string;
}) {
  const w = Math.max(...map.map((r) => r.length));
  const h = map.length;
  const paths = useMemo(() => {
    const byColour = new Map<string, string>();
    map.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        const c = pal[ch];
        if (!c || ch === '.') return;
        const xx = flip ? w - 1 - x : x;
        byColour.set(c, (byColour.get(c) ?? '') + `M${xx} ${y}h1v1h-1z`);
      }),
    );
    return [...byColour.entries()];
  }, [map, pal, flip, w]);
  return (
    <svg
      className={`pixel h-auto max-w-full ${className ?? ''}`}
      width={w * px}
      height={h * px}
      viewBox={`0 0 ${w} ${h}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {paths.map(([c, d]) => (
        <path key={c} d={d} fill={c} />
      ))}
    </svg>
  );
});

/** Same as Sprite but returns an SVG <g> for use inside a larger SVG scene. */
export function SpriteG({ map, pal, px = 4, flip = false, x = 0, y = 0 }: { map: string[]; pal: Palette; px?: number; flip?: boolean; x?: number; y?: number }) {
  const w = Math.max(...map.map((r) => r.length));
  const byColour = new Map<string, string>();
  map.forEach((row, yy) =>
    [...row].forEach((ch, xx) => {
      const c = pal[ch];
      if (!c || ch === '.') return;
      const X = flip ? w - 1 - xx : xx;
      byColour.set(c, (byColour.get(c) ?? '') + `M${X} ${yy}h1v1h-1z`);
    }),
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${px})`} shapeRendering="crispEdges">
      {[...byColour.entries()].map(([c, d]) => (
        <path key={c} d={d} fill={c} />
      ))}
    </g>
  );
}
