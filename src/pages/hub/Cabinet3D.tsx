import type { ReactNode } from 'react';

/*
 * Turns a flat cabinet drawing into a 3D box on a curved arcade floor.
 *
 * The row (.arcade-row in index.css) is the camera: it sets `perspective`. Each cabinet is
 * rotated to face the middle of the room, more the further it stands from the centre, and nudged
 * forward so the row forms a gentle arc. Both side panels are real faces folded back 90° from the
 * cabinet's straight outer edges; perspective decides which one shows (the outer one).
 * Everything is CSS 3D: no images, and the screen link on the front stays clickable.
 * Below the lg breakpoint the row scrolls sideways and the 3D is switched off.
 */

/* The front art is a 200 × 452 composition (cabinet 400 + stool). Its side panels run
   straight from x = 6 to x = 194, y = 8 to y = 392: the 3D sides attach exactly there. */
const W = 200;
const H = 452;
const EDGE = 6;
const TOP = 8;
const BOTTOM = 392;
/** Depth of the cabinet in the same units as the 200-wide front. */
const DEPTH = 96;

/**
 * Side panel in a DEPTH × (BOTTOM − TOP) box; x = 0 is the FRONT edge (flush with the front face),
 * x = DEPTH the back. The top slopes down toward the back, like a real upright.
 */
function SidePanel({ side, paint }: { side: 'left' | 'right'; paint: { side: string; trim: string; body: string } }) {
  const h = BOTTOM - TOP;
  const outline = `M0 0 L${DEPTH * 0.55} 0 L${DEPTH} ${h * 0.12} L${DEPTH} ${h} L0 ${h} Z`;
  const inner = `M3 3 L${DEPTH * 0.55 - 1} 3 L${DEPTH - 3} ${h * 0.12 + 1} L${DEPTH - 3} ${h - 3} L3 ${h - 3} Z`;
  return (
    <div
      aria-hidden
      className={`cab3d-side cab3d-side-${side}`}
      style={{
        top: `${(TOP / H) * 100}%`,
        height: `${(h / H) * 100}%`,
        width: `${(DEPTH / W) * 100}%`,
        [side]: `${(EDGE / W) * 100}%`,
      }}
    >
      {/* A face folded back from the left edge is seen from behind, which mirrors it, so its x = 0
          already sits next to the front. The right face is folded the other way, so flip its art. */}
      <svg viewBox={`0 0 ${DEPTH} ${h}`} preserveAspectRatio="none" className="block h-full w-full" style={side === 'right' ? { transform: 'scaleX(-1)' } : undefined}>
        <path d={outline} fill="#0f0d22" />
        <path d={inner} fill={paint.side} />
        {/* light falls off toward the back */}
        <path d={`M${DEPTH * 0.5} 3 L${DEPTH - 3} 3 L${DEPTH - 3} ${h - 3} L${DEPTH * 0.5} ${h - 3} Z`} fill="#0f0d22" opacity="0.18" />
        {/* side art: a stripe and a pixel star in the trim colour */}
        <path d={`M3 ${h * 0.62} L${DEPTH - 3} ${h * 0.5} L${DEPTH - 3} ${h * 0.56} L3 ${h * 0.68} Z`} fill={paint.trim} opacity="0.55" />
        <g transform={`translate(${DEPTH * 0.45} ${h * 0.3})`} fill={paint.trim} opacity="0.8">
          <rect x="-4" y="-16" width="8" height="32" />
          <rect x="-16" y="-4" width="32" height="8" />
          <rect x="-10" y="-10" width="20" height="20" />
        </g>
        {/* T-molding along the front edge, matching the trim strip on the front art */}
        <rect x="0" y="0" width="3" height={h} fill={paint.trim} opacity="0.8" />
      </svg>
    </div>
  );
}

/**
 * Wraps one cabinet. `k` is its position from the centre of the row
 * (e.g. −2.5 … 2.5 for six machines); 0 faces the viewer straight on.
 */
export function Cabinet3D({ k, paint, children }: { k: number; paint: { side: string; trim: string; body: string }; children: ReactNode }) {
  const ry = -k * 18; // degrees: left machines turn right, right machines turn left
  const tz = k * k * 2; // px: the ends of the row come forward, making an arc
  return (
    <div className="cab3d" style={{ ['--ry' as string]: `${ry}deg`, ['--tz' as string]: `${tz}px` }}>
      <SidePanel side="left" paint={paint} />
      <SidePanel side="right" paint={paint} />
      <div className="cab3d-front">{children}</div>
    </div>
  );
}
