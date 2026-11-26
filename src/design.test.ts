import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guards the pixel + comic visual system: spacing scale, no emoji as icons (pixel sprites instead),
 * no soft glows or smooth gradients (hard comic shadows and halftone dots only), nothing looping forever.
 */
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx|css)$/.test(p) ? [p] : [];
  });
}
const src = files('src').map((p) => ({ p, s: readFileSync(p, 'utf8') }));
const ALLOWED = new Set(['0', 'px', '1', '2', '3', '4', '6', '8', '12', '16', '24']);

describe('design system', () => {
  it('padding, margin and gaps stay on 4/8/12/16/24/32/48/64/96', () => {
    const bad: string[] = [];
    for (const { p, s } of src)
      for (const m of s.matchAll(/(?<![\w-])-?(?:space-x|space-y|gap-x|gap-y|gap|px|py|pt|pb|pl|pr|p|mx|my|mt|mb|ml|mr|m)-([\w.[\]]+)/g))
        if (!ALLOWED.has(m[1]) && m[1] !== 'auto') bad.push(`${p}: ${m[0]}`);
    expect(bad).toEqual([]);
  });
  it('no emoji used as icons', () => {
    const bad = src.filter(({ s }) => /\p{Extended_Pictographic}/u.test(s.replace(/[←→↑↓−–—·×◀▶▪★]/g, ''))).map(({ p }) => p);
    expect(bad).toEqual([]);
  });
  // The home page (arcade floor) deliberately uses a gradient title, neon glow and a floor glow;
  // the game screens stay flat: hard comic shadows and halftone only.
  it('game screens: no soft glows, blur or smooth gradients', () => {
    const bad = src.filter(({ p }) => p.startsWith('src/games/') || p.startsWith('src/components/')).filter(({ s }) => /linear-gradient|bg-gradient|blur|shadow-(sm|md|lg|xl|2xl|inner)\b|drop-shadow|text-transparent|0 0 \d+px/.test(s)).map(({ p }) => p);
    expect(bad).toEqual([]);
  });
  it('nothing animates forever', () => {
    expect(src.filter(({ s }) => /repeat:\s*Infinity|animate-(pulse|bounce|spin|ping)/.test(s)).map(({ p }) => p)).toEqual([]);
  });
});
